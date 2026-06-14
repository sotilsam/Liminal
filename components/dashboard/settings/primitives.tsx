"use client";

import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export const inputClass =
  "w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export const selectClass = cn(inputClass, "appearance-none");

interface SettingsCardProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  footer?: React.ReactNode;
  tone?: "default" | "danger";
}

export function SettingsCard({
  title,
  description,
  icon: Icon,
  children,
  footer,
  tone = "default",
}: SettingsCardProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border bg-card",
        tone === "danger" ? "border-destructive/30" : "border-border"
      )}
    >
      <header className="flex items-start gap-3 border-b border-border px-6 py-4">
        {Icon && (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              tone === "danger"
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary"
            )}
          >
            <Icon className="size-4" />
          </div>
        )}
        <div className="min-w-0">
          <h3
            className={cn(
              "font-heading text-sm font-semibold",
              tone === "danger" ? "text-destructive" : "text-foreground"
            )}
          >
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </header>

      <div className="space-y-4 px-6 py-5">{children}</div>

      {footer && (
        <footer className="flex items-center justify-end gap-3 border-t border-border bg-muted/20 px-6 py-4">
          {footer}
        </footer>
      )}
    </section>
  );
}

export function Field({
  id,
  label,
  hint,
  children,
}: {
  id?: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50",
          checked ? "bg-primary" : "bg-muted-foreground/30"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            checked ? "start-[1.375rem]" : "start-0.5"
          )}
        />
      </button>
    </div>
  );
}

interface SaveButtonProps {
  onClick?: () => void;
  type?: "button" | "submit";
  status: SaveStatus;
  idleLabel: string;
  savingLabel: string;
  savedLabel: string;
  disabled?: boolean;
}

export function SaveButton({
  onClick,
  type = "button",
  status,
  idleLabel,
  savingLabel,
  savedLabel,
  disabled,
}: SaveButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || status === "saving"}
      className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {status === "saving" && <Loader2 className="size-4 animate-spin" />}
      {status === "saved" && <Check className="size-4" />}
      {status === "saving"
        ? savingLabel
        : status === "saved"
          ? savedLabel
          : idleLabel}
    </button>
  );
}

export function StatusMessage({
  status,
  errorText,
  successText,
}: {
  status: SaveStatus;
  errorText: string;
  successText?: string;
}) {
  if (status === "error") {
    return <p className="text-xs font-medium text-destructive">{errorText}</p>;
  }
  if (status === "saved" && successText) {
    return <p className="text-xs font-medium text-primary">{successText}</p>;
  }
  return null;
}

export function ReadOnlyValue({ value }: { value: string }) {
  return (
    <div className="w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground">
      {value}
    </div>
  );
}
