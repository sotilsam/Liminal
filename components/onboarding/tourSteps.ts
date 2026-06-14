import type { SettingsRole } from "@/lib/settings";

/**
 * Where the tooltip card sits relative to its target. This is a *preference* —
 * the overlay falls back to whichever side actually has room, so RTL/LTR and
 * small viewports never push a card off-screen.
 */
export type TourPlacement = "top" | "bottom" | "left" | "right";

export interface TourStep {
  /** Stable id (used for React keys + debugging). */
  id: string;
  /** i18n keys, relative to the `onboarding` namespace (dot-nested). */
  title: string;
  body: string;
  /** Step 1 per role: an illustrated welcome card with no spotlight target. */
  welcome?: boolean;
  /** Dashboard tab that must be active for the target to be mounted. */
  tab?: string;
  /** `data-tour` value of the real element to spotlight. */
  target?: string;
  /** Used when `target` isn't mounted (e.g. a fresh patient with no limb yet). */
  fallbackTarget?: string;
  /** Preferred tooltip placement. */
  placement?: TourPlacement;
}

/**
 * Role-aware walkthrough. Each role only points at elements that actually exist
 * for that role. Edit copy via the `onboarding` keys in messages/{he,en}.json;
 * edit the tour shape (order, targets, tabs) here.
 *
 * Targets are matched against `data-tour="<value>"` attributes on the real UI.
 */
export const tourSteps: Record<SettingsRole, TourStep[]> = {
  patient: [
    {
      id: "welcome",
      title: "welcome.title",
      body: "welcome.body_patient",
      welcome: true,
    },
    {
      id: "start",
      title: "patient.start.title",
      body: "patient.start.body",
      tab: "overview",
      target: "patient-start",
      placement: "right",
    },
    {
      id: "limb",
      title: "patient.limb.title",
      body: "patient.limb.body",
      tab: "overview",
      target: "patient-limb",
      fallbackTarget: "nav-limbs",
      placement: "left",
    },
    {
      id: "progress",
      title: "patient.progress.title",
      body: "patient.progress.body",
      tab: "progress",
      target: "patient-progress",
      fallbackTarget: "nav-progress",
      placement: "top",
    },
    {
      id: "plan",
      title: "patient.plan.title",
      body: "patient.plan.body",
      tab: "program",
      target: "patient-program",
      fallbackTarget: "nav-program",
      placement: "top",
    },
  ],

  therapist: [
    {
      id: "welcome",
      title: "welcome.title",
      body: "welcome.body_therapist",
      welcome: true,
    },
    {
      id: "summary",
      title: "therapist.summary.title",
      body: "therapist.summary.body",
      tab: "home",
      target: "therapist-summary",
      fallbackTarget: "nav-home",
      placement: "bottom",
    },
    {
      id: "patients",
      title: "therapist.patients.title",
      body: "therapist.patients.body",
      tab: "patients",
      target: "therapist-patients",
      fallbackTarget: "nav-patients",
      placement: "top",
    },
    {
      id: "plan",
      title: "therapist.plan.title",
      body: "therapist.plan.body",
      tab: "patients",
      target: "therapist-patients",
      fallbackTarget: "nav-patients",
      placement: "bottom",
    },
    {
      id: "code",
      title: "therapist.code.title",
      body: "therapist.code.body",
      tab: "settings",
      target: "therapist-code",
      fallbackTarget: "nav-settings",
      placement: "right",
    },
  ],

  experience: [
    {
      id: "welcome",
      title: "welcome.title",
      body: "welcome.body_experience",
      welcome: true,
    },
    {
      id: "start",
      title: "experience.start.title",
      body: "experience.start.body",
      tab: "overview",
      target: "experience-start",
      fallbackTarget: "nav-overview",
      placement: "right",
    },
    {
      id: "limb",
      title: "experience.limb.title",
      body: "experience.limb.body",
      tab: "design",
      target: "experience-limb",
      fallbackTarget: "nav-design",
      placement: "top",
    },
  ],
};
