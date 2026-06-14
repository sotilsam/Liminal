import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { POSE, getIntactConfig, getAffectedConfig } from './landmarks.js';

const px    = (lm, w, h) => ({ x: lm.x * w, y: lm.y * h });
const ok    = (lm) => (lm?.visibility ?? 1) > 0.5;
const dist  = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const midpt = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const toSc  = (p, w, h) => ({ x: p.x - w / 2, y: h / 2 - p.y });

// Exponential moving average smoothing factor (ported from mirror_motion_ar.py).
const SMOOTH_FACTOR = 0.35;

function chainLen(lms, chain, w, h) {
  let len = 0;
  for (let i = 0; i < chain.length - 1; i++)
    len += dist(px(lms[chain[i]], w, h), px(lms[chain[i + 1]], w, h));
  return len;
}

function makeMat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: .55, metalness: .05, transparent: true, opacity: .88, ...opts });
}

function buildPlaceholder(limbType, level) {
  const g = new THREE.Group();
  const s = makeMat(0x2dd4bf);
  const j = makeMat(0xa78bfa, { roughness: .4 });

  if (limbType === 'arm' && level === 'above_elbow') {
    g.add(mesh(new THREE.CylinderGeometry(22,18,120,24), s, 0,-60,0));
    g.add(mesh(new THREE.SphereGeometry(18,24,24), j, 0,-120,0));
    g.add(mesh(new THREE.CylinderGeometry(17,13,110,24), s, 0,-175,0));
    g.add(mesh(new THREE.BoxGeometry(24,30,14), j, 0,-240,0));
  } else if (limbType === 'arm') {
    g.add(mesh(new THREE.CylinderGeometry(17,13,110,24), s, 0,-55,0));
    g.add(mesh(new THREE.BoxGeometry(24,30,14), j, 0,-120,0));
  } else if (level === 'above_knee') {
    g.add(mesh(new THREE.CylinderGeometry(34,26,150,24), s, 0,-75,0));
    g.add(mesh(new THREE.SphereGeometry(26,24,24), j, 0,-150,0));
    g.add(mesh(new THREE.CylinderGeometry(24,17,150,24), s, 0,-225,0));
    g.add(mesh(new THREE.BoxGeometry(34,24,70), j, 0,-305,20));
  } else {
    g.add(mesh(new THREE.CylinderGeometry(24,17,150,24), s, 0,-75,0));
    g.add(mesh(new THREE.BoxGeometry(34,24,70), j, 0,-155,20));
  }
  return g;
}
function mesh(geo, mat, x, y, z) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; }

export class AREngine {
  constructor() {
    this.renderer = null;
    this.scene = new THREE.Scene();
    this.camera = null;
    this.limbGroup = new THREE.Group();
    this.modelHeight = 1;
    this.calibration = null;
    this.w = 0; this.h = 0;
    this._scaleMultiplier = 1;  // per-model size fine-tune (from limbModels config)

    // EMA smoothing state, keyed by landmark index (pixel-space).
    // _frame / _frameSeen ensure each landmark is smoothed at most once per frame
    // even if read several times (anchor + torso + direction).
    this._smooth = {};
    this._frameSeen = {};
    this._frame = 0;

    this.scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const d = new THREE.DirectionalLight(0xffffff, 1.4);
    d.position.set(0.4, 1, 1);
    this.scene.add(d);
    this.limbGroup.visible = false;
    this.scene.add(this.limbGroup);
  }

  init(canvas) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  resize(w, h) {
    this.w = w; this.h = h;
    this._smooth = {}; this._frameSeen = {};  // pixel-space state is stale at a new size
    this.camera = new THREE.OrthographicCamera(-w/2, w/2, h/2, -h/2, 1, 4000);
    this.camera.position.z = 1000;
    this.renderer?.setSize(w, h, false);
  }

  setLimb(limbType, level, modelUrl) {
    this.resetCalibration();
    this._scaleMultiplier = 1;
    if (modelUrl) {
      new GLTFLoader().load(modelUrl,
        (gltf) => this._mount(gltf.scene), undefined,
        () => this._mount(buildPlaceholder(limbType, level)));
    } else {
      this._mount(buildPlaceholder(limbType, level));
    }
  }

  // Like setLimb, but driven by a model config object (see lib/limbModels.js):
  // applies the per-model rotationOffset and scaleMultiplier. Falls back to the
  // procedural placeholder if the GLB has no url or fails to load.
  setLimbWithConfig(config) {
    this.resetCalibration();
    this._scaleMultiplier = config?.scaleMultiplier ?? 1;
    const rot = config?.rotationOffset || { x: 0, y: 0, z: 0 };
    if (config?.url) {
      new GLTFLoader().load(config.url,
        (gltf) => this._mount(gltf.scene, rot), undefined,
        () => this._mount(buildPlaceholder(config.limbType, config.level)));
    } else {
      this._mount(buildPlaceholder(config.limbType, config.level));
    }
  }

