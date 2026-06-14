"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { BookOpen, CalendarClock, Dumbbell, Loader2, Target } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface RemotePlan {
  id: string;
  goal: string | null;
  exercises: string[] | null;
  schedule: string | null;
  created_at: string;
}

export function PatientProgram() {
  const t = useTranslations("dashboard");
  const [plans, setPlans] = useState<RemotePlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("remote_plans")
        .select("id, goal, exercises, schedule, created_at")
        .order("created_at", { ascending: false });
      if (active) {
        setPlans((data as RemotePlan[]) ?? []);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section data-tour="patient-program">
      <h2 className="mb-4 font-heading text-base font-semibold text-foreground">
        {t("my_program")}
      </h2>

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-border bg-card">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : plans.length === 0 ? (
        <div className="placeholder-card flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-2xl p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <BookOpen className="size-8 text-muted-foreground/50" />
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            {t("program_empty")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan, i) => {
            const exercises = (plan.exercises ?? []).filter((e) => e.trim());
            return (
              <motion.article
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                      <Target className="size-4" />
                    </div>
                    <h3 className="font-heading text-sm font-semibold text-foreground">
                      {plan.goal || t("plan_goal")}
                    </h3>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {t("plan_assigned", {
                      date: new Date(plan.created_at).toLocaleDateString(),
                    })}
                  </span>
                </div>

                {exercises.length > 0 ? (
                  <ul className="space-y-1.5">
                    {exercises.map((ex, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2.5 rounded-xl bg-muted/40 px-3 py-2 text-sm text-foreground"
                      >
                        <Dumbbell className="size-3.5 shrink-0 text-primary" />
                        {ex}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("plan_no_exercises")}
                  </p>
                )}

                {plan.schedule && (
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <CalendarClock className="size-3.5" />
                    {plan.schedule}
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
}
