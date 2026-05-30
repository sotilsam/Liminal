import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { PatientShell } from "@/components/dashboard/PatientShell";
import { createClient } from "@/lib/supabase-server";

export default async function PatientDashboard({
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

  if (profile?.role && profile.role !== "patient") {
    redirect(`/${locale}/dashboard/${profile.role}`);
  }

  const displayName = profile?.full_name ?? user.email ?? "User";

  return <PatientShell userName={displayName} />;
}
