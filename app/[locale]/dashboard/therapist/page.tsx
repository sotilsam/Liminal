import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { TherapistShell } from "@/components/dashboard/TherapistShell";
import { createClient } from "@/lib/supabase-server";
import { loadSettings } from "@/lib/settings";
import {
  emptyHomeData,
  loadTherapistHomeData,
  type HomePatientRef,
} from "@/lib/therapist-metrics";
import type { LinkedPatient } from "@/components/dashboard/PatientTable";

function patientName(p: LinkedPatient): string {
  const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
  return profile?.full_name ?? profile?.email ?? "Unknown";
}

export default async function TherapistDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}`);

  const settings = await loadSettings(supabase, user);

  if (settings.role !== "therapist") {
    redirect(`/${locale}/dashboard/${settings.role}`);
  }

  const displayName = settings.profile.fullName || user.email || "User";

  const { data: therapist } = await supabase
    .from("therapists")
    .select("id")
    .eq("user_id", user.id)
    .single();

  let linkedPatients: LinkedPatient[] = [];
  if (therapist?.id) {
    const { data: patients } = await supabase
      .from("patients")
      .select("id, user_id, amputation_type, amputation_side, date_of_birth, profiles(full_name, email, created_at)")
      .eq("therapist_id", therapist.id);

    if (patients) {
      linkedPatients = patients as unknown as LinkedPatient[];
    }
  }

  // Demo/preview accounts show the seeded showcase numbers (TherapistHome reads
  // them from mock-data). Real accounts get live, RLS-scoped counts + charts.
  const homeData = settings.profile.isDemo
    ? emptyHomeData()
    : await loadTherapistHomeData(
        supabase,
        linkedPatients.map<HomePatientRef>((p) => ({
          id: p.id,
          name: patientName(p),
        }))
      );

  return (
    <TherapistShell
      userName={displayName}
      linkedPatients={linkedPatients}
      settings={settings}
      isDemo={settings.profile.isDemo}
      homeData={homeData}
    />
  );
}
