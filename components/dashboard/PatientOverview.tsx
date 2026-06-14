"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { CalendarDays, TrendingUp, Stethoscope, Scan, ArrowRight, Box } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { mockCurrentPatient, type LimbModel } from "@/lib/mock-data";
import { getSelectedLimb, getSelectedModelUrl, hasLastModel } from "@/lib/limbSelection";
import { ArModelDialog } from "./ArModelDialog";

// Auto-rotating 3D preview of the patient's limb model. Client-only (WebGL).
const LimbViewer3D = dynamic(
  () => import("./LimbViewer3D").then((m) => m.LimbViewer3D),
  { ssr: false, loading: () => <Box className="size-8 text-muted-foreground/40" /> }
);

interface PatientOverviewProps {
  therapistName?: string | null;
  onOpenLimbs?: () => void;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export function PatientOverview({ therapistName, onOpenLimbs }: PatientOverviewProps) {
  const t = useTranslations("dashboard");
  const patient = mockCurrentPatient;
  const nextSession = "2026-06-02";

  // The limb the patient picked in "Limb Selection" — read on the client.
  const [limb, setLimb] = useState<LimbModel | null>(null);
  // The matching 3D model for that limb, launched into the AR camera.
  const [modelUrl, setModelUrl] = useState<string>("");
  // Returning patients (who have run a session) get the "reuse model?" dialog.
  const [returning, setReturning] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  useEffect(() => {
    setLimb(getSelectedLimb());
    setModelUrl(getSelectedModelUrl() ?? "");
    setReturning(hasLastModel());
  }, []);

  const cards = [
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

  const launchCardClass =
    "group relative block h-full w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/75 p-5 text-start shadow-lg shadow-primary/20 transition-shadow hover:shadow-xl hover:shadow-primary/30";

  // The square launch card content — shared by the link (first-timer) and the
  // dialog trigger (returning patient) so they stay identical.
  const launchInner = (
    <>
      {/* Soft glow accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute -end-12 -top-12 h-40 w-40 rounded-full bg-primary-foreground/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -start-12 h-40 w-40 rounded-full bg-primary-foreground/10 blur-2xl"
      />

      <div className="relative flex h-full flex-col">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/15 text-primary-foreground backdrop-blur-sm">
          <Scan className="size-6" />
        </div>
        <ArrowRight className="absolute end-0 top-1.5 size-5 text-primary-foreground transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
        <div className="mt-auto pt-4">
          <p className="font-heading text-xl font-bold text-primary-foreground">
            {t("ar_launch_title")}
          </p>
          <p className="mt-1 text-sm text-primary-foreground/80">
            {t("ar_launch_tagline")}
          </p>
        </div>
      </div>
    </>
  );

  return (
    <section>
      {/* Linked therapist */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
          {therapistName ? (
            <span className="text-sm font-bold">
              {therapistName.charAt(0).toUpperCase()}
            </span>
          ) : (
            <Stethoscope className="size-5" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            {t("your_therapist")}
          </p>
          {therapistName ? (
            <p className="truncate text-sm font-semibold text-foreground">
              {therapistName}
            </p>
          ) : (
            <p className="truncate text-sm text-muted-foreground">
              {t("not_linked_therapist")}
            </p>
          )}
        </div>
      </div>

      {/* Start AR training — the heart of the product */}
      <motion.div
        data-tour="patient-start"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mb-4 mt-10"
      >
        {limb ? (
          <div className="flex items-stretch gap-4">
            {/* Square launch card */}
            <div className="relative aspect-square w-60 shrink-0">
              {returning ? (
                // Returning patient: ask about reusing their last model before launch.
                <button
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  className={launchCardClass}
                >
                  {launchInner}
                </button>
              ) : (
                // First session for this limb: go straight to AR to pick a model.
                <Link
                  href={{
                    pathname: "/ar-test",
                    query: { limbType: limb.limbType, side: limb.side, level: limb.level, model: modelUrl },
                  }}
                  className={launchCardClass}
                >
                  {launchInner}
                </Link>
              )}
            </div>

            {/* The patient's 3D limb model, rotating beside the launch card */}
            <div
              data-tour="patient-limb"
              className="relative w-48 shrink-0 overflow-hidden rounded-2xl border border-border bg-card"
            >
              <span className="pointer-events-none absolute start-3 top-3 z-10 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t("ar_last_used")}
              </span>
              {modelUrl ? (
                <LimbViewer3D src={modelUrl} margin={1.2} />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Box className="size-10 text-muted-foreground/40" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenLimbs}
            className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-dashed border-primary/40 bg-card p-5 text-start transition-colors hover:bg-secondary/40"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              <Scan className="size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-base font-bold text-foreground">
                {t("ar_launch_title")}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {t("ar_choose_first")}
              </p>
            </div>
            <ArrowRight className="size-5 shrink-0 text-primary transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
          </button>
        )}
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2"
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

      {limb && (
        <ArModelDialog
          limb={limb}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onTryAnother={() => onOpenLimbs?.()}
        />
      )}
    </section>
  );
}
