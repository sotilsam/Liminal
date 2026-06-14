"use client";

import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Bounds, Center } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

function Model({ src, margin }: { src: string; margin: number }) {
  const [gltf, setGltf] = useState<GLTF | null>(null);

  useEffect(() => {
    setGltf(null);
    const loader = new GLTFLoader();
    // onError is a no-op — missing files silently show nothing
    loader.load(src, setGltf, undefined, () => {});
  }, [src]);

  if (!gltf) return null;

  return (
    <Bounds fit observe margin={margin}>
      <Center>
        <primitive object={gltf.scene} />
      </Center>
    </Bounds>
  );
}

/**
 * Auto-rotating 3D model preview.
 * @param margin Bounds fit padding — higher zooms out (more of the object visible).
 */
export function LimbViewer3D({ src, margin = 0.85 }: { src: string; margin?: number }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent", width: "100%", height: "100%" }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 2.5;
      }}
    >
      <hemisphereLight args={["#ffffff", "#cccccc", 4]} />
      <directionalLight position={[3, 4, 3]} intensity={4} />
      <directionalLight position={[-3, 2, 2]} intensity={4} />
      <directionalLight position={[0, 3, -4]} intensity={1.5} />
      <Model src={src} margin={margin} />
      <OrbitControls
        makeDefault
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={2}
      />
    </Canvas>
  );
}
