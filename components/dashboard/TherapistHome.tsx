"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Users, Activity, TrendingUp, CalendarCheck } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  therapistReportMetrics,
  sessionsPerWeek,
  recentActivity,
} from "@/lib/mock-data";
import { WelcomeCard } from "./WelcomeCard";
import { TherapistCalendar } from "./TherapistCalendar";
import type { LinkedPatient } from "./PatientTable";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

interface TherapistHomeProps {
  userName: string;
  linkedPatients: LinkedPatient[];
}

export function TherapistHome({ userName, linkedPatients }: TherapistHomeProps) {
  const t = useTranslations("dashboard");
  const m = therapistReportMetrics;

  const stats = [
    {
      icon: Users,
      label: t("total_patients"),
      value: m.totalPatients,
      hint: t("total_patients_hint"),
    },
    {
      icon: Activity,
      label: t("active_this_week"),
      value: m.activeThisWeek,
      hint: t("active_this_week_hint"),
    },
    {
      icon: CalendarCheck,
      label: t("sessions_this_month"),
      value: m.sessionsThisMonth,
      hint: t("sessions_this_month_hint"),
    },
    {
      icon: TrendingUp,
      label: t("avg_progress"),
      value: `${m.avgProgress}%`,
      hint: t("avg_progress_hint"),
    },
  ];

  return (
    <div className="space-y-6">
      <WelcomeCard userName={userName} variant="therapist" />

      {/* Quick stats */}
      <motion.div
        data-tour="therapist-summary"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map(({ icon: Icon, label, value, hint }) => (
          <motion.div
            key={label}
            variants={cardVariants}
            className="group relative rounded-2xl border border-border bg-card p-5"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
              <Icon className="size-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 font-heading text-3xl font-bold text-foreground">
              {value}
            </p>
            <p className="mt-2 text-xs leading-snug text-muted-foreground/70">
              {hint}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Two-week calendar — schedule sessions shared with each patient */}
      <TherapistCalendar linkedPatients={linkedPatients} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent activity */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-heading text-base font-semibold text-foreground">
            {t("recent_activity")}
          </h2>
          {recentActivity.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("recent_activity_empty")}
            </p>
          ) : (
            <ul className="space-y-1">
              {recentActivity.map((a, i) => (
                <motion.li
                  key={`${a.patient}-${a.date}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/40"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
                    {a.patient.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {a.patient}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.type} &middot; {a.duration} &middot; {a.date}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-primary">
                    {a.score}
                  </span>
                </motion.li>
              ))}
            </ul>
          )}
        </section>

        {/* Weekly sessions */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-heading text-base font-semibold text-foreground">
            {t("sessions_per_week")}
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={sessionsPerWeek}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid var(--border)",
                  background: "var(--popover)",
                  color: "var(--popover-foreground)",
                  fontSize: 12,
                }}
                cursor={{ fill: "var(--muted)", opacity: 0.5 }}
              />
              <Bar dataKey="sessions" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}
