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
 */
const SELECTION_KEY = "liminal:limbSelection";
const LAST_MODEL_KEY = "liminal:lastModelUrl";
/** Legacy key — used to store a bare card id. Read once for migration. */
const LEGACY_KEY = "liminal:selectedLimbId";

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

/** Strip a variant suffix ("l3-v2" → "l3") and confirm it's a real limb id. */
function resolveLimbId(cardId: string): string {
  if (limbModels.some((l) => l.id === cardId)) return cardId;
  const base = cardId.split("-")[0];
  return limbModels.some((l) => l.id === base) ? base : cardId;
}

export function getLimbSelection(): LimbSelection | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SELECTION_KEY);
    if (raw) return JSON.parse(raw) as LimbSelection;

    // Migrate the legacy plain-string key (a bare card id).
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      return { cardId: legacy, limbId: resolveLimbId(legacy), modelFile: null };
    }
    return null;
  } catch {
    return null;
  }
}

export function setLimbSelection(sel: LimbSelection): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SELECTION_KEY, JSON.stringify(sel));
  } catch {
    /* ignore (private mode / storage disabled) */
  }
}

/** The real limb model the patient selected, or null if none yet. */
export function getSelectedLimb(): LimbModel | null {
  const sel = getLimbSelection();
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
export function getSelectedModelUrl(): string | null {
  const sel = getLimbSelection();
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
export function getLastModelUrl(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LAST_MODEL_KEY);
  } catch {
    return null;
  }
}

/** True once the patient has run at least one AR session (not their first time). */
export function hasLastModel(): boolean {
  return getLastModelUrl() !== null;
}

export function setLastModelUrl(url: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_MODEL_KEY, url);
  } catch {
    /* ignore (private mode / storage disabled) */
  }
}
