"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors";

export function RemotePlanBuilder() {
  const t = useTranslations("dashboard");
  const [goal, setGoal] = useState("");
  const [exercises, setExercises] = useState<string[]>([""]);
  const [schedule, setSchedule] = useState("");

  function addExercise() {
    setExercises((prev) => [...prev, ""]);
  }

  function removeExercise(i: number) {
    setExercises((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateExercise(i: number, value: string) {
    setExercises((prev) => prev.map((ex, idx) => (idx === i ? value : ex)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <section>
      <h2 className="mb-4 font-heading text-base font-semibold text-foreground">
        {t("remote_plan_builder")}
      </h2>
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

          {/* Schedule */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{t("plan_schedule")}</label>
            <input
              type="text"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className={inputClass}
              placeholder="e.g. Mon / Wed / Fri — 10:00 AM"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            {t("plan_save")}
          </button>
        </form>
      </div>
    </section>
  );
}
