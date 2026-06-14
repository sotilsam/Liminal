"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Globe, Bell } from "lucide-react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { ProfileSettings } from "@/lib/settings";
import { SettingsCard, Field, Toggle } from "./primitives";

interface PreferencesSectionProps {
  userId: string;
  profile: ProfileSettings;
}

const LANGS = [
  { code: "en", labelKey: "language_en" as const },
  { code: "he", labelKey: "language_he" as const },
];

export function PreferencesSection({ userId, profile }: PreferencesSectionProps) {
  const t = useTranslations("settings");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const [notifyEmail, setNotifyEmail] = useState(profile.notifyEmail);
  const [notifySessions, setNotifySessions] = useState(
    profile.notifySessionReminders
  );

  function persist(patch: Record<string, unknown>) {
    const supabase = createClient();
    supabase.from("profiles").update(patch).eq("id", userId).then(() => {});
  }

  function handleLanguage(code: string) {
    if (code === locale) return;
    persist({ language: code });
    startTransition(() => {
      router.replace(pathname, { locale: code });
    });
  }

  function handleNotifyEmail(value: boolean) {
    setNotifyEmail(value);
    persist({ notify_email: value });
  }

  function handleNotifySessions(value: boolean) {
    setNotifySessions(value);
    persist({ notify_session_reminders: value });
  }

  return (
    <SettingsCard
      title={t("preferences_title")}
      description={t("preferences_desc")}
      icon={Globe}
    >
      {/* Language */}
      <Field label={t("language")} hint={t("language_desc")}>
        <div className="inline-flex rounded-xl border border-border bg-input p-1">
          {LANGS.map(({ code, labelKey }) => {
            const active = locale === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleLanguage(code)}
                aria-pressed={active}
                className={cn(
                  "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t(labelKey)}
              </button>
            );
          })}
        </div>
      </Field>

      {/* Notifications */}
      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">
            {t("notifications_title")}
          </p>
        </div>
        <Toggle
          checked={notifyEmail}
          onChange={handleNotifyEmail}
          label={t("notify_email")}
          description={t("notify_email_desc")}
        />
        <Toggle
          checked={notifySessions}
          onChange={handleNotifySessions}
          label={t("notify_sessions")}
          description={t("notify_sessions_desc")}
        />
      </div>
    </SettingsCard>
  );
}
