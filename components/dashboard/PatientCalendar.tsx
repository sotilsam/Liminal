"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarDays, Loader2 } from "lucide-react";
import { TwoWeekCalendar, type CalendarSession } from "./TwoWeekCalendar";
import {
  getScheduledPlansInRange,
  rangeForTwoWeeks,
  type ScheduledPlan,
} from "@/lib/schedule";

export function PatientCalendar() {
  const t = useTranslations("dashboard");
  const [plans, setPlans] = useState<ScheduledPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { from, to } = rangeForTwoWeeks();
      try {
        const data = await getScheduledPlansInRange(from, to);
        if (active) setPlans(data);
      } catch {
        // RLS / network — leave the calendar empty.
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const items: CalendarSession[] = plans
    .filter((p) => p.scheduled_for)
    .map((p) => ({
      id: p.id,
      date: p.scheduled_for!.slice(0, 10),
      label: p.goal || t("plan_goal"),
    }));

  return (
    <section>
      <div className="mb-4 flex items-center gap-2.5">
        <CalendarDays className="size-4 text-primary" />
        <h2 className="font-heading text-base font-semibold text-foreground">
          {t("calendar_title")}
        </h2>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4">
        {loading ? (
          <div className="flex min-h-[160px] items-center justify-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <TwoWeekCalendar sessions={items} />
        )}
      </div>
    </section>
  );
}
