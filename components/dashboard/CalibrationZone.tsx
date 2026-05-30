"use client";

import { useTranslations } from "next-intl";
import { Camera } from "lucide-react";

export function CalibrationZone() {
  const t = useTranslations("dashboard");

  return (
    <section>
      <h2 className="mb-4 font-heading text-base font-semibold text-foreground">
        {t("calibration_title")}
      </h2>
      <div className="placeholder-card flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-2xl p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Camera className="size-8 text-muted-foreground/50" />
        </div>
        <div>
          <p className="font-heading text-sm font-semibold text-muted-foreground">
            {t("calibration_title")}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground/70">
            {t("calibration_desc")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
          <span className="text-xs text-muted-foreground/60">MediaPipe</span>
          <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
        </div>
      </div>
    </section>
  );
}
