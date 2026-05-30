"use client";

import { useTranslations } from "next-intl";

interface ExperienceFormData {
  fullName: string;
  email: string;
  password: string;
}

interface ExperienceFormProps {
  data: ExperienceFormData;
  onChange: (data: ExperienceFormData) => void;
}

const inputClass =
  "w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors";

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

export function ExperienceForm({ data, onChange }: ExperienceFormProps) {
  const t = useTranslations("register");

  function set<K extends keyof ExperienceFormData>(key: K, value: string) {
    onChange({ ...data, [key]: value });
  }

  return (
    <div className="grid gap-4">
      <Field id="ex-name" label={t("full_name")}>
        <input
          id="ex-name"
          type="text"
          value={data.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          className={inputClass}
          autoComplete="name"
        />
      </Field>

      <Field id="ex-email" label={t("email")}>
        <input
          id="ex-email"
          type="email"
          value={data.email}
          onChange={(e) => set("email", e.target.value)}
          className={inputClass}
          autoComplete="email"
        />
      </Field>

      <Field id="ex-password" label={t("password")}>
        <input
          id="ex-password"
          type="password"
          value={data.password}
          onChange={(e) => set("password", e.target.value)}
          className={inputClass}
          autoComplete="new-password"
        />
      </Field>
    </div>
  );
}
