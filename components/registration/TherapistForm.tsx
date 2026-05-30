"use client";

import { useTranslations } from "next-intl";

interface TherapistFormData {
  fullName: string;
  email: string;
  password: string;
  licenseNumber: string;
  specialization: string;
  clinic: string;
}

interface TherapistFormProps {
  data: TherapistFormData;
  onChange: (data: TherapistFormData) => void;
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

export function TherapistForm({ data, onChange }: TherapistFormProps) {
  const t = useTranslations("register");

  function set<K extends keyof TherapistFormData>(key: K, value: string) {
    onChange({ ...data, [key]: value });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="th-name" label={t("full_name")}>
        <input
          id="th-name"
          type="text"
          value={data.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          className={inputClass}
          autoComplete="name"
        />
      </Field>

      <Field id="th-email" label={t("email")}>
        <input
          id="th-email"
          type="email"
          value={data.email}
          onChange={(e) => set("email", e.target.value)}
          className={inputClass}
          autoComplete="email"
        />
      </Field>

      <div className="sm:col-span-2">
        <Field id="th-password" label={t("password")}>
          <input
            id="th-password"
            type="password"
            value={data.password}
            onChange={(e) => set("password", e.target.value)}
            className={inputClass}
            autoComplete="new-password"
          />
        </Field>
      </div>

      <Field id="th-license" label={t("license_number")}>
        <input
          id="th-license"
          type="text"
          value={data.licenseNumber}
          onChange={(e) => set("licenseNumber", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field id="th-spec" label={t("specialization")}>
        <input
          id="th-spec"
          type="text"
          value={data.specialization}
          onChange={(e) => set("specialization", e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="sm:col-span-2">
        <Field id="th-clinic" label={t("clinic")}>
          <input
            id="th-clinic"
            type="text"
            value={data.clinic}
            onChange={(e) => set("clinic", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
    </div>
  );
}
