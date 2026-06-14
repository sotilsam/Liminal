import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { PatientShell } from "@/components/dashboard/PatientShell";
import { createClient } from "@/lib/supabase-server";
import { loadSettings } from "@/lib/settings";

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

  const settings = await loadSettings(supabase, user);

  if (settings.role !== "patient") {
    redirect(`/${locale}/dashboard/${settings.role}`);
  }

  const displayName = settings.profile.fullName || user.email || "User";

  return <PatientShell userName={displayName} settings={settings} />;
}
