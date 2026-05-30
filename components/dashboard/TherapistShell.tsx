"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { ReportsPanel } from "./ReportsPanel";
import { PatientTable, type LinkedPatient } from "./PatientTable";
import { RemotePlanBuilder } from "./RemotePlanBuilder";
import { SettingsPanel } from "./SettingsPanel";

interface TherapistShellProps {
  userName: string;
  therapistCode: string | null;
  linkedPatients: LinkedPatient[];
}

function TherapistCodeCard({ code }: { code: string }) {
  const t = useTranslations("dashboard");
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-5 flex items-center justify-between gap-4">
      <div className="space-y-0.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("your_code")}
        </p>
        <p className="font-heading text-3xl font-bold tracking-[0.18em] text-foreground">
          {code}
        </p>
        <p className="text-xs text-muted-foreground">{t("code_share_hint")}</p>
      </div>
      <button
        onClick={handleCopy}
        aria-label="Copy code"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}

export function TherapistShell({ userName, therapistCode, linkedPatients }: TherapistShellProps) {
  const [activeTab, setActiveTab] = useState("home");

  const patientTable = <PatientTable linkedPatients={linkedPatients} />;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TopBar userName={userName} badge="Therapist" />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar type="therapist" activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
          {activeTab === "home" && (
            <>
              {therapistCode && <TherapistCodeCard code={therapistCode} />}
              <ReportsPanel />
              {patientTable}
              <RemotePlanBuilder />
            </>
          )}
          {activeTab === "patients" && patientTable}
          {activeTab === "files" && patientTable}
          {activeTab === "reports" && <ReportsPanel />}
          {activeTab === "plans" && <RemotePlanBuilder />}
          {activeTab === "settings" && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
}
