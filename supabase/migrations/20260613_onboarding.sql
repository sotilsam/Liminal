-- Onboarding walkthrough support
-- ---------------------------------------------------------------------------
-- Tracks whether a user has already seen the first-time guided walkthrough.
-- Missing / null is treated as "not completed yet" by the app, so the code
-- keeps working even before this migration is applied.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
