"use client";

import { useTranslations } from "next-intl";
import { mockCurrentPatient } from "@/lib/mock-data";

export function SessionHistory() {
  const t = useTranslations("dashboard");
  const sessions = mockCurrentPatient.sessions;

  return (
    <section>
      <h2 className="mb-4 font-heading text-base font-semibold text-foreground">
        {t("session_history")}
      </h2>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">
                {t("date")}
              </th>
              <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">
                {t("duration")}
              </th>
              <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">
                {t("type")}
              </th>
              <th className="px-4 py-3 text-end text-xs font-semibold text-muted-foreground">
                {t("score")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s, i) => (
              <tr
                key={i}
                className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 text-foreground">{s.date}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.duration}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                    {s.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-end">
                  <span className="font-semibold text-primary">{s.score}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
