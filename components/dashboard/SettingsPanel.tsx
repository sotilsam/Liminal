"use client";

import { useTranslations } from "next-intl";
import type { SettingsData } from "@/lib/settings";
import { ProfileSection } from "./settings/ProfileSection";
import { PreferencesSection } from "./settings/PreferencesSection";
import { SecuritySection } from "./settings/SecuritySection";
import { DangerZone } from "./settings/DangerZone";
import { TherapistSection } from "./settings/TherapistSection";
import { PatientSection } from "./settings/PatientSection";

interface SettingsPanelProps {
  settings: SettingsData;
}

export function SettingsPanel({ settings }: SettingsPanelProps) {
  const t = useTranslations("settings");
  const { userId, role, profile, therapist, patient } = settings;

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-foreground">
          {t("title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Shared: profile */}
      <ProfileSection userId={userId} profile={profile} />

      {/* Role-specific */}
      {role === "therapist" && therapist && (
        <TherapistSection userId={userId} therapist={therapist} />
      )}
      {role === "patient" && patient && (
        <PatientSection userId={userId} patient={patient} />
      )}

      {/* Shared: preferences, security, danger */}
      <PreferencesSection userId={userId} profile={profile} />
      <SecuritySection />
      <DangerZone />
    </section>
  );
}
