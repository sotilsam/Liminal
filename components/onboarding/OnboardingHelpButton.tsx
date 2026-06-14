"use client";

import { useTranslations } from "next-intl";
import { HelpCircle } from "lucide-react";
import { useOnboarding } from "./OnboardingProvider";

/**
 * Persistent "explain the interface" control for the dashboard header.
 * Re-runs the exact same role-aware walkthrough on demand. It never depends on
 * (or resets) the onboarding_completed flag — that gating lives in the provider.
 */
export function OnboardingHelpButton() {
  const t = useTranslations("onboarding");
  const { start } = useOnboarding();

  return (
    <button
      type="button"
      onClick={start}
      aria-label={t("help_label")}
      title={t("help_label")}
      className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <HelpCircle className="size-4" />
    </button>
  );
}
