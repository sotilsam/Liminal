-- Therapist <-> patient visibility, and remote training plans.
-- ---------------------------------------------------------------------------
-- The base schema's RLS is strictly "own row only", which blocks the two
-- relationships this app is built around:
--   * a therapist seeing the patients linked to them (and their names)
--   * a patient seeing the therapist they linked to
-- We add the missing cross-role SELECT policies, plus a remote_plans table so
-- a therapist can send a program/exercises to a linked patient.
--
-- All cross-table checks go through SECURITY DEFINER helpers so the policy
-- expressions never trigger RLS on the referenced tables (no recursion).

-- 1. Helpers ----------------------------------------------------------------

-- The therapist row id owned by the current user (NULL if not a therapist).
CREATE OR REPLACE FUNCTION public.current_therapist_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.therapists WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Is the given profile id one of the current therapist's linked patients?
CREATE OR REPLACE FUNCTION public.is_my_patient_profile(p_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.patients
    WHERE user_id = p_user_id
      AND therapist_id = public.current_therapist_id()
  );
$$;

-- Does the current therapist own (is linked to) the given patient row id?
CREATE OR REPLACE FUNCTION public.therapist_owns_patient(p_patient_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.patients
    WHERE id = p_patient_id
      AND therapist_id = public.current_therapist_id()
  );
$$;

-- The profile id of the therapist the current patient is linked to.
CREATE OR REPLACE FUNCTION public.my_therapist_user_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT t.user_id
  FROM public.patients p
  JOIN public.therapists t ON t.id = p.therapist_id
  WHERE p.user_id = auth.uid()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.current_therapist_id()        TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_my_patient_profile(uuid)   TO authenticated;
GRANT EXECUTE ON FUNCTION public.therapist_owns_patient(uuid)  TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_therapist_user_id()        TO authenticated;

-- 2. Cross-role SELECT policies ---------------------------------------------

-- Therapist can read the patient rows linked to them.
DROP POLICY IF EXISTS "patients: therapist reads linked" ON public.patients;
CREATE POLICY "patients: therapist reads linked"
  ON public.patients FOR SELECT
  TO authenticated
  USING (therapist_id = public.current_therapist_id());

-- Therapist can read the profiles of their linked patients.
DROP POLICY IF EXISTS "profiles: therapist reads linked patients" ON public.profiles;
CREATE POLICY "profiles: therapist reads linked patients"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_my_patient_profile(id));

-- Patient can read the profile of the therapist they are linked to.
DROP POLICY IF EXISTS "profiles: patient reads linked therapist" ON public.profiles;
CREATE POLICY "profiles: patient reads linked therapist"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = public.my_therapist_user_id());

-- 3. Remote plans -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.remote_plans (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id   uuid NOT NULL REFERENCES public.patients(id)   ON DELETE CASCADE,
  therapist_id uuid NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
  goal         text,
  exercises    text[] NOT NULL DEFAULT '{}',
  schedule     text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS remote_plans_patient_idx   ON public.remote_plans (patient_id);
CREATE INDEX IF NOT EXISTS remote_plans_therapist_idx ON public.remote_plans (therapist_id);

ALTER TABLE public.remote_plans ENABLE ROW LEVEL SECURITY;

-- Therapist can create a plan only for a patient linked to them.
DROP POLICY IF EXISTS "remote_plans: therapist insert" ON public.remote_plans;
CREATE POLICY "remote_plans: therapist insert"
  ON public.remote_plans FOR INSERT
  TO authenticated
  WITH CHECK (
    therapist_id = public.current_therapist_id()
    AND public.therapist_owns_patient(patient_id)
  );

-- Therapist can read/manage the plans they authored.
DROP POLICY IF EXISTS "remote_plans: therapist select" ON public.remote_plans;
CREATE POLICY "remote_plans: therapist select"
  ON public.remote_plans FOR SELECT
  TO authenticated
  USING (therapist_id = public.current_therapist_id());

DROP POLICY IF EXISTS "remote_plans: therapist delete" ON public.remote_plans;
CREATE POLICY "remote_plans: therapist delete"
  ON public.remote_plans FOR DELETE
  TO authenticated
  USING (therapist_id = public.current_therapist_id());

-- Patient can read the plans assigned to them.
DROP POLICY IF EXISTS "remote_plans: patient select" ON public.remote_plans;
CREATE POLICY "remote_plans: patient select"
  ON public.remote_plans FOR SELECT
  TO authenticated
  USING (patient_id IN (
    SELECT id FROM public.patients WHERE user_id = auth.uid()
  ));

NOTIFY pgrst, 'reload schema';
