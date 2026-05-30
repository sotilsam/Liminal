"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { LimbGrid } from "./LimbGrid";
import { CalibrationZone } from "./CalibrationZone";
import { DigitalLayerDisplay } from "./DigitalLayerDisplay";
import { SettingsPanel } from "./SettingsPanel";

interface ExperienceShellProps {
  userName: string;
}

export function ExperienceShell({ userName }: ExperienceShellProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TopBar userName={userName} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar type="experience" activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-y-auto px-6 py-8 space-y-10">
          {activeTab === "overview" && (
            <>
              <LimbGrid />
              <div className="grid gap-6 lg:grid-cols-2">
                <CalibrationZone />
                <DigitalLayerDisplay />
              </div>
            </>
          )}
          {activeTab === "design" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <DigitalLayerDisplay />
              <CalibrationZone />
            </div>
          )}
          {activeTab === "settings" && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
}
