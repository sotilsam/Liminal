import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { TherapistShell } from "@/components/dashboard/TherapistShell";
import { createClient } from "@/lib/supabase-server";
import type { LinkedPatient } from "@/components/dashboard/PatientTable";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role && profile.role !== "therapist") {
    redirect(`/${locale}/dashboard/${profile.role}`);
  }

  const displayName = profile?.full_name ?? user.email ?? "User";

  const { data: therapist } = await supabase
    .from("therapists")
    .select("id, therapist_code")
    .eq("user_id", user.id)
    .single();

  const therapistCode = therapist?.therapist_code ?? null;

  let linkedPatients: LinkedPatient[] = [];
  if (therapist?.id) {
    const { data: patients } = await supabase
      .from("patients")
      .select("id, user_id, amputation_type, amputation_side, date_of_birth, profiles(full_name, email)")
      .eq("therapist_id", therapist.id);

    if (patients) {
      linkedPatients = patients as unknown as LinkedPatient[];
    }
  }

  return (
    <TherapistShell
      userName={displayName}
      therapistCode={therapistCode}
      linkedPatients={linkedPatients}
    />
  );
}
