"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createClient } from "@/lib/supabase";
import type { SettingsRole } from "@/lib/settings";
import { onboardingDoneKey } from "@/lib/onboarding";
import { tourSteps, type TourStep } from "./tourSteps";
import { OnboardingOverlay } from "./OnboardingOverlay";

interface OnboardingContextValue {
  active: boolean;
  index: number;
  total: number;
  step: TourStep | null;
  /** Start the walkthrough on demand (the dashboard help control). */
  start: () => void;
  next: () => void;
  back: () => void;
  /** Skip + Finish both end the run (and mark complete when auto-launched). */
  skip: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return ctx;
}

interface OnboardingProviderProps {
  role: SettingsRole;
  userId: string;
  /** From profiles.onboarding_completed (false/null → not completed yet). */
  onboardingCompleted: boolean;
  /** The shell's active dashboard tab + setter, so steps can navigate tabs. */
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export function OnboardingProvider({
  role,
  userId,
  onboardingCompleted,
  setActiveTab,
  children,
}: OnboardingProviderProps) {
  const steps = useMemo(() => tourSteps[role] ?? [], [role]);

  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);

  // The walkthrough auto-launches whenever the DB flag `onboarding_completed`
  // is false — i.e. on the user's first login after sign-up, regardless of the
  // device they registered on. Completing or dismissing it flips the flag to
  // true, so it never reappears. The local "done" marker is only a same-session
  // guard against a re-flash before the DB write lands (or if it fails).
  const doneKey = onboardingDoneKey(userId);
  const isSeenLocally = useCallback(() => {
    try {
      return window.localStorage.getItem(doneKey) === "1";
    } catch {
      return false;
    }
  }, [doneKey]);
  // Mark seen locally so it never re-auto-launches this session. Swallows
  // storage errors — the DB flag is the durable source of truth.
  const markSeenLocally = useCallback(() => {
    try {
      window.localStorage.setItem(doneKey, "1");
    } catch {
      /* private mode / storage disabled — DB write is the fallback */
    }
  }, [doneKey]);

  // Refs that mirror state / lifecycle without re-triggering effects.
  const persistedRef = useRef(onboardingCompleted);
  const autoHandledRef = useRef(false);
  const activeRef = useRef(false);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Switch to the tab a step lives on. Setting the same tab is a no-op in React.
  const applyTab = useCallback(
    (i: number) => {
      const tab = steps[i]?.tab;
      if (tab) setActiveTab(tab);
    },
    [steps, setActiveTab]
  );

  // Persist completion the first time the tour ends (complete or dismiss) for a
  // user who hadn't finished it yet — whether it auto-launched or they opened
  // it from the help control. A user who already completed it (persistedRef
  // true) re-running it manually never re-writes the flag. Never blocks the
  // UI: failures are logged and swallowed (the local marker still guards).
  const finalize = useCallback(() => {
    if (persistedRef.current) return;
    persistedRef.current = true;
    // Local marker first — guarantees no re-launch on refresh even if the DB
    // write below fails (missing column / RLS).
    markSeenLocally();
    try {
      const supabase = createClient();
      supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", userId)
        .then(({ error }) => {
          if (error) {
            console.warn(
              "[onboarding] could not persist completion:",
              error.message
            );
          }
        });
    } catch (err) {
      console.warn("[onboarding] persist failed:", err);
    }
  }, [userId, markSeenLocally]);

  const end = useCallback(() => {
    finalize();
    setActive(false);
  }, [finalize]);

  const start = useCallback(() => {
    if (steps.length === 0) return;
    setIndex(0);
    applyTab(0);
    setActive(true);
  }, [steps.length, applyTab]);

  const next = useCallback(() => {
    setIndex((i) => {
      if (i >= steps.length - 1) {
        end();
        return i;
      }
      const ni = i + 1;
      applyTab(ni);
      return ni;
    });
  }, [steps.length, applyTab, end]);

  const back = useCallback(() => {
    setIndex((i) => {
      const ni = Math.max(0, i - 1);
      applyTab(ni);
      return ni;
    });
  }, [applyTab]);

  // Auto-launch once, shortly after mount, for any user who hasn't completed
  // onboarding yet (DB flag false). This fires on the first login right after
  // sign-up — even if the profile row was only just created — and stops for
  // good once the flag is flipped to true on completion/dismissal.
  useEffect(() => {
    if (autoHandledRef.current || steps.length === 0) return;
    if (onboardingCompleted || isSeenLocally()) return;
    // Note: the "handled" guard is flipped *inside* the timeout, not here, so
    // React StrictMode's mount→unmount→remount in dev (which would clear this
    // timer) simply reschedules it instead of being permanently suppressed.
    const timer = setTimeout(() => {
      if (autoHandledRef.current || activeRef.current) return;
      autoHandledRef.current = true;
      setIndex(0);
      applyTab(0);
      setActive(true);
    }, 900);
    return () => clearTimeout(timer);
  }, [onboardingCompleted, steps.length, applyTab, isSeenLocally]);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      active,
      index,
      total: steps.length,
      step: active ? steps[index] ?? null : null,
      start,
      next,
      back,
      skip: end,
    }),
    [active, index, steps, start, next, back, end]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      {active && steps[index] && <OnboardingOverlay />}
    </OnboardingContext.Provider>
  );
}
