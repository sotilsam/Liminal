"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center, Bounds, useGLTF } from "@react-three/drei";

function Model() {
  // GLB bundles geometry + materials + textures, so we render it as-is.
  const { scene } = useGLTF("/howarewe.glb");

  return (
    <Bounds fit clip observe margin={1.1}>
      <Center>
        <primitive object={scene} />
      </Center>
    </Bounds>
  );
}

useGLTF.preload("/howarewe.glb");

export function HowAreWe3D() {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 6], fov: 40 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} />
      <directionalLight position={[-5, 2, -4]} intensity={0.4} color="#a855f7" />
      {/* Fill light from below-front to lift shadows on the legs */}
      <directionalLight position={[3, -3, 5]} intensity={0.7} />

      <Suspense fallback={null}>
        <Model />
      </Suspense>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
      />
    </Canvas>
  );
}
