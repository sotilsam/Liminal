"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { LimbGrid } from "./LimbGrid";
import { CalibrationZone } from "./CalibrationZone";
import { DigitalLayerDisplay } from "./DigitalLayerDisplay";
import { SettingsPanel } from "./SettingsPanel";
import { WelcomeCard } from "./WelcomeCard";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";
import type { SettingsData } from "@/lib/settings";

interface ExperienceShellProps {
  userName: string;
  settings: SettingsData;
}

export function ExperienceShell({ userName, settings }: ExperienceShellProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <OnboardingProvider
      role={settings.role}
      userId={settings.userId}
      onboardingCompleted={settings.profile.onboardingCompleted}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <div className="app-scaled flex h-screen flex-col overflow-hidden bg-background">
        <TopBar userName={userName} avatarUrl={settings.profile.avatarUrl} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar type="experience" activeTab={activeTab} onTabChange={setActiveTab} />
          <main className="flex-1 overflow-y-auto px-6 py-8 space-y-10">
            {activeTab === "overview" && (
              <>
                <WelcomeCard
                  userName={userName}
                  userId={settings.userId}
                  variant="experience"
                />
                <div data-tour="experience-start">
                  <LimbGrid userId={settings.userId} />
                </div>
              </>
            )}
            {activeTab === "design" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <CalibrationZone />
                <DigitalLayerDisplay />
              </div>
            )}
            {activeTab === "settings" && <SettingsPanel settings={settings} />}
          </main>
        </div>
      </div>
    </OnboardingProvider>
  );
}
