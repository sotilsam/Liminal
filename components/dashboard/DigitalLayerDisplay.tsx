"use client";

import { useTranslations } from "next-intl";
import { Layers } from "lucide-react";

export function DigitalLayerDisplay() {
  const t = useTranslations("dashboard");

  return (
    <section>
      <h2 className="mb-4 font-heading text-base font-semibold text-foreground">
        {t("ar_overlay_title")}
      </h2>
      <div className="placeholder-card flex min-h-[180px] flex-col items-center justify-center gap-4 rounded-2xl p-8 text-center">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
          <Layers className="size-7 text-muted-foreground/50" />
          {/* Animated rings */}
          <span
            aria-hidden
            className="animate-pulse-ring absolute inset-0 rounded-xl border border-primary/20"
          />
          <span
            aria-hidden
            className="animate-pulse-ring absolute -inset-1.5 rounded-xl border border-primary/10"
            style={{ animationDelay: "0.5s" }}
          />
        </div>
        <div>
          <p className="font-heading text-sm font-semibold text-muted-foreground">
            {t("ar_overlay_title")}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground/70">{t("ar_overlay_desc")}</p>
        </div>
      </div>
    </section>
  );
}
