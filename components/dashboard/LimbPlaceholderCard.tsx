"use client";

import { useTranslations } from "next-intl";
import { Box } from "lucide-react";

interface LimbPlaceholderCardProps {
  label: string;
}

export function LimbPlaceholderCard({ label }: LimbPlaceholderCardProps) {
  const t = useTranslations("dashboard");

  return (
    <div className="placeholder-card flex flex-col items-center gap-3 rounded-2xl p-5 text-center">
      {/* Placeholder box */}
      <div className="flex h-24 w-full items-center justify-center rounded-xl bg-muted/60">
        <Box className="size-8 text-muted-foreground/40" />
      </div>
      {/* Label */}
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-xs text-muted-foreground/60">{t("limb_coming_soon")}</p>
      {/* Disabled select button */}
      <button
        disabled
        className="w-full rounded-lg border border-border bg-muted py-1.5 text-xs font-medium text-muted-foreground/50 cursor-not-allowed"
      >
        {t("select")}
      </button>
    </div>
  );
}
