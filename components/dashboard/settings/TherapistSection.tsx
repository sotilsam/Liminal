"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Building2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { generateUniqueTherapistCode } from "@/lib/therapist-code";
import type { TherapistSettings } from "@/lib/settings";
import {
  SettingsCard,
  Field,
  SaveButton,
  StatusMessage,
  ReadOnlyValue,
  inputClass,
  type SaveStatus,
} from "./primitives";

interface TherapistSectionProps {
  userId: string;
  therapist: TherapistSettings;
}

export function TherapistSection({ userId, therapist }: TherapistSectionProps) {
  const t = useTranslations("settings");
  const router = useRouter();

  const [code, setCode] = useState(therapist.code);
  const [copied, setCopied] = useState(false);
  const [regenOpen, setRegenOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [codeError, setCodeError] = useState(false);

  const [clinic, setClinic] = useState(therapist.clinicName ?? "");
  const [specialization, setSpecialization] = useState(
    therapist.specialization ?? ""
  );
  const [status, setStatus] = useState<SaveStatus>("idle");

  function handleCopy() {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Generate a fresh code and persist it. Returns true only when a row was
  // actually updated — a silent 0-row update (e.g. RLS) is treated as failure
  // so the UI never pretends a code was saved when it wasn't.
  async function persistNewCode(): Promise<boolean> {
    const supabase = createClient();
    const newCode = await generateUniqueTherapistCode(supabase);
    const { data, error } = await supabase
      .from("therapists")
      .update({ therapist_code: newCode })
      .eq("user_id", userId)
      .select("therapist_code");

    if (error || !data || data.length === 0) return false;
    setCode(newCode);
    return true;
  }

  async function handleGenerate() {
    setCodeError(false);
    setGenerating(true);
    try {
      if (!(await persistNewCode())) setCodeError(true);
    } finally {
      setGenerating(false);
    }
  }

  async function handleRegenerate() {
    setCodeError(false);
    setRegenerating(true);
    try {
      const ok = await persistNewCode();
      setRegenOpen(false);
      if (!ok) setCodeError(true);
    } finally {
      setRegenerating(false);
    }
  }

  async function handleSave() {
    setStatus("saving");
    const supabase = createClient();
    const { error } = await supabase
      .from("therapists")
      .update({
        clinic_name: clinic.trim() || null,
        specialization: specialization.trim() || null,
      })
      .eq("user_id", userId);

    if (error) {
      setStatus("error");
      return;
    }
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2500);
    router.refresh();
  }

  return (
    <>
      {/* Therapist code */}
      <div data-tour="therapist-code">
      <SettingsCard
        title={t("therapist_code_title")}
        description={t("therapist_code_desc")}
        icon={KeyRound}
      >
        {code ? (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 px-6 py-4">
              <span className="font-heading text-3xl font-bold tracking-[0.2em] text-foreground">
                {code}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                aria-label={t("copy")}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {copied ? (
                  <Check className="size-4 text-primary" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setRegenOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <RefreshCw className="size-4" />
              {t("regenerate_code")}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t("no_code_yet")}</p>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {generating ? t("generating") : t("generate_code")}
            </button>
          </div>
        )}
        {codeError && (
          <p className="mt-3 text-xs font-medium text-destructive">
            {t("code_generate_failed")}
          </p>
        )}
      </SettingsCard>
      </div>

      {/* Clinic / license / specialization */}
      <SettingsCard
        title={t("clinic_title")}
        description={t("clinic_desc")}
        icon={Building2}
        footer={
          <>
            <StatusMessage
              status={status}
              errorText={t("save_failed")}
              successText={t("saved")}
            />
            <SaveButton
              status={status}
              onClick={handleSave}
              idleLabel={t("save_changes")}
              savingLabel={t("saving")}
              savedLabel={t("saved")}
            />
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="set-clinic" label={t("clinic_name")}>
            <input
              id="set-clinic"
              type="text"
              value={clinic}
              onChange={(e) => setClinic(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field id="set-spec" label={t("specialization")}>
            <input
              id="set-spec"
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className={inputClass}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label={t("license_number")} hint={t("license_readonly")}>
              <ReadOnlyValue
                value={therapist.licenseNumber ?? t("not_set")}
              />
            </Field>
          </div>
        </div>
      </SettingsCard>

      {/* Regenerate confirmation */}
      <AnimatePresence>
        {regenOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => !regenerating && setRegenOpen(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                    <AlertTriangle className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-heading text-base font-semibold text-foreground">
                      {t("regenerate_confirm_title")}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("regenerate_confirm_desc")}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRegenOpen(false)}
                    disabled={regenerating}
                    className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {regenerating && <Loader2 className="size-4 animate-spin" />}
                    {regenerating ? t("regenerating") : t("regenerate")}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
