"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { HeartPulse, BadgeCheck, Repeat, UserCheck, Info } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  analyticsMetrics,
  progressDistribution,
  sessionsByMonth,
  progressData,
} from "@/lib/mock-data";

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

const tooltipStyle = {
  borderRadius: "0.75rem",
  border: "1px solid var(--border)",
  background: "var(--popover)",
  color: "var(--popover-foreground)",
  fontSize: 12,
};

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

export function ReportsPanel() {
  const t = useTranslations("dashboard");
  const a = analyticsMetrics;

  const metrics = [
    {
      icon: HeartPulse,
      label: t("recovery_rate"),
      value: `${a.recoveryRate}%`,
      hint: t("recovery_rate_hint"),
    },
    {
      icon: BadgeCheck,
      label: t("discharge_ready"),
      value: a.dischargeReady,
      hint: t("discharge_ready_hint"),
    },
    {
      icon: Repeat,
      label: t("avg_sessions"),
      value: a.avgSessionsPerPatient,
      hint: t("avg_sessions_hint"),
    },
    {
      icon: UserCheck,
      label: t("retention"),
      value: `${a.retention}%`,
      hint: t("retention_hint"),
    },
  ];

  return (
    <section className="space-y-6">
      <h2 className="font-heading text-xl font-semibold text-foreground">
        {t("reports")}
      </h2>

      {/* Distinct aggregate metrics */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {metrics.map(({ icon: Icon, label, value, hint }) => (
          <motion.div
            key={label}
            variants={cardVariants}
            className="group relative rounded-2xl border border-border bg-card p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <Icon className="size-5 text-primary" />
              </div>
              <span
                tabIndex={0}
                role="note"
                aria-label={hint}
                title={hint}
                className="text-muted-foreground/50 outline-none transition-colors hover:text-muted-foreground focus-visible:text-muted-foreground"
              >
                <Info className="size-4" />
              </span>
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

      {/* Progress distribution */}
      <ChartCard title={t("progress_distribution")}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={progressDistribution}
            margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="band"
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)", opacity: 0.5 }} />
            <Bar dataKey="patients" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sessions over time */}
        <ChartCard title={t("sessions_over_time")}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={sessionsByMonth}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="sessions"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={{ fill: "var(--primary)", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "var(--primary)", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Recovery trend (average progress over time) */}
        <ChartCard title={t("recovery_trend")}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={progressData}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--chart-2)"
                strokeWidth={2.5}
                dot={{ fill: "var(--chart-2)", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "var(--chart-2)", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}
