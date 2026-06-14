// Therapist → patient feedback data layer.
// Client-side helpers (the dashboards are client components). RLS scopes every
// read/write — see supabase/migrations/20260613_feedback.sql.

import { createClient } from "@/lib/supabase";

export interface Feedback {
  id: string;
  therapist_id: string;
  patient_id: string;
  session_id: string | null;
  body: string;
  created_at: string;
  read_at: string | null;
}

export interface PatientSession {
  id: string;
  date: string | null;
  type: string | null;
}

const FEEDBACK_COLS =
  "id, therapist_id, patient_id, session_id, body, created_at, read_at";

// Therapist: send feedback to one of their linked patients. Returns the new row.
export async function sendFeedback({
  patientId,
  sessionId,
  body,
}: {
  patientId: string;
  sessionId?: string | null;
  body: string;
}): Promise<Feedback> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: therapist } = await supabase
    .from("therapists")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!therapist) throw new Error("Not a therapist");

  const { data, error } = await supabase
    .from("feedback")
    .insert({
      therapist_id: therapist.id,
      patient_id: patientId,
      session_id: sessionId ?? null,
      body: body.trim(),
    })
    .select(FEEDBACK_COLS)
    .single();

  if (error) throw error;
  return data as Feedback;
}

// Therapist: all feedback they've sent to a given patient, newest first.
export async function getFeedbackForPatient(
  patientId: string
): Promise<Feedback[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("feedback")
    .select(FEEDBACK_COLS)
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as Feedback[]) ?? [];
}

// Patient: all feedback addressed to the logged-in patient, newest first.
// RLS limits rows to the caller's own.
export async function getMyFeedback(): Promise<Feedback[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("feedback")
    .select(FEEDBACK_COLS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as Feedback[]) ?? [];
}

// Patient: mark one feedback item read (no-op if it isn't theirs / already read).
export async function markFeedbackRead(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("mark_feedback_read", { feedback_id: id });
  if (error) throw error;
}

// Patient: number of unread feedback items. RLS scopes the count to the caller.
export async function getUnreadFeedbackCount(): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("feedback")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  if (error) throw error;
  return count ?? 0;
}

// Therapist: a linked patient's recent sessions, for the "attach to session"
// dropdown. Newest first.
export async function getPatientSessions(
  patientId: string
): Promise<PatientSession[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("id, date, type")
    .eq("patient_id", patientId)
    .order("date", { ascending: false })
    .limit(20);

  if (error) throw error;
  return (data as PatientSession[]) ?? [];
}
