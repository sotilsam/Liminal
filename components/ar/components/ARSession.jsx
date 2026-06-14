'use client';
import { useRef, useEffect, useState, useCallback } from 'react';
import { PoseLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import { useCamera } from '../hooks/useCamera';
import { useMediaPipe } from '../hooks/useMediaPipe';
import { AREngine } from '../lib/arEngine';
import { getModelByUrl } from '../lib/limbModels';
import styles from './ARSession.module.css';

export default function ARSession({ limbType = 'leg', side = 'right', level = 'above_knee', modelUrl = '' }) {
  const videoRef = useRef(null);
  const threeRef = useRef(null);
  const debugRef = useRef(null);
  const engineRef = useRef(null);
  const drawUtilsRef = useRef(null);
  const configRef = useRef({ limbType, side, level });
  const latestLmRef = useRef(null);
  const showSkRef = useRef(false);

  const cam = useCamera(videoRef);
  const mp = useMediaPipe();

  // null until calibrated, then 'measured' (from intact side) or 'estimated' (ratios)
  const [calibMethod, setCalibMethod] = useState(null);
  const [hint, setHint] = useState('');
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [mirrored, setMirrored] = useState(true);

  useEffect(() => { configRef.current = { limbType, side, level }; }, [limbType, side, level]);
  useEffect(() => { showSkRef.current = showSkeleton; }, [showSkeleton]);

  // Initialize Three
  useEffect(() => {
    if (!threeRef.current) return;
    const engine = new AREngine();
    engine.init(threeRef.current);
    engineRef.current = engine;
    return () => engine.dispose();
  }, []);

  // resize + setLimb
  useEffect(() => {
    const e = engineRef.current;
    if (!e || !cam.videoSize.w) return;
    e.resize(cam.videoSize.w, cam.videoSize.h);
    // If the URL maps to a known model config, apply its rotation/scale tuning;
    // otherwise fall back to the plain url loader (or procedural placeholder).
    const cfg = modelUrl ? getModelByUrl(modelUrl) : null;
    if (cfg) e.setLimbWithConfig(cfg);
    else e.setLimb(limbType, level, modelUrl);
    setCalibMethod(null);
    setHint('');
  }, [cam.videoSize, limbType, level, modelUrl]);

  // debug canvas
  useEffect(() => {
    if (!debugRef.current || !cam.videoSize.w) return;
    debugRef.current.width = cam.videoSize.w;
    debugRef.current.height = cam.videoSize.h;
    drawUtilsRef.current = new DrawingUtils(debugRef.current.getContext('2d'));
  }, [cam.videoSize]);

  // Load MediaPipe
  useEffect(() => { if (cam.isActive) mp.load(); }, [cam.isActive, mp.load]);

  // === Main render loop ===
  useEffect(() => {
    if (!cam.isActive || mp.status !== 'ready') return;
    let raf;
    function loop() {
      const lm = mp.detect(videoRef.current) ?? latestLmRef.current;
      latestLmRef.current = lm;

      const dbg = debugRef.current;
      if (dbg) {
        const ctx = dbg.getContext('2d');
        ctx.clearRect(0, 0, dbg.width, dbg.height);
        if (showSkRef.current && lm && drawUtilsRef.current) {
          drawUtilsRef.current.drawConnectors(lm, PoseLandmarker.POSE_CONNECTIONS,
            { color: 'rgba(167,139,250,.55)', lineWidth: 2 });
          drawUtilsRef.current.drawLandmarks(lm,
            { color: '#2dd4bf', fillColor: '#2dd4bf', radius: 3 });
        }
      }
      const c = configRef.current;
      const engine = engineRef.current;
      // Auto-calibrate every frame until it succeeds — no user action needed.
      if (engine && lm && !engine.calibration) {
        const r = engine.autoCalibrate(lm, c.limbType, c.level, c.side);
        if (r.success) setCalibMethod(r.method);
      }
      engine?.update(lm, c.limbType, c.level, c.side);
      engine?.render();
      raf = requestAnimationFrame(loop);
    }
    loop();
    return () => cancelAnimationFrame(raf);
  }, [cam.isActive, mp.status, mp.detect]);

  // Recalibrate: clear calibration so the loop re-runs autoCalibrate next frame.
  const handleRecalibrate = useCallback(() => {
    engineRef.current?.resetCalibration();
    setCalibMethod(null);
    setHint('');
  }, []);

  const statusText =
    cam.error ? cam.error :
    mp.status === 'loading' ? 'Loading detection engine… (~10 seconds)' :
    mp.status === 'error' ? `Detection error: ${mp.error}` :
    calibMethod === 'measured' ? 'Calibrated' :
    calibMethod === 'estimated' ? 'Calibrated (estimated)' :
    cam.isActive ? 'Detecting body…' :
    'Camera off';

  const isLive = cam.isActive && mp.status === 'ready';

  return (
    <div className={styles.wrap}>
      <div className={styles.stage}>
        <video ref={videoRef} className={`${styles.video} ${mirrored ? styles.mirror : ''}`} playsInline muted />
        <canvas ref={threeRef} className={`${styles.canvas} ${mirrored ? styles.mirror : ''}`} />
        <canvas ref={debugRef} className={`${styles.canvas} ${mirrored ? styles.mirror : ''}`} />
        {!cam.isActive && (
          <div className={styles.empty}>
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
            <p>Tap <b>Open camera</b> to start</p>
          </div>
        )}
        <div className={`${styles.badge} ${isLive ? styles.live : ''}`}>
          <span className={styles.led} />
          <span>{statusText}</span>
        </div>
        {hint && <div className={styles.hint}>{hint}</div>}
      </div>
      <div className={styles.controls}>
        <button className={styles.btnPrimary} onClick={cam.start} disabled={cam.isActive}>Open camera</button>
        <button className={styles.btnDefault} onClick={handleRecalibrate} disabled={!calibMethod}>Recalibrate</button>
        <label className={styles.toggle}>
          <input type="checkbox" checked={showSkeleton} onChange={e => setShowSkeleton(e.target.checked)} /> Show skeleton
        </label>
        <label className={styles.toggle}>
          <input type="checkbox" checked={mirrored} onChange={e => setMirrored(e.target.checked)} /> Mirror mode
        </label>
      </div>
    </div>
  );
}
