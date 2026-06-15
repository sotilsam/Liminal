/**
 * One-shot "first registration" marker for the dashboard greeting.
 *
 * Set once during sign-up; the dashboard consumes it on the very first view and
 * greets with "Welcome, {name}". Every later login finds no marker and greets
 * with "Welcome back, {name}". This is deliberately independent of the
 * onboarding walkthrough — a user can skip onboarding and still be "returning".
 *
 * Scoped by user id so two accounts on one browser are tracked separately.
 */
const firstLoginKey = (userId: string) => `liminal:first-login:${userId}`;

/** Called right after sign-up so the next dashboard view greets a new user. */
export function markFirstLogin(userId: string): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    window.localStorage.setItem(firstLoginKey(userId), "1");
  } catch {
    /* private mode / storage disabled — falls back to "Welcome back" */
  }
}

/**
 * Reads and clears the one-shot marker. Returns true only on the first
 * dashboard view after registering; false on every subsequent login.
 */
export function consumeFirstLogin(userId: string): boolean {
  if (typeof window === "undefined" || !userId) return false;
  try {
    if (window.localStorage.getItem(firstLoginKey(userId)) === "1") {
      window.localStorage.removeItem(firstLoginKey(userId));
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}
