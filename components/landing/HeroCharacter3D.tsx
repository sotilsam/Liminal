"use client";

import { SplineScene } from "@/components/ui/splite";
import type { Application } from "@splinetool/runtime";

const SPLINE_SCENE = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

function onSplineLoad(spline: Application) {
  spline.setBackgroundColor("transparent");
}

export function HeroCharacter3D() {
  return (
    <div className="absolute inset-0">
      <SplineScene
        scene={SPLINE_SCENE}
        className="h-full w-full"
        onLoad={onSplineLoad}
      />
    </div>
  );
}
