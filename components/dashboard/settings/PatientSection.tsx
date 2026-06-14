"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { HeartPulse, Stethoscope, Link2, Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase";
import type { PatientSettings } from "@/lib/settings";
import {
  SettingsCard,
  Field,
  SaveButton,
  StatusMessage,
  inputClass,
  selectClass,
  type SaveStatus,
} from "./primitives";

interface PatientSectionProps {
  userId: string;
  patient: PatientSettings;
}

export function PatientSection({ userId, patient }: PatientSectionProps) {
  const t = useTranslations("settings");
  const tReg = useTranslations("register");
  const router = useRouter();

  const [therapistName, setTherapistName] = useState(patient.therapistName);
  const [linkCode, setLinkCode] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [linked, setLinked] = useState(false);

  const [ampType, setAmpType] = useState(patient.amputationType ?? "");
  const [ampSide, setAmpSide] = useState(patient.amputationSide ?? "");
  const [dob, setDob] = useState(patient.dateOfBirth ?? "");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLink() {
    const code = linkCode.trim();
    if (!code) return;

    setLinking(true);
    setLinkError("");
    setLinked(false);
    try {
      const supabase = createClient();

      const { data: therapist } = await supabase
        .from("therapists")
        .select("id, user_id")
        .eq("therapist_code", code)
        .maybeSingle();

      if (!therapist) {
        setLinkError(t("link_failed"));
        return;
      }

      const { error: updateError } = await supabase
        .from("patients")
        .update({ therapist_id: therapist.id, therapist_code: code })
        .eq("user_id", userId);

      if (updateError) {
        setLinkError(t("link_failed"));
        return;
      }

      const { data: thProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", therapist.user_id)
        .single();

      setTherapistName(thProfile?.full_name ?? code);
      setLinkCode("");
      setLinked(true);
      setTimeout(() => setLinked(false), 2500);
    } finally {
      setLinking(false);
    }
  }

  async function handleSave() {
    setStatus("saving");
    setErrorMsg("");
    const supabase = createClient();

    const patch = {
      amputation_type: ampType || null,
      amputation_side: ampSide || null,
      date_of_birth: dob || null,
    };

    // --- debug: remove once saving is confirmed working ---
    const { data: { user: authUser } } = await supabase.auth.getUser();
    console.log("[PatientSection] auth uid:", authUser?.id);
    console.log("[PatientSection] userId prop:", userId);
    console.log("[PatientSection] patientId:", patient.patientId);
    console.log("[PatientSection] patch:", JSON.stringify(patch));
    // -------------------------------------------------------

    try {
      if (patient.patientId) {
        const { data, error } = await supabase
          .from("patients")
          .update(patch)
          .eq("id", patient.patientId)
          .select("id, amputation_type, amputation_side, date_of_birth");

        console.log("[PatientSection] update result:", { data, error });

        if (error) throw new Error(error.message);
        if (!data || data.length === 0) {
          throw new Error("Update matched 0 rows — RLS may be blocking the write. Check your Supabase policies.");
        }
      } else {
        const { data, error } = await supabase
          .from("patients")
          .insert({ id: crypto.randomUUID(), user_id: userId, ...patch })
          .select("id");

        console.log("[PatientSection] insert result:", { data, error });

        if (error) throw new Error(error.message);
      }

      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("[PatientSection] save failed:", msg);
      setErrorMsg(msg);
      setStatus("error");
    }
  }

  return (
    <>
      {/* My therapist */}
      <SettingsCard
        title={t("my_therapist_title")}
        description={t("my_therapist_desc")}
        icon={Stethoscope}
      >
        {therapistName ? (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {therapistName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t("linked_to")}</p>
              <p className="truncate text-sm font-medium text-foreground">
                {therapistName}
              </p>
            </div>
            {linked && (
              <Check className="ms-auto size-4 shrink-0 text-primary" />
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t("no_therapist")}</p>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[12rem]">
                <Field id="set-link-code" label={t("enter_code")}>
                  <input
                    id="set-link-code"
                    type="text"
                    value={linkCode}
                    onChange={(e) => setLinkCode(e.target.value)}
                    className={inputClass}
                    placeholder="000000"
                  />
                </Field>
              </div>
              <button
                type="button"
                onClick={handleLink}
                disabled={linking || !linkCode.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {linking ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Link2 className="size-4" />
                )}
                {linking ? t("linking") : t("link")}
              </button>
            </div>
            {linkError && (
              <p className="text-xs font-medium text-destructive">{linkError}</p>
            )}
          </div>
        )}
      </SettingsCard>

      {/* Amputation details */}
      <SettingsCard
        title={t("amputation_title")}
        description={t("amputation_desc")}
        icon={HeartPulse}
        footer={
          <>
            <StatusMessage
              status={status}
              errorText={errorMsg || t("save_failed")}
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
          <Field id="set-amp-type" label={t("amputation_type")}>
            <select
              id="set-amp-type"
              value={ampType}
              onChange={(e) => setAmpType(e.target.value)}
              className={selectClass}
            >
              <option value="">—</option>
              <option value="above_knee">{tReg("above_knee")}</option>
              <option value="below_knee">{tReg("below_knee")}</option>
              <option value="above_elbow">{tReg("above_elbow")}</option>
              <option value="below_elbow">{tReg("below_elbow")}</option>
              <option value="other">{tReg("other")}</option>
            </select>
          </Field>
          <Field id="set-amp-side" label={t("amputation_side")}>
            <select
              id="set-amp-side"
              value={ampSide}
              onChange={(e) => setAmpSide(e.target.value)}
              className={selectClass}
            >
              <option value="">—</option>
              <option value="left">{tReg("left")}</option>
              <option value="right">{tReg("right")}</option>
              <option value="bilateral">{tReg("bilateral")}</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field id="set-dob" label={t("dob")}>
              <input
                id="set-dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      </SettingsCard>
    </>
  );
}
