"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { consumeFirstLogin } from "@/lib/welcome";

interface WelcomeCardProps {
  userName: string;
  /** Current user id — used to consume the one-shot "first login" marker. */
  userId: string;
  /** Which subtitle to show, keyed by dashboard role. */
  variant: "therapist" | "patient" | "experience";
}

export function WelcomeCard({ userName, userId, variant }: WelcomeCardProps) {
  const t = useTranslations("dashboard");

  // Default to "Welcome back"; flip to "Welcome" only on the first dashboard
  // view right after registering. Done in an effect (not during render) to keep
  // SSR/hydration consistent, and guarded so React StrictMode's double-invoke
  // in dev doesn't consume the one-shot marker twice.
  const [firstTime, setFirstTime] = useState(false);
  const consumedRef = useRef(false);
  useEffect(() => {
    if (consumedRef.current) return;
    consumedRef.current = true;
    if (consumeFirstLogin(userId)) setFirstTime(true);
  }, [userId]);

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
        {t(firstTime ? "welcome_first" : "welcome", { name: userName })}
      </h1>
      {subtitle && (
        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </motion.section>
  );
}
