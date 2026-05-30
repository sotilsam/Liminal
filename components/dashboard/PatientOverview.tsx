"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { CalendarDays, Target, TrendingUp } from "lucide-react";
import { mockCurrentPatient } from "@/lib/mock-data";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export function PatientOverview() {
  const t = useTranslations("dashboard");
  const patient = mockCurrentPatient;
  const nextSession = "2026-06-02";

  const cards = [
    {
      icon: Target,
      label: t("current_program"),
      value: patient.amputationType,
      sub: "Rehabilitation",
    },
    {
      icon: CalendarDays,
      label: t("next_session"),
      value: nextSession,
      sub: "10:00 AM",
    },
    {
      icon: TrendingUp,
      label: t("progress"),
      value: `${patient.progress}%`,
      sub: "+5% this week",
    },
  ];

  return (
    <section>
      <h2 className="mb-4 font-heading text-base font-semibold text-foreground">
        {t("overview")}
      </h2>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-3"
      >
        {cards.map(({ icon: Icon, label, value, sub }) => (
          <motion.div
            key={label}
            variants={cardVariants}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
              <Icon className="size-4 text-primary" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-0.5 font-heading text-lg font-bold text-foreground">{value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground/70">{sub}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
