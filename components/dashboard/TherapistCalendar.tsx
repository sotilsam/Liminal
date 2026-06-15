"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarDays, Loader2 } from "lucide-react";
import { TwoWeekCalendar, type CalendarSession } from "./TwoWeekCalendar";
import {
  deleteScheduledPlan,
  getScheduledPlansInRange,
  rangeForTwoWeeks,
  type ScheduledPlan,
} from "@/lib/schedule";
import type { LinkedPatient } from "./PatientTable";

function patientName(p: LinkedPatient): string {
  const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
  return profile?.full_name ?? profile?.email ?? "Unknown";
}

interface TherapistCalendarProps {
  linkedPatients: LinkedPatient[];
}

export function TherapistCalendar({ linkedPatients }: TherapistCalendarProps) {
  const t = useTranslations("dashboard");
  const [plans, setPlans] = useState<ScheduledPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const nameById = new Map(linkedPatients.map((p) => [p.id, patientName(p)]));

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

  async function handleDelete(session: CalendarSession) {
    const prev = plans;
    setPlans((cur) => cur.filter((p) => p.id !== session.id)); // optimistic
    try {
      await deleteScheduledPlan(session.id);
    } catch {
      setPlans(prev); // restore on failure
    }
  }

  const items: CalendarSession[] = plans
    .filter((p) => p.scheduled_for)
    .map((p) => ({
      id: p.id,
      date: p.scheduled_for!.slice(0, 10),
      label: nameById.get(p.patient_id) ?? p.goal ?? t("plan_goal"),
      sublabel: p.goal ?? undefined,
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
          <>
            {items.length === 0 && (
              <p className="mb-3 text-center text-sm text-muted-foreground">
                {t("no_sessions_scheduled")}
              </p>
            )}
            <TwoWeekCalendar
              sessions={items}
              onDelete={handleDelete}
              deleteLabel={t("delete_plan")}
            />
          </>
        )}
      </div>
    </section>
  );
}
