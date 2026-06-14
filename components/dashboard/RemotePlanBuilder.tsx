"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, X, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

const inputClass =
  "w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors";

interface RemotePlanBuilderProps {
  /** When set, the plan is scoped to a specific patient and the title reflects it. */
  patientName?: string;
  /** Patient row id the plan is sent to. Required to actually save. */
  patientId?: string;
  /** When set, a close button is shown in the header. */
  onClose?: () => void;
}

type SendStatus = "idle" | "sending" | "sent" | "error";

export function RemotePlanBuilder({ patientName, patientId, onClose }: RemotePlanBuilderProps) {
  const t = useTranslations("dashboard");
  const [goal, setGoal] = useState("");
  const [exercises, setExercises] = useState<string[]>([""]);
  const [scheduledFor, setScheduledFor] = useState("");
  const [status, setStatus] = useState<SendStatus>("idle");

  function addExercise() {
    setExercises((prev) => [...prev, ""]);
  }

  function removeExercise(i: number) {
    setExercises((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateExercise(i: number, value: string) {
    setExercises((prev) => prev.map((ex, idx) => (idx === i ? value : ex)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId) return;

    setStatus("sending");
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setStatus("error");
        return;
      }

      const { data: therapist } = await supabase
        .from("therapists")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!therapist) {
        setStatus("error");
        return;
      }

      const { error } = await supabase.from("remote_plans").insert({
        patient_id: patientId,
        therapist_id: therapist.id,
        goal: goal.trim() || null,
        exercises: exercises.map((x) => x.trim()).filter(Boolean),
        scheduled_for: scheduledFor || null,
      });

      if (error) {
        setStatus("error");
        return;
      }

      setStatus("sent");
      setGoal("");
      setExercises([""]);
      setScheduledFor("");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-heading text-base font-semibold text-foreground">
          {patientName
            ? t("plan_for", { name: patientName })
            : t("remote_plan_builder")}
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Goal */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{t("plan_goal")}</label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className={inputClass}
              placeholder={t("goal_placeholder")}
            />
          </div>

          {/* Date — places this plan on the patient's & therapist's calendar */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{t("plan_date")}</label>
            <input
              type="date"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Exercises */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">{t("plan_exercises")}</label>
              <button
                type="button"
                onClick={addExercise}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <Plus className="size-3.5" />
                {t("add_goal")}
              </button>
            </div>
            {exercises.map((ex, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={ex}
                  onChange={(e) => updateExercise(i, e.target.value)}
                  className={inputClass}
                  placeholder={`${t("plan_exercises")} ${i + 1}`}
                />
                {exercises.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExercise(i)}
                    className="shrink-0 rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!patientId || status === "sending"}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "sending" && <Loader2 className="size-4 animate-spin" />}
              {status === "sent" && <Check className="size-4" />}
              {status === "sending" ? t("sending") : t("plan_save")}
            </button>
            {status === "sent" && (
              <span className="text-xs font-medium text-primary">
                {t("plan_sent", { name: patientName ?? "" })}
              </span>
            )}
            {status === "error" && (
              <span className="text-xs font-medium text-destructive">
                {t("plan_send_failed")}
              </span>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
