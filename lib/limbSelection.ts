import { limbModels, type LimbModel } from "./mock-data";

/**
 * The limb a patient picked in the "Limb Selection" tab is the limb their AR
 * session launches with. We persist the choice in localStorage so it survives
 * navigation between dashboard tabs (which mount/unmount independently) and page
 * reloads, without needing a DB round-trip.
 *
 * Two things are remembered:
 *  - the limb selection (which card, and the real limb it maps to), and
 *  - the last 3D model the patient actually ran in an AR session,
 * so a returning patient can be offered "reuse your last model, or pick another".
 *
 * Both are scoped per user id, so signing in with a different account on the
 * same browser never inherits another user's selection (a brand-new patient
 * must start with a clean slate — no "last used" limb).
 */
const SELECTION_PREFIX = "liminal:limbSelection";
const LAST_MODEL_PREFIX = "liminal:lastModelUrl";

const selectionKey = (userId: string) => `${SELECTION_PREFIX}:${userId}`;
const lastModelKey = (userId: string) => `${LAST_MODEL_PREFIX}:${userId}`;

export interface LimbSelection {
  /**
   * The exact card chosen in the grid. May be a variant id like "l3-v2", which
   * is why we keep it separate from `limbId` — it restores the grid's highlight.
   */
  cardId: string;
  /** Resolved real `limbModels` id (e.g. "l3"). This is what launches AR. */
  limbId: string;
  /** Dashboard variant model file (.glb), when the chosen card was a variant. */
  modelFile: string | null;
}

export function getLimbSelection(userId: string): LimbSelection | null {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const raw = window.localStorage.getItem(selectionKey(userId));
    return raw ? (JSON.parse(raw) as LimbSelection) : null;
  } catch {
    return null;
  }
}

export function setLimbSelection(userId: string, sel: LimbSelection): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    window.localStorage.setItem(selectionKey(userId), JSON.stringify(sel));
  } catch {
    /* ignore (private mode / storage disabled) */
  }
}

/** The real limb model the patient selected, or null if none yet. */
export function getSelectedLimb(userId: string): LimbModel | null {
  const sel = getLimbSelection(userId);
  if (!sel) return null;
  return limbModels.find((l) => l.id === sel.limbId) ?? null;
}

/**
 * The .glb the AR camera should render for a limb. Prefers the exact variant the
 * patient picked in the grid; otherwise falls back to the first model of the
 * matching type/level/side by naming convention (e.g. leg_above_left_01.glb).
 */
export function resolveModelFile(limb: LimbModel, modelFile?: string | null): string {
  if (modelFile) return modelFile;
  const lvl = limb.level.startsWith("above") ? "above" : "below";
  return `/models/${limb.limbType}_${lvl}_${limb.side}_01.glb`;
}

/** The model URL for the patient's current selection, ready to launch AR with. */
export function getSelectedModelUrl(userId: string): string | null {
  const sel = getLimbSelection(userId);
  if (!sel) return null;
  const limb = limbModels.find((l) => l.id === sel.limbId);
  if (!limb) return null;
  return resolveModelFile(limb, sel.modelFile);
}

/**
 * The 3D model URL from the patient's last AR session. Returns:
 *  - a model url (e.g. "/models/leg_left.glb"),
 *  - "" when they last ran the built-in/default model, or
 *  - null when they have never run a session (a first-time patient).
 */
export function getLastModelUrl(userId: string): string | null {
  if (typeof window === "undefined" || !userId) return null;
  try {
    return window.localStorage.getItem(lastModelKey(userId));
  } catch {
    return null;
  }
}

/** True once the patient has run at least one AR session (not their first time). */
export function hasLastModel(userId: string): boolean {
  return getLastModelUrl(userId) !== null;
}

export function setLastModelUrl(userId: string, url: string): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    window.localStorage.setItem(lastModelKey(userId), url);
  } catch {
    /* ignore (private mode / storage disabled) */
  }
}
