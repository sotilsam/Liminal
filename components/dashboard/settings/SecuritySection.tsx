"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase";
import {
  SettingsCard,
  Field,
  SaveButton,
  StatusMessage,
  inputClass,
  type SaveStatus,
} from "./primitives";

export function SecuritySection() {
  const t = useTranslations("settings");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState("");

  async function handleSave() {
    setError("");

    if (password.length < 6) {
      setError(t("password_too_short"));
      setStatus("error");
      return;
    }
    if (password !== confirm) {
      setError(t("password_mismatch"));
      setStatus("error");
      return;
    }

    setStatus("saving");
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setStatus("error");
      return;
    }

    setPassword("");
    setConfirm("");
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <SettingsCard
      title={t("security_title")}
      description={t("security_desc")}
      icon={Lock}
      footer={
        <>
          <StatusMessage
            status={status}
            errorText={error || t("save_failed")}
            successText={t("password_updated")}
          />
          <SaveButton
            status={status}
            onClick={handleSave}
            idleLabel={t("update_password")}
            savingLabel={t("saving")}
            savedLabel={t("saved")}
            disabled={!password || !confirm}
          />
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="set-pw" label={t("new_password")}>
          <input
            id="set-pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            autoComplete="new-password"
          />
        </Field>
        <Field id="set-pw-confirm" label={t("confirm_password")}>
          <input
            id="set-pw-confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
            autoComplete="new-password"
          />
        </Field>
      </div>
    </SettingsCard>
  );
}
