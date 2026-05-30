"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { mockCurrentPatient, type MockGoal } from "@/lib/mock-data";

export function TrainingGoals() {
  const t = useTranslations("dashboard");
  const [goals, setGoals] = useState<MockGoal[]>(mockCurrentPatient.goals);
  const [newGoal, setNewGoal] = useState("");

  function addGoal() {
    const text = newGoal.trim();
    if (!text) return;
    setGoals((prev) => [
      ...prev,
      { id: `g${Date.now()}`, text, progress: 0 },
    ]);
    setNewGoal("");
  }

  return (
    <section>
      <h2 className="mb-4 font-heading text-base font-semibold text-foreground">
        {t("training_goals")}
      </h2>
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        {goals.map((goal, i) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-medium text-foreground">{goal.text}</p>
              <span className="text-xs font-semibold text-primary">{goal.progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${goal.progress}%` }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              />
            </div>
          </motion.div>
        ))}

        {/* Add goal */}
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGoal()}
            placeholder={t("goal_placeholder")}
            className="flex-1 rounded-xl border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={addGoal}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
