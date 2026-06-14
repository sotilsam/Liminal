"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface WelcomeCardProps {
  userName: string;
  /** Which subtitle to show, keyed by dashboard role. */
  variant: "therapist" | "patient" | "experience";
}

export function WelcomeCard({ userName, variant }: WelcomeCardProps) {
  const t = useTranslations("dashboard");

  const subtitleKey =
    variant === "therapist"
      ? "welcome_sub_therapist"
      : variant === "patient"
        ? "welcome_sub_patient"
        : "welcome_sub_experience";
  const subtitle = t(subtitleKey);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-6"
    >
      {/* Soft accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
      />
      <h1 className="font-heading text-2xl font-bold text-foreground">
        {t("welcome", { name: userName })}
      </h1>
      {subtitle && (
        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </motion.section>
  );
}
