/**
 * Local-storage keys + helpers for the first-time walkthrough.
 *
 * The walkthrough auto-launches ONLY for a freshly registered user — never on
 * a normal login. Registration sets a per-user "pending" marker; the dashboard
 * consumes it once and clears it. A separate "done" marker (plus the DB
 * `onboarding_completed` flag) guards against re-showing after completion.
 */

export const onboardingDoneKey = (userId: string) =>
  `liminal:onboarding-done:${userId}`;
export const onboardingPendingKey = (userId: string) =>
  `liminal:onboarding-pending:${userId}`;

/** Called right after sign-up so the next dashboard mount shows the tour once. */
export function markOnboardingPending(userId: string) {
  try {
    window.localStorage.setItem(onboardingPendingKey(userId), "1");
  } catch {
    /* private mode / storage disabled — tour just won't auto-launch */
  }
}