  // Center the model so the TOP of its bounding box (the joint / attachment point)
  // sits at the group origin, with the limb extending downward (-Y). rotationOffset
  // is applied first via a pivot wrapper so an arbitrarily-oriented GLB can be
  // corrected before measuring and centering.
  _mount(obj, rotationOffset = { x: 0, y: 0, z: 0 }) {
    this.limbGroup.clear();

    const pivot = new THREE.Group();
    pivot.rotation.set(rotationOffset.x || 0, rotationOffset.y || 0, rotationOffset.z || 0);
    pivot.add(obj);
    pivot.updateMatrixWorld(true);

    // Box3 over the rotated pivot, then shift the pivot so center X/Z = 0 and
    // the box top = 0 (limb hangs down).
    const box = new THREE.Box3().setFromObject(pivot);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    pivot.position.x -= center.x;
    pivot.position.z -= center.z;
    pivot.position.y -= box.max.y;

    this.modelHeight = size.y || 1;
    this.limbGroup.add(pivot);
  }

  // Runs automatically every frame until it succeeds. No user action needed:
  // the patient's injury comes from their profile, so we just measure or estimate
  // the limb length as soon as the torso is in frame.
  autoCalibrate(landmarks, limbType, level, affectedSide) {
    if (!landmarks) return { success: false };
    const { w, h } = this;

    // 1. Torso must be visible (both shoulders + both hips) — it's our reference scale.
    const torsoOk = [POSE.SHOULDER_L, POSE.SHOULDER_R, POSE.HIP_L, POSE.HIP_R].every(i => ok(landmarks[i]));
    if (!torsoOk) return { success: false };

    const sC = midpt(px(landmarks[POSE.SHOULDER_L], w, h), px(landmarks[POSE.SHOULDER_R], w, h));
    const hC = midpt(px(landmarks[POSE.HIP_L], w, h), px(landmarks[POSE.HIP_R], w, h));
    const torsoLenPx = dist(sC, hC);

    // 2. Prefer measuring the intact (opposite) side if it's fully visible.
    const intact = getIntactConfig(limbType, level, affectedSide);
    if (intact && intact.chain.every(i => ok(landmarks[i]))) {
      const limbLenPx = chainLen(landmarks, intact.chain, w, h);
      this.calibration = { limbLenPx, torsoLenPx, method: 'measured' };
      return { success: true, method: 'measured' };
    }

    // 3. Otherwise estimate from average anatomical ratios relative to torso length.
    const RATIOS = {
      leg: { above_knee: 1.55, below_knee: 0.75 },
      arm: { above_elbow: 1.1, below_elbow: 0.52 },
    };
    const ratio = RATIOS[limbType]?.[level];
    if (!ratio) return { success: false };
    this.calibration = { limbLenPx: torsoLenPx * ratio, torsoLenPx, method: 'estimated' };
    return { success: true, method: 'estimated' };
  }

  resetCalibration() { this.calibration = null; this.limbGroup.visible = false; }

  // Ported from get_lm(): returns the EMA-smoothed pixel position of a landmark,
  // or null if it's below the visibility threshold. Smoothing is applied at most
  // once per frame per landmark (guarded by _frameSeen) so reads don't compound.
  _getLm(landmarks, idx, w, h, minVis = 0.5) {
    const p = landmarks?.[idx];
    if (!p || (p.visibility ?? 1) < minVis) return null;
    if (this._frameSeen[idx] === this._frame && this._smooth[idx]) {
      return { ...this._smooth[idx] };
    }
    const raw = { x: p.x * w, y: p.y * h };
    const prev = this._smooth[idx];
    const s = prev
      ? { x: SMOOTH_FACTOR * raw.x + (1 - SMOOTH_FACTOR) * prev.x,
          y: SMOOTH_FACTOR * raw.y + (1 - SMOOTH_FACTOR) * prev.y }
      : raw;
    this._smooth[idx] = s;
    this._frameSeen[idx] = this._frame;
    return { ...s };
  }

