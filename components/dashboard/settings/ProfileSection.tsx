"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { User, Upload, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import type { ProfileSettings } from "@/lib/settings";
import {
  SettingsCard,
  Field,
  SaveButton,
  StatusMessage,
  inputClass,
  type SaveStatus,
} from "./primitives";

interface ProfileSectionProps {
  userId: string;
  profile: ProfileSettings;
}

export function ProfileSection({ userId, profile }: ProfileSectionProps) {
  const t = useTranslations("settings");
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");

  const emailChanged = email.trim() !== profile.email;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setStatus("idle");
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadErr) {
        setUploadError(uploadErr.message || t("upload_failed"));
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);

      // Persist immediately so the new picture sticks without a separate
      // "Save changes" — uploading a photo should just work.
      const { error: saveErr } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", userId);

      if (saveErr) {
        setUploadError(saveErr.message || t("upload_failed"));
        return;
      }

      setAvatarUrl(data.publicUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t("upload_failed"));
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function handleRemovePhoto() {
    setRemoving(true);
    setUploadError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", userId);

      if (error) {
        setUploadError(error.message || t("save_failed"));
        return;
      }
      setAvatarUrl(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t("save_failed"));
    } finally {
      setRemoving(false);
    }
  }

  async function handleSave() {
    setStatus("saving");
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          email: email.trim(),
          avatar_url: avatarUrl,
        })
        .eq("id", userId);

      if (error) {
        setStatus("error");
        return;
      }

      if (emailChanged) {
        await supabase.auth.updateUser({ email: email.trim() });
      }

      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  const initial = (fullName || email || "?").charAt(0).toUpperCase();

  return (
    <SettingsCard
      title={t("profile_title")}
      description={t("profile_desc")}
      icon={User}
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
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-xl font-bold text-primary">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            initial
          )}
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">
            {t("profile_picture")}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploading || removing}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              {avatarUrl ? t("change_photo") : t("upload_photo")}
            </button>
            {avatarUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={uploading || removing}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-60"
              >
                {removing ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
                {t("remove_photo")}
              </button>
            )}
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          {uploadError && (
            <p className="text-xs font-medium text-destructive">{uploadError}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="set-name" label={t("full_name")}>
          <input
            id="set-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            autoComplete="name"
          />
        </Field>

        <Field
          id="set-email"
          label={t("email")}
          hint={emailChanged ? t("email_change_note") : undefined}
        >
          <input
            id="set-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            autoComplete="email"
          />
        </Field>
      </div>
    </SettingsCard>
  );
}
