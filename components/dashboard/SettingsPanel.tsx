"use client";

import { useTranslations } from "next-intl";
import { Settings } from "lucide-react";

export function SettingsPanel() {
  const t = useTranslations("dashboard");

  return (
    <section>
      <h2 className="mb-4 font-heading text-base font-semibold text-foreground">
        {t("settings")}
      </h2>
      <div className="placeholder-card flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-2xl p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Settings className="size-8 text-muted-foreground/50" />
        </div>
        <div>
          <p className="font-heading text-sm font-semibold text-muted-foreground">
            {t("settings")}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground/70">
            Coming soon
          </p>
        </div>
      </div>
    </section>
  );
}
