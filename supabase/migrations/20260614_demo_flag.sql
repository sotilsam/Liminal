-- Demo / preview accounts
-- ---------------------------------------------------------------------------
-- Only accounts explicitly flagged as demo show the seeded showcase numbers
-- (sample patients, sessions, charts). A real signup has is_demo = false (the
-- default) and the dashboard renders real, RLS-scoped counts + empty states.
--
-- Missing / null is treated as "not a demo account" by the app, so the code
-- keeps working even before this migration is applied.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;

NOTIFY pgrst, 'reload schema';
