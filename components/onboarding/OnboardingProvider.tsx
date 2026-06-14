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
import { onboardingDoneKey, onboardingPendingKey } from "@/lib/onboarding";
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

  // The walkthrough auto-launches ONLY for a freshly registered user: the
  // register flow sets a per-user "pending" marker, which the dashboard
  // consumes once on first visit. A normal login never sets it, so the tour
  // never reappears on subsequent logins.
  const pendingKey = onboardingPendingKey(userId);
  const doneKey = onboardingDoneKey(userId);
  const isPendingLocally = useCallback(() => {
    try {
      return window.localStorage.getItem(pendingKey) === "1";
    } catch {
      return false;
    }
  }, [pendingKey]);
  const isSeenLocally = useCallback(() => {
    try {
      return window.localStorage.getItem(doneKey) === "1";
    } catch {
      return false;
    }
  }, [doneKey]);
  // Mark seen (so it never re-auto-launches) and clear the one-shot pending
  // marker. Swallows storage errors — the DB flag is the fallback.
  const markSeenLocally = useCallback(() => {
    try {
      window.localStorage.setItem(doneKey, "1");
      window.localStorage.removeItem(pendingKey);
    } catch {
      /* private mode / storage disabled — DB write is the fallback */
    }
  }, [doneKey, pendingKey]);

  // Refs that mirror state / lifecycle without re-triggering effects.
  const sourceRef = useRef<"auto" | "manual">("manual");
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

  // Persist completion — but ONLY for the auto-launched first run. Manual
  // re-launches must never write the flag (the spec: "does NOT reset it").
  // Never blocks the UI: failures are logged and swallowed.
  const finalize = useCallback(() => {
    if (sourceRef.current !== "auto" || persistedRef.current) return;
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
    sourceRef.current = "manual";
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

  // Auto-launch once, shortly after mount — but ONLY for a freshly registered
  // user (pending marker set during sign-up) who hasn't already finished it.
  // A normal login has no pending marker, so the tour never shows on login.
  useEffect(() => {
    if (autoHandledRef.current || steps.length === 0) return;
    autoHandledRef.current = true;
    if (onboardingCompleted || isSeenLocally()) return;
    if (!isPendingLocally()) return;
    const timer = setTimeout(() => {
      if (activeRef.current) return; // user already opened it manually
      sourceRef.current = "auto";
      setIndex(0);
      applyTab(0);
      setActive(true);
    }, 900);
    return () => clearTimeout(timer);
  }, [onboardingCompleted, steps.length, applyTab, isSeenLocally, isPendingLocally]);

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
