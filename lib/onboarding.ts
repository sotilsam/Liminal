/**
 * Local-storage key + helper for the first-time walkthrough.
 *
 * The walkthrough auto-launches off the DB flag `profiles.onboarding_completed`
 * (false → not done yet), so it appears on the user's first login after sign-up
 * and never again once the flag is flipped to true. This local "done" marker is
 * only a same-session guard against a re-flash before the DB write lands (or if
 * it fails) — see components/onboarding/OnboardingProvider.tsx.
 */

export const onboardingDoneKey = (userId: string) =>
  `liminal:onboarding-done:${userId}`;

/**
 * Local-storage key for the AR-training instructions card. Unlike the dashboard
 * walkthrough there's no DB flag — the card is a lightweight, per-browser
 * first-run primer shown the first time a patient launches AR training. Scoped
 * by user id so two accounts on one browser each see it once.
 */
export const arInstructionsSeenKey = (userId: string) =>
  `liminal:ar-instructions-seen:${userId}`;
