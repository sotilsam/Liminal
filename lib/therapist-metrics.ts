// Real therapist Home data — computed from RLS-scoped Supabase queries.
// ---------------------------------------------------------------------------
// This is the non-demo path: counts and charts reflect the patients/sessions
// actually linked to the current therapist. Demo/preview accounts bypass this
// entirely and render the seeded numbers from `lib/mock-data`.
//
// Only columns we know exist on `sessions` are selected (id, patient_id, date,
// type) so a missing optional column can never fail the whole query. Reads are
// scoped by the "sessions: therapist reads linked" RLS policy (20260613).

import type { SupabaseClient } from "@supabase/supabase-js";
import type { SessionBarPoint } from "@/lib/mock-data";

/** A patient linked to the therapist, reduced to what Home needs. */
export interface HomePatientRef {
  id: string;
  name: string;
}

/** Newest sessions across all linked patients — feeds the activity list. */
export interface HomeActivityItem {
  patient: string;
  date: string;
  type: string;
  duration?: string;
  score?: number;
}

export interface TherapistMetrics {
  totalPatients: number;
  activeThisWeek: number;
  sessionsThisMonth: number;
  /** null when there is no progress data to show (real accounts don't track it). */
  avgProgress: number | null;
}

export interface TherapistHomeData {
  metrics: TherapistMetrics;
  activity: HomeActivityItem[];
  /** Always 8 buckets (W1..W8). All-zero for an account with no sessions. */
  weekly: SessionBarPoint[];
}

interface SessionRow {
  id: string;
  patient_id: string;
  date: string | null;
  type: string | null;
}

const WEEKS = 8;
const DAY_MS = 24 * 60 * 60 * 1000;

function emptyWeekly(): SessionBarPoint[] {
  return Array.from({ length: WEEKS }, (_, i) => ({
    week: `W${i + 1}`,
    sessions: 0,
  }));
}

export function emptyHomeData(): TherapistHomeData {
  return {
    metrics: {
      totalPatients: 0,
      activeThisWeek: 0,
      sessionsThisMonth: 0,
      avgProgress: null,
    },
    activity: [],
    weekly: emptyWeekly(),
  };
}

/**
 * Load the therapist's real Home data. Never throws: on any query error it
 * returns counts derived from the patient list alone (so the dashboard still
 * renders), with empty activity/chart.
 */
export async function loadTherapistHomeData(
  supabase: SupabaseClient,
  patients: HomePatientRef[]
): Promise<TherapistHomeData> {
  const totalPatients = patients.length;
  if (totalPatients === 0) return emptyHomeData();

  const nameById = new Map(patients.map((p) => [p.id, p.name]));
  const patientIds = patients.map((p) => p.id);

  const now = new Date();
  const windowStart = new Date(now.getTime() - WEEKS * 7 * DAY_MS);
  const weekStart = new Date(windowStart);
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now.getTime() - 7 * DAY_MS);

  const fallback: TherapistHomeData = {
    metrics: { totalPatients, activeThisWeek: 0, sessionsThisMonth: 0, avgProgress: null },
    activity: [],
    weekly: emptyWeekly(),
  };

  const { data, error } = await supabase
    .from("sessions")
    .select("id, patient_id, date, type")
    .in("patient_id", patientIds)
    .gte("date", isoDay(weekStart))
    .order("date", { ascending: false });

  if (error || !data) return fallback;

  const rows = data as SessionRow[];

  let sessionsThisMonth = 0;
  const activePatients = new Set<string>();
  const weekly = emptyWeekly();

  for (const row of rows) {
    if (!row.date) continue;
    const when = new Date(row.date);
    if (Number.isNaN(when.getTime())) continue;

    if (when >= monthStart) sessionsThisMonth += 1;
    if (when >= sevenDaysAgo) activePatients.add(row.patient_id);

    const bucket = Math.floor((when.getTime() - weekStart.getTime()) / (7 * DAY_MS));
    if (bucket >= 0 && bucket < WEEKS) weekly[bucket].sessions += 1;
  }

  // Newest sessions across all patients → activity feed (rows already desc).
  const activity: HomeActivityItem[] = rows.slice(0, 5).map((row) => ({
    patient: nameById.get(row.patient_id) ?? "—",
    date: row.date ?? "—",
    type: row.type ?? "—",
  }));

  return {
    metrics: {
      totalPatients,
      activeThisWeek: activePatients.size,
      sessionsThisMonth,
      avgProgress: null,
    },
    activity,
    weekly,
  };
}

function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
