"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Plus, Loader2, Pencil, Trash2, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { type MockGoal } from "@/lib/mock-data";

interface TrainingGoalsProps {
  patientId?: string | null;
}

export function TrainingGoals({ patientId }: TrainingGoalsProps) {
  const t = useTranslations("dashboard");
  const [goals, setGoals] = useState<MockGoal[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(!!patientId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    supabase
      .from("training_goals")
      .select("id, goal_text, progress")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) {
          setGoals(
            data.map((row) => ({
              id: row.id,
              text: row.goal_text ?? "",
              progress: row.progress ?? 0,
            }))
          );
        }
        setLoading(false);
      });
  }, [patientId]);

  async function addGoal() {
    const text = newGoal.trim();
    if (!text || adding) return;

    if (!patientId) {
      // No Supabase context — local only (e.g. therapist preview)
      setGoals((prev) => [...prev, { id: `g${Date.now()}`, text, progress: 0 }]);
      setNewGoal("");
      return;
    }

    setAdding(true);
    const id = crypto.randomUUID();
    const supabase = createClient();
    const { error } = await supabase.from("training_goals").insert({
      id,
      patient_id: patientId,
      goal_text: text,
      progress: 0,
    });
    setAdding(false);

    if (!error) {
      setGoals((prev) => [...prev, { id, text, progress: 0 }]);
      setNewGoal("");
    }
  }

  function startEdit(goal: MockGoal) {
    setEditingId(goal.id);
    setEditText(goal.text);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  async function saveEdit() {
    const id = editingId;
    const text = editText.trim();
    if (!id || !text) return;

    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, text } : g)));
    cancelEdit();

    if (patientId) {
      const supabase = createClient();
      await supabase
        .from("training_goals")
        .update({ goal_text: text })
        .eq("id", id);
    }
  }

  async function deleteGoal(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    if (editingId === id) cancelEdit();

    if (patientId) {
      const supabase = createClient();
      await supabase.from("training_goals").delete().eq("id", id);
    }
  }

  return (
    <section>
      <h2 className="mb-4 font-heading text-base font-semibold text-foreground">
        {t("training_goals")}
      </h2>
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : goals.length === 0 && patientId ? (
          <p className="text-sm text-muted-foreground py-2">{t("goal_placeholder")}</p>
        ) : (
          goals.map((goal, i) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="group"
            >
              {editingId === goal.id ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="flex-1 rounded-xl border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    onClick={saveEdit}
                    disabled={!editText.trim()}
                    aria-label={t("save")}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <Check className="size-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    aria-label={t("cancel")}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <p className="min-w-0 truncate text-sm font-medium text-foreground">
                      {goal.text}
                    </p>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs font-semibold text-primary">
                        {goal.progress}%
                      </span>
                      <div className="flex items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                        <button
                          onClick={() => startEdit(goal)}
                          aria-label={t("edit_goal")}
                          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          aria-label={t("delete_goal")}
                          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{
                        duration: 0.7,
                        delay: i * 0.1,
                        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                      }}
                    />
                  </div>
                </>
              )}
            </motion.div>
          ))
        )}

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
            disabled={adding || !newGoal.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {adding ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
