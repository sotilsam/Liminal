// Calendar data layer — dated remote plans power the shared two-week calendar.
// A therapist schedules a plan for a day in the Remote Plan Builder; RLS
// (from 20260601) scopes reads: a patient sees their own plans, a therapist
// sees the plans they authored. See 20260613_remote_plan_schedule.sql.

import { createClient } from "@/lib/supabase";

export interface ScheduledPlan {
  id: string;
  patient_id: string;
  goal: string | null;
  scheduled_for: string | null; // YYYY-MM-DD
}

// Local YYYY-MM-DD (calendar days are local, not UTC).
function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// The 14-day window the calendar renders: the start of this week (Sunday)
// through 13 days later.
export function rangeForTwoWeeks(): { from: string; to: string } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 13);
  return { from: isoDay(start), to: isoDay(end) };
}

// Dated plans visible to the current user within [from, to] (inclusive ISO
// days). Plans without a date are excluded by the range comparison.
export async function getScheduledPlansInRange(
  from: string,
  to: string
): Promise<ScheduledPlan[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("remote_plans")
    .select("id, patient_id, goal, scheduled_for")
    .gte("scheduled_for", from)
    .lte("scheduled_for", to)
    .order("scheduled_for", { ascending: true });

  if (error) throw error;
  return (data as ScheduledPlan[]) ?? [];
}

// Therapist: remove a plan (and thus its calendar entry). RLS only lets a
// therapist delete plans they authored.
export async function deleteScheduledPlan(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("remote_plans").delete().eq("id", id);
  if (error) throw error;
}