  // Ported from get_attach_info(): limb-specific direction (in pixel space, y-down)
  // computed from the AFFECTED side's own landmarks, with the same fallback chains.
  // Returns null when the required anchor landmark isn't visible.
  _limbDirection(landmarks, limbType, level, affectedSide, w, h) {
    const R = affectedSide === 'right';
    const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });

    if (limbType === 'arm') {
      const shoulder = this._getLm(landmarks, R ? POSE.SHOULDER_R : POSE.SHOULDER_L, w, h, 0.3);
      const elbow    = this._getLm(landmarks, R ? POSE.ELBOW_R    : POSE.ELBOW_L,    w, h, 0.3);
      const wrist    = this._getLm(landmarks, R ? POSE.WRIST_R    : POSE.WRIST_L,    w, h, 0.3);

      if (level === 'below_elbow') {
        // Below elbow: attach at elbow, continue the upper-arm direction.
        if (!elbow) return null;
        return shoulder ? sub(elbow, shoulder) : { x: 0, y: 1 };
      }
      // Above elbow: attach at shoulder, full arm.
      if (!shoulder) return null;
      if (wrist) return sub(wrist, shoulder);
      if (elbow) return sub(elbow, shoulder);
      const hip     = this._getLm(landmarks, R ? POSE.HIP_R : POSE.HIP_L, w, h, 0.3);
      const otherSh = this._getLm(landmarks, R ? POSE.SHOULDER_L : POSE.SHOULDER_R, w, h, 0.3);
      if (hip) return sub(hip, shoulder);
      if (otherSh) {
        // Perpendicular to the shoulder line, flipped to point downward.
        const sv = sub(otherSh, shoulder);
        let d = { x: -sv.y, y: sv.x };
        if (d.y < 0) d = { x: -d.x, y: -d.y };
        return d;
      }
      return { x: 0, y: 1 };
    }

    // Legs — lower visibility threshold (MediaPipe scores them below upper body).
    const hip   = this._getLm(landmarks, R ? POSE.HIP_R   : POSE.HIP_L,   w, h, 0.1);
    const knee  = this._getLm(landmarks, R ? POSE.KNEE_R  : POSE.KNEE_L,  w, h, 0.1);
    const ankle = this._getLm(landmarks, R ? POSE.ANKLE_R : POSE.ANKLE_L, w, h, 0.1);

    if (level === 'below_knee') {
      // Below knee: attach at knee, continue the thigh line (or knee→ankle).
      if (!knee) return null;
      if (ankle) return sub(ankle, knee);
      if (hip) return sub(knee, hip);
      return { x: 0, y: 1 };
    }
    // Above knee: attach at hip, full leg.
    if (!hip) return null;
    if (ankle) return sub(ankle, hip);
    if (knee) return sub(knee, hip);
    return { x: 0, y: 1 };
  }

  update(landmarks, limbType, level, affectedSide) {
    if (!this.calibration || !landmarks) { this.limbGroup.visible = false; return; }
    const aff = getAffectedConfig(limbType, level, affectedSide);
    if (!aff) { this.limbGroup.visible = false; return; }
    const a = landmarks[aff.anchor];
    if (!ok(a) || !ok(landmarks[POSE.SHOULDER_L]) || !ok(landmarks[POSE.SHOULDER_R])) {
      this.limbGroup.visible = false; return;
    }
    const { w, h } = this;
    this._frame++;  // new frame: each landmark gets smoothed once

    // Anchor + torso, read through EMA smoothing so they follow the body smoothly.
    const anchor = this._getLm(landmarks, aff.anchor, w, h, 0) ?? px(a, w, h);
    const sC = midpt(this._getLm(landmarks, POSE.SHOULDER_L, w, h, 0), this._getLm(landmarks, POSE.SHOULDER_R, w, h, 0));
    const hC = midpt(this._getLm(landmarks, POSE.HIP_L, w, h, 0), this._getLm(landmarks, POSE.HIP_R, w, h, 0));

    // Orientation: limb-specific direction from the affected side's own landmarks
    // (ported from get_attach_info). Direction is in pixel space (y-down) — flip y
    // to scene space (y-up). Fall back to the body-down midpoint axis if the
    // affected-side landmarks aren't available.
    const dirPx = this._limbDirection(landmarks, limbType, level, affectedSide, w, h);
    const down = dirPx
      ? { x: dirPx.x, y: -dirPx.y }
      : { x: hC.x - sC.x, y: sC.y - hC.y };
    this.limbGroup.rotation.z = Math.atan2(down.y, down.x) + Math.PI / 2;

    const torsoNow = dist(sC, hC);
    const lenPx = this.calibration.limbLenPx * (torsoNow / this.calibration.torsoLenPx);
    const s = (lenPx / this.modelHeight) * this._scaleMultiplier;
    this.limbGroup.scale.set(s, s, s);
    const sc = toSc(anchor, w, h);
    this.limbGroup.position.set(sc.x, sc.y, 0);
    this.limbGroup.visible = true;
  }

  render() { if (this.renderer && this.camera) this.renderer.render(this.scene, this.camera); }
  dispose() { this.renderer?.dispose(); this.scene.clear(); }
}
