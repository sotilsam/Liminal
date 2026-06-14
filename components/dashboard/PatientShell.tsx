"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { PatientOverview } from "./PatientOverview";
import { PatientProgram } from "./PatientProgram";
import { ProgressChart } from "./ProgressChart";
import { LimbGrid } from "./LimbGrid";
import { TrainingGoals } from "./TrainingGoals";
import { SessionHistory } from "./SessionHistory";
import { SettingsPanel } from "./SettingsPanel";
import { WelcomeCard } from "./WelcomeCard";
import { PatientCalendar } from "./PatientCalendar";
import { PatientFeedbackFeed } from "./PatientFeedbackFeed";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";
import { getUnreadFeedbackCount } from "@/lib/feedback";
import type { SettingsData } from "@/lib/settings";

interface PatientShellProps {
  userName: string;
  settings: SettingsData;
}

export function PatientShell({ userName, settings }: PatientShellProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [unreadFeedback, setUnreadFeedback] = useState(0);

  // Seed the sidebar badge before the feed mounts; the feed keeps it in sync.
  useEffect(() => {
    let active = true;
    getUnreadFeedbackCount()
      .then((count) => {
        if (active) setUnreadFeedback(count);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

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
        <Sidebar
          type="patient"
          activeTab={activeTab}
          onTabChange={setActiveTab}
          badges={{ overview: unreadFeedback }}
        />
        <main className="flex-1 overflow-y-auto px-6 py-8 space-y-10">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <WelcomeCard userName={userName} variant="patient" />
              <PatientOverview
                therapistName={settings.patient?.therapistName}
                onOpenLimbs={() => setActiveTab("limbs")}
              />
              <PatientCalendar />
              <PatientFeedbackFeed
                unread={unreadFeedback}
                onUnreadChange={setUnreadFeedback}
              />
            </div>
          )}
          {activeTab === "program" && <PatientProgram />}
          {activeTab === "limbs" && (
            <LimbGrid
              amputationType={settings.patient?.amputationType}
              amputationSide={settings.patient?.amputationSide}
            />
          )}
          {activeTab === "training" && (
            <TrainingGoals patientId={settings.patient?.patientId} />
          )}
          {activeTab === "progress" && (
            <>
              <ProgressChart />
              <SessionHistory />
            </>
          )}
          {activeTab === "settings" && <SettingsPanel settings={settings} />}
        </main>
        </div>
      </div>
    </OnboardingProvider>
  );
}
