"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { mockPatients, type MockPatient } from "@/lib/mock-data";
import { PatientFileView } from "./PatientFileView";

export interface LinkedPatient {
  id: string;
  user_id: string;
  amputation_type: string | null;
  amputation_side: string | null;
  date_of_birth: string | null;
  // Supabase returns joined rows as an array
  profiles: { full_name: string; email: string }[] | null;
}

interface PatientTableProps {
  linkedPatients?: LinkedPatient[];
}

function toMockShape(p: LinkedPatient): MockPatient {
  const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
  const amputation = [p.amputation_type, p.amputation_side]
    .filter(Boolean)
    .join(" — ");
  return {
    id: p.id,
    name: profile?.full_name ?? profile?.email ?? "Unknown",
    status: "active",
    lastSession: "—",
    progress: 0,
    amputationType: amputation || "—",
    joinDate: p.date_of_birth ?? "—",
    notes: "",
    sessions: [],
    goals: [],
  };
}

export function PatientTable({ linkedPatients }: PatientTableProps) {
  const t = useTranslations("dashboard");
  const [selectedPatient, setSelectedPatient] = useState<MockPatient | null>(null);

  const patients: MockPatient[] =
    linkedPatients !== undefined
      ? linkedPatients.map(toMockShape)
      : mockPatients;

  if (selectedPatient) {
    return (
      <PatientFileView
        patient={selectedPatient}
        onBack={() => setSelectedPatient(null)}
      />
    );
  }

  return (
    <section>
      <h2 className="mb-4 font-heading text-base font-semibold text-foreground">
        {t("patient_control_panel")}
      </h2>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {patients.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            {t("no_patients_yet")}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">
                  {t("patient_name")}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">
                  {t("patient_status")}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                  {t("last_session")}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">
                  {t("patient_progress")}
                </th>
                <th className="px-4 py-3 text-end text-xs font-semibold text-muted-foreground">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient, i) => (
                <motion.tr
                  key={patient.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/25 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
                        {patient.name.charAt(0)}
                      </div>
                      <span className="font-medium text-foreground">{patient.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                        patient.status === "active"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                      ].join(" ")}
                    >
                      {patient.status === "active" ? t("active") : t("inactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {patient.lastSession}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 overflow-hidden rounded-full bg-secondary h-1.5">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${patient.progress}%` }}
                        />
                      </div>
                      <span className="w-8 text-end text-xs font-semibold text-primary">
                        {patient.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button
                      onClick={() => setSelectedPatient(patient)}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/8"
                    >
                      {t("view_file")}
                      <ChevronRight className="size-3.5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
