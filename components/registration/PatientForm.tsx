"use client";

import { useTranslations } from "next-intl";

interface PatientFormData {
  fullName: string;
  email: string;
  password: string;
  dob: string;
  amputationType: string;
  amputationSide: string;
  therapistCode: string;
}

interface PatientFormProps {
  data: PatientFormData;
  onChange: (data: PatientFormData) => void;
}

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

const inputClass =
  "w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors";

const selectClass =
  "w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors appearance-none";

export function PatientForm({ data, onChange }: PatientFormProps) {
  const t = useTranslations("register");

  function set<K extends keyof PatientFormData>(key: K, value: string) {
    onChange({ ...data, [key]: value });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="p-name" label={t("full_name")}>
        <input
          id="p-name"
          type="text"
          value={data.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          className={inputClass}
          autoComplete="name"
        />
      </Field>

      <Field id="p-email" label={t("email")}>
        <input
          id="p-email"
          type="email"
          value={data.email}
          onChange={(e) => set("email", e.target.value)}
          className={inputClass}
          autoComplete="email"
        />
      </Field>

      <Field id="p-password" label={t("password")}>
        <input
          id="p-password"
          type="password"
          value={data.password}
          onChange={(e) => set("password", e.target.value)}
          className={inputClass}
          autoComplete="new-password"
        />
      </Field>

      <Field id="p-dob" label={t("dob")}>
        <input
          id="p-dob"
          type="date"
          value={data.dob}
          onChange={(e) => set("dob", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field id="p-amp-type" label={t("amputation_type")}>
        <select
          id="p-amp-type"
          value={data.amputationType}
          onChange={(e) => set("amputationType", e.target.value)}
          className={selectClass}
        >
          <option value="">—</option>
          <option value="above_knee">{t("above_knee")}</option>
          <option value="below_knee">{t("below_knee")}</option>
          <option value="above_elbow">{t("above_elbow")}</option>
          <option value="below_elbow">{t("below_elbow")}</option>
          <option value="other">{t("other")}</option>
        </select>
      </Field>

      <Field id="p-amp-side" label={t("amputation_side")}>
        <select
          id="p-amp-side"
          value={data.amputationSide}
          onChange={(e) => set("amputationSide", e.target.value)}
          className={selectClass}
        >
          <option value="">—</option>
          <option value="left">{t("left")}</option>
          <option value="right">{t("right")}</option>
          <option value="bilateral">{t("bilateral")}</option>
        </select>
      </Field>

      <div className="sm:col-span-2">
        <Field id="p-therapist-code" label={`${t("therapist_code")} (${t("therapist_code_optional")})`}>
          <input
            id="p-therapist-code"
            type="text"
            value={data.therapistCode}
            onChange={(e) => set("therapistCode", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
    </div>
  );
}
