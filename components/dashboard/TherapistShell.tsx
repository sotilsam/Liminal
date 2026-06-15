"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { TherapistHome } from "./TherapistHome";
import { ReportsPanel } from "./ReportsPanel";
import { PatientTable, type LinkedPatient } from "./PatientTable";
import { SettingsPanel } from "./SettingsPanel";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";
import type { SettingsData } from "@/lib/settings";
import type { TherapistHomeData } from "@/lib/therapist-metrics";

interface TherapistShellProps {
  userName: string;
  linkedPatients: LinkedPatient[];
  settings: SettingsData;
  isDemo: boolean;
  homeData: TherapistHomeData;
}

export function TherapistShell({
  userName,
  linkedPatients,
  settings,
  isDemo,
  homeData,
}: TherapistShellProps) {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <OnboardingProvider
      role={settings.role}
      userId={settings.userId}
      onboardingCompleted={settings.profile.onboardingCompleted}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <div className="app-scaled flex h-screen flex-col overflow-hidden bg-background">
        <TopBar
          userName={userName}
          badge="Therapist"
          avatarUrl={settings.profile.avatarUrl}
        />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar type="therapist" activeTab={activeTab} onTabChange={setActiveTab} />
          <main className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
            {activeTab === "home" && (
              <TherapistHome
                userName={userName}
                linkedPatients={linkedPatients}
                isDemo={isDemo}
                homeData={homeData}
                userId={settings.userId}
              />
            )}
            {activeTab === "patients" && (
              <PatientTable linkedPatients={linkedPatients} isDemo={isDemo} />
            )}
            {activeTab === "reports" && <ReportsPanel />}
            {activeTab === "settings" && <SettingsPanel settings={settings} />}
          </main>
        </div>
      </div>
    </OnboardingProvider>
  );
}
