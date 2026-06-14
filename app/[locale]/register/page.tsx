"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { RoleSelector, type Role } from "@/components/registration/RoleSelector";
import { PatientForm } from "@/components/registration/PatientForm";
import { TherapistForm } from "@/components/registration/TherapistForm";
import { ExperienceForm } from "@/components/registration/ExperienceForm";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase";
import { generateUniqueTherapistCode } from "@/lib/therapist-code";

const pageVariants = {
  enter: { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

export default function RegisterPage() {
  const t = useTranslations("register");
  const tNav = useTranslations("nav");
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [patientData, setPatientData] = useState({
    fullName: "",
    email: "",
    password: "",
    dob: "",
    amputationType: "",
    amputationSide: "",
    therapistCode: "",
  });

  const [therapistData, setTherapistData] = useState({
    fullName: "",
    email: "",
    password: "",
    licenseNumber: "",
    specialization: "",
    clinic: "",
  });

  const [experienceData, setExperienceData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  function handleNext() {
    if (role) setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { email, password, fullName } =
        role === "patient"
          ? { email: patientData.email, password: patientData.password, fullName: patientData.fullName }
          : role === "therapist"
          ? { email: therapistData.email, password: therapistData.password, fullName: therapistData.fullName }
          : { email: experienceData.email, password: experienceData.password, fullName: experienceData.fullName };

      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      const user = data.user;
      if (!user) {
        setError("Registration failed. Please try again.");
        return;
      }

      // Insert into profiles
      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        email,
        full_name: fullName,
        role,
      });

      if (profileError) {
        setError(profileError.message);
        return;
      }

      // Insert role-specific record
      if (role === "patient") {
        const code = patientData.therapistCode.trim() || null;

        // Resolve therapist_id from code if provided
        let therapistId: string | null = null;
        if (code) {
          const { data: therapistRow } = await supabase
            .from("therapists")
            .select("id")
            .eq("therapist_code", code)
            .single();
          therapistId = therapistRow?.id ?? null;
        }

        const patientRow: Record<string, unknown> = {
          id: crypto.randomUUID(),
          user_id: user.id,
          amputation_type: patientData.amputationType || null,
          amputation_side: patientData.amputationSide || null,
          therapist_code: code,
          date_of_birth: patientData.dob || null,
        };
        // therapist_id requires the SQL migration to have been run
        if (therapistId) patientRow.therapist_id = therapistId;

        const { error: patientError } = await supabase.from("patients").insert(patientRow);
        if (patientError) {
          setError(patientError.message);
          return;
        }
      } else if (role === "therapist") {
        const generatedCode = await generateUniqueTherapistCode(supabase);
        const { error: therapistError } = await supabase.from("therapists").insert({
          id: crypto.randomUUID(),
          user_id: user.id,
          license_number: therapistData.licenseNumber || null,
          specialization: therapistData.specialization || null,
          clinic_name: therapistData.clinic || null,
          therapist_code: generatedCode,
        });
        if (therapistError) {
          setError(therapistError.message);
          return;
        }
      }

      // If email confirmation is required, session won't exist yet
      if (!data.session) {
        router.push("/");
        return;
      }

      router.push(`/dashboard/${role}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app-scaled mesh-bg flex min-h-screen flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <Link href="/" className="mb-8 font-heading text-xl font-bold text-foreground">
        {tNav("logo")}<span className="text-primary">.</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-2xl rounded-3xl bg-background p-8 shadow-xl ring-1 ring-border sm:p-10">
        {/* Step indicator */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              1
            </div>
            <span className="text-sm text-muted-foreground">{t("choose_role")}</span>
          </div>
          <div className="h-px flex-1 bg-border" />
          <div className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </div>
            <span className="text-sm text-muted-foreground">{t("full_name")}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            >
              <RoleSelector selected={role} onSelect={setRole} />
              <div className="mt-8 flex justify-end">
                <motion.button
                  onClick={handleNext}
                  disabled={!role}
                  whileHover={role ? { scale: 1.03 } : {}}
                  whileTap={role ? { scale: 0.97 } : {}}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("next")}
                  <ArrowRight className="size-4" />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            >
              <div className="mb-6">
                <h2 className="font-heading text-xl font-bold text-foreground">
                  {t("title")}
                </h2>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit}>
                {role === "patient" && (
                  <PatientForm data={patientData} onChange={setPatientData} />
                )}
                {role === "therapist" && (
                  <TherapistForm data={therapistData} onChange={setTherapistData} />
                )}
                {role === "experience" && (
                  <ExperienceForm data={experienceData} onChange={setExperienceData} />
                )}

                <div className="mt-8 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <ArrowLeft className="size-4" />
                    {t("back")}
                  </button>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={!isLoading ? { scale: 1.03 } : {}}
                    whileTap={!isLoading ? { scale: 0.97 } : {}}
                    className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? "…" : t("submit")}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sign in link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("already_account")}{" "}
          <Link href="/" className="font-medium text-primary hover:underline">
            {t("login_link")}
          </Link>
        </p>
      </div>
    </div>
  );
}
