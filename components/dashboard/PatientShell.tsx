"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BookOpen } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { PatientOverview } from "./PatientOverview";
import { ProgressChart } from "./ProgressChart";
import { LimbGrid } from "./LimbGrid";
import { TrainingGoals } from "./TrainingGoals";
import { SessionHistory } from "./SessionHistory";
import { SettingsPanel } from "./SettingsPanel";

function ProgramPlaceholder() {
  const t = useTranslations("dashboard");
  return (
    <section>
      <h2 className="mb-4 font-heading text-base font-semibold text-foreground">
        {t("my_program")}
      </h2>
      <div className="placeholder-card flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-2xl p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <BookOpen className="size-8 text-muted-foreground/50" />
        </div>
        <div>
          <p className="font-heading text-sm font-semibold text-muted-foreground">
            {t("my_program")}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground/70">Coming soon</p>
        </div>
      </div>
    </section>
  );
}

interface PatientShellProps {
  userName: string;
}

export function PatientShell({ userName }: PatientShellProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TopBar userName={userName} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar type="patient" activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-y-auto px-6 py-8 space-y-10">
          {activeTab === "overview" && (
            <>
              <PatientOverview />
              <ProgressChart />
            </>
          )}
          {activeTab === "program" && <ProgramPlaceholder />}
          {activeTab === "limbs" && <LimbGrid />}
          {activeTab === "training" && (
            <>
              <TrainingGoals />
              <SessionHistory />
            </>
          )}
          {activeTab === "progress" && (
            <>
              <ProgressChart />
              <SessionHistory />
            </>
          )}
          {activeTab === "settings" && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
}
