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
import { therapistReportMetrics, sessionsPerWeek } from "@/lib/mock-data";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export function ReportsPanel() {
  const t = useTranslations("dashboard");
  const m = therapistReportMetrics;

  const summaryCards = [
    { icon: Users, label: t("total_patients"), value: m.totalPatients },
    { icon: Activity, label: t("active_this_week"), value: m.activeThisWeek },
    { icon: TrendingUp, label: t("avg_progress"), value: `${m.avgProgress}%` },
    { icon: CalendarCheck, label: t("sessions_this_month"), value: m.sessionsThisMonth },
  ];

  return (
    <section className="space-y-6">
      <h2 className="font-heading text-base font-semibold text-foreground">
        {t("reports")}
      </h2>

      {/* Summary cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {summaryCards.map(({ icon: Icon, label, value }) => (
          <motion.div
            key={label}
            variants={cardVariants}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
              <Icon className="size-4 text-primary" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-0.5 font-heading text-2xl font-bold text-foreground">{value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Bar chart */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          {t("sessions_per_week")}
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={sessionsPerWeek} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.89 0.025 195)" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: "oklch(0.50 0.03 195)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "oklch(0.50 0.03 195)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid oklch(0.89 0.025 195)",
                background: "#fff",
                fontSize: 12,
              }}
              cursor={{ fill: "oklch(0.93 0.04 195)", opacity: 0.5 }}
            />
            <Bar
              dataKey="sessions"
              fill="oklch(0.62 0.19 195)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
