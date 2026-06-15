import type { SupabaseClient } from "@supabase/supabase-js";

export type SettingsRole = "therapist" | "patient" | "experience";

/**
 * Accounts that always render the seeded showcase data, regardless of the
 * `profiles.is_demo` column. Lets a preview/demo login work even before the
 * `20260614_demo_flag` migration has been applied (the column may be absent).
 */
const DEMO_EMAILS = new Set<string>(["demo.therapist@liminal.health"]);

function isDemoEmail(email: string): boolean {
  return DEMO_EMAILS.has(email.trim().toLowerCase());
}

export interface ProfileSettings {
  fullName: string;
  email: string;
  avatarUrl: string | null;
  language: string;
  notifyEmail: boolean;
  notifySessionReminders: boolean;
  /**
   * Whether the user has finished (or skipped) the first-time walkthrough.
   * Falls back to `false` when the `onboarding_completed` column is missing
   * (migration not yet applied) or null — i.e. "not completed yet".
   */
  onboardingCompleted: boolean;
  /**
   * Demo / preview account. Only these see the seeded showcase data; real
   * signups get real, RLS-scoped counts and empty states. Falls back to
   * `false` when the `is_demo` column is missing or null.
   */
  isDemo: boolean;
}

export interface TherapistSettings {
  code: string | null;
  clinicName: string | null;
  licenseNumber: string | null;
  specialization: string | null;
}

export interface PatientSettings {
  patientId: string | null;
  therapistName: string | null;
  therapistCode: string | null;
  amputationType: string | null;
  amputationSide: string | null;
  dateOfBirth: string | null;
}

export interface SettingsData {
  userId: string;
  role: SettingsRole;
  profile: ProfileSettings;
  therapist: TherapistSettings | null;
  patient: PatientSettings | null;
}

interface MinimalUser {
  id: string;
  email?: string | null;
}

/**
 * Load everything the Settings page needs for the current user.
 * Uses `select("*")` so it keeps working even before the settings
 * migration has been applied (missing columns fall back to defaults).
 */
export async function loadSettings(
  supabase: SupabaseClient,
  user: MinimalUser
): Promise<SettingsData> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const role = (profile?.role ?? "experience") as SettingsRole;

  const profileSettings: ProfileSettings = {
    fullName: profile?.full_name ?? "",
    email: profile?.email ?? user.email ?? "",
    avatarUrl: profile?.avatar_url ?? null,
    language: profile?.language ?? "he",
    notifyEmail: profile?.notify_email ?? true,
    notifySessionReminders: profile?.notify_session_reminders ?? true,
    onboardingCompleted: profile?.onboarding_completed ?? false,
    isDemo: profile?.is_demo ?? isDemoEmail(profile?.email ?? user.email ?? ""),
  };

  let therapist: TherapistSettings | null = null;
  let patient: PatientSettings | null = null;

  if (role === "therapist") {
    const { data: row } = await supabase
      .from("therapists")
      .select("*")
      .eq("user_id", user.id)
      .single();
    therapist = {
      code: row?.therapist_code ?? null,
      clinicName: row?.clinic_name ?? null,
      licenseNumber: row?.license_number ?? null,
      specialization: row?.specialization ?? null,
    };
  } else if (role === "patient") {
    const { data: row } = await supabase
      .from("patients")
      .select("*")
      .eq("user_id", user.id)
      .single();

    let therapistName: string | null = null;
    if (row?.therapist_id) {
      const { data: th } = await supabase
        .from("therapists")
        .select("user_id")
        .eq("id", row.therapist_id)
        .single();
      if (th?.user_id) {
        const { data: thProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", th.user_id)
          .single();
        therapistName = thProfile?.full_name ?? null;
      }
    }

    patient = {
      patientId: row?.id ?? null,
      therapistName,
      therapistCode: row?.therapist_code ?? null,
      amputationType: row?.amputation_type ?? null,
      amputationSide: row?.amputation_side ?? null,
      dateOfBirth: row?.date_of_birth ?? null,
    };
  }

  return {
    userId: user.id,
    role,
    profile: profileSettings,
    therapist,
    patient,
  };
}
