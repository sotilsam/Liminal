"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Center, useGLTF } from "@react-three/drei";
import { Box3, Vector3 } from "three";

// Where the intro dolly starts (close, level with the face) and ends (pulled
// back to frame the whole figure). The model is normalized to ~3 units tall
// below, so these distances are stable regardless of the GLB's authored scale.
const CAM_START = new Vector3(0, 1.1, 1.3);
const CAM_END = new Vector3(0, 0.3, 2.9);
const LOOK_START = new Vector3(0, 1.1, 0); // aim at the face up close
const LOOK_END = new Vector3(0, 0, 0); // settle on the center
const INTRO_SECONDS = 2.2;
// Slight forward lean toward the viewer (~9°).
const TILT_X = 0.10;
// Shift the figure down so the top of the head clears the frame.
const Y_OFFSET = -0.2;

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

function Model() {
  const { scene } = useGLTF("/girl.glb");

  // Normalize size once so the camera framing is predictable.
  useMemo(() => {
    const size = new Vector3();
    new Box3().setFromObject(scene).getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    scene.scale.setScalar(3 / maxDim);
    scene.updateMatrixWorld(true);
  }, [scene]);

  return (
    <group rotation={[TILT_X, 0, 0]} position={[0, Y_OFFSET, 0]}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

useGLTF.preload("/girl.glb");

// Camera dolly-out, the same feel as the old Spline robot: starts close to the
// face, then eases away. Lives inside <Suspense> next to <Model/>, so it only
// begins once the GLB has loaded (not while it's still downloading).
function IntroDolly({ onDone }: { onDone: () => void }) {
  const { camera } = useThree();
  const t = useRef(0);
  const target = useRef(new Vector3());

  useFrame((_, delta) => {
    if (t.current >= 1) return;
    t.current = Math.min(1, t.current + delta / INTRO_SECONDS);
    const e = easeOutCubic(t.current);
    camera.position.lerpVectors(CAM_START, CAM_END, e);
    target.current.lerpVectors(LOOK_START, LOOK_END, e);
    camera.lookAt(target.current);
    if (t.current >= 1) onDone();
  });

  return null;
}

export function HeroCharacter3D() {
  // OrbitControls only takes over after the intro finishes, so it doesn't
  // fight the camera animation.
  const [introDone, setIntroDone] = useState(false);

  return (
    <Canvas
      camera={{ position: CAM_START.toArray(), fov: 40 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} />
      <directionalLight position={[-5, 2, -4]} intensity={0.4} color="#a855f7" />
      {/* Fill light from below-front to lift shadows */}
      <directionalLight position={[3, -3, 5]} intensity={0.7} />

      <Suspense fallback={null}>
        <Model />
        <IntroDolly onDone={() => setIntroDone(true)} />
      </Suspense>

      {introDone && (
        <OrbitControls
          makeDefault
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
        />
      )}
    </Canvas>
  );
}
