-- Schedule a remote plan on a specific day so it lands on the shared calendar.
-- ---------------------------------------------------------------------------
-- The therapist picks a date in the "Build Remote Plan" form; the dated plan
-- then shows on both the therapist's and the patient's two-week calendar.
-- remote_plans already carries the right RLS from 20260601 (therapist
-- insert/select, patient select), so only the column is needed here.

ALTER TABLE public.remote_plans
  ADD COLUMN IF NOT EXISTS scheduled_for date;

CREATE INDEX IF NOT EXISTS remote_plans_scheduled_idx
  ON public.remote_plans (scheduled_for);

NOTIFY pgrst, 'reload schema';
