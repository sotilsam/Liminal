-- Therapist → patient feedback.
-- ---------------------------------------------------------------------------
-- Patients reported not getting enough feedback on their rehab progress, so a
-- therapist can now send a personal note to a linked patient — either general
-- or tied to a specific training session.
--
-- This mirrors the cross-role pattern established in 20260601: identity comes
-- from therapists.user_id / patients.user_id = auth.uid(), the therapist↔patient
-- link is patients.therapist_id, and every cross-table check goes through the
-- existing SECURITY DEFINER helpers (current_therapist_id / therapist_owns_patient)
-- so policy expressions never trigger RLS on the referenced tables.

-- 1. Table -------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.feedback (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
  patient_id   uuid NOT NULL REFERENCES public.patients(id)   ON DELETE CASCADE,
  session_id   uuid     REFERENCES public.sessions(id)        ON DELETE SET NULL,
  body         text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at   timestamptz NOT NULL DEFAULT now(),
  read_at      timestamptz            -- NULL = unread
);

-- Patient feed: newest-first list, and unread lookups.
CREATE INDEX IF NOT EXISTS feedback_patient_created_idx ON public.feedback (patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS feedback_patient_read_idx    ON public.feedback (patient_id, read_at);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 2. Policies ----------------------------------------------------------------

-- Therapist may send feedback only as themselves, and only to a linked patient.
DROP POLICY IF EXISTS "feedback: therapist insert" ON public.feedback;
CREATE POLICY "feedback: therapist insert"
  ON public.feedback FOR INSERT
  TO authenticated
  WITH CHECK (
    therapist_id = public.current_therapist_id()
    AND public.therapist_owns_patient(patient_id)
  );

-- Therapist reads the feedback they authored.
DROP POLICY IF EXISTS "feedback: therapist select" ON public.feedback;
CREATE POLICY "feedback: therapist select"
  ON public.feedback FOR SELECT
  TO authenticated
  USING (therapist_id = public.current_therapist_id());

-- Patient reads the feedback addressed to them.
DROP POLICY IF EXISTS "feedback: patient select" ON public.feedback;
CREATE POLICY "feedback: patient select"
  ON public.feedback FOR SELECT
  TO authenticated
  USING (patient_id IN (
    SELECT id FROM public.patients WHERE user_id = auth.uid()
  ));

-- 3. Mark-as-read RPC --------------------------------------------------------
-- No broad UPDATE policy: a patient flips read_at only via this function, and
-- only on their own still-unread rows.

CREATE OR REPLACE FUNCTION public.mark_feedback_read(feedback_id uuid)
RETURNS void
LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.feedback
  SET read_at = now()
  WHERE id = feedback_id
    AND read_at IS NULL
    AND patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    );
$$;

GRANT EXECUTE ON FUNCTION public.mark_feedback_read(uuid) TO authenticated;

-- 4. Session dropdown support ------------------------------------------------
-- The therapist composer lists a patient's recent sessions to optionally attach
-- one. Let a therapist read the sessions of patients linked to them, mirroring
-- "patients: therapist reads linked" from 20260601.
DROP POLICY IF EXISTS "sessions: therapist reads linked" ON public.sessions;
CREATE POLICY "sessions: therapist reads linked"
  ON public.sessions FOR SELECT
  TO authenticated
  USING (public.therapist_owns_patient(patient_id));

NOTIFY pgrst, 'reload schema';
