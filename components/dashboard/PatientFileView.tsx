"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { type MockPatient } from "@/lib/mock-data";

interface PatientFileViewProps {
  patient: MockPatient;
  onBack: () => void;
}

export function PatientFileView({ patient, onBack }: PatientFileViewProps) {
  const t = useTranslations("dashboard");
  const [notes, setNotes] = useState(patient.notes);

  const chartData = patient.sessions.map((s) => ({
    date: s.date.slice(5),
    score: s.score,
  }));

  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
    >
      {/* Back */}
      <button
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("patients")}
      </button>

      {/* Patient info card */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {patient.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-heading text-base font-semibold text-foreground">
              {patient.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {patient.amputationType} &middot; {t("join_date")}: {patient.joinDate}
            </p>
          </div>
          <div className="ms-auto">
            <span
              className={[
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                patient.status === "active"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {patient.status === "active" ? t("active") : t("inactive")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Progress chart */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h4 className="mb-3 text-sm font-semibold text-foreground">
            {t("progress_over_time")}
          </h4>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.89 0.025 195)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "oklch(0.50 0.03 195)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "oklch(0.50 0.03 195)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid oklch(0.89 0.025 195)",
                  background: "#fff",
                  fontSize: 11,
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="oklch(0.62 0.19 195)"
                strokeWidth={2}
                dot={{ fill: "oklch(0.62 0.19 195)", r: 3, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Notes */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h4 className="mb-3 text-sm font-semibold text-foreground">{t("notes")}</h4>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            className="w-full resize-none rounded-xl border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            placeholder={t("notes_placeholder")}
          />
          <button className="mt-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            {t("save")}
          </button>
        </div>
      </div>

      {/* Session history */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">{t("date")}</th>
              <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">{t("duration")}</th>
              <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">{t("type")}</th>
              <th className="px-4 py-3 text-end text-xs font-semibold text-muted-foreground">{t("score")}</th>
            </tr>
          </thead>
          <tbody>
            {patient.sessions.map((s, i) => (
              <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/25">
                <td className="px-4 py-3 text-foreground">{s.date}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.duration}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                    {s.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-end font-semibold text-primary">{s.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
