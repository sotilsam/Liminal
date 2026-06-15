"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { ArrowRight } from "lucide-react";
import { LimbPlaceholderCard } from "./LimbPlaceholderCard";
import { limbModels, type LimbModel } from "@/lib/mock-data";
import {
  getLimbSelection,
  setLimbSelection,
  resolveModelFile,
} from "@/lib/limbSelection";
import { useRouter } from "@/i18n/navigation";

// How many .glb variants exist per limb config (file prefix → count).
// Keep in sync with the files in public/models/ (e.g. arm_above_right_05.glb).
// Configs not listed here fall back to DEFAULT_VARIANT_COUNT.
const VARIANT_COUNTS: Record<string, number> = {
  arm_above_right: 5,
  leg_above_left: 4,
  leg_above_right: 3,
};
const DEFAULT_VARIANT_COUNT = 4;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

interface LimbGridProps {
  /** Scopes the limb selection to this user's account. */
  userId: string;
  amputationType?: string | null;
  amputationSide?: string | null;
}

export function LimbGrid({ userId, amputationType, amputationSide }: LimbGridProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedLimb, setSelectedLimb] = useState<LimbModel | null>(null);
  const [selectedModelFile, setSelectedModelFile] = useState<string | null>(null);

  // localStorage is only available on the client — read after mount.
  useEffect(() => {
    const sel = getLimbSelection(userId);
    if (sel) {
      setSelectedId(sel.cardId);
      setSelectedLimb(limbModels.find((l) => l.id === sel.limbId) ?? null);
      setSelectedModelFile(sel.modelFile);
    }
  }, [userId]);

  function handleSelect(card: CardEntry) {
    setSelectedId(card.cardId);
    setSelectedLimb(limbModels.find((l) => l.id === card.id) ?? null);
    setSelectedModelFile(card.modelFile ?? null);
    // Persist the real limb id (so the overview resolves it) alongside the exact
    // card and its variant model file.
    setLimbSelection(userId, {
      cardId: card.cardId,
      limbId: card.id,
      modelFile: card.modelFile ?? null,
    });
  }

  function handleContinue() {
    if (!selectedLimb) return;
    // The model the patient picked here is what the AR camera renders.
    router.push({
      pathname: "/ar-test",
      query: {
        limbType: selectedLimb.limbType,
        side: selectedLimb.side,
        level: selectedLimb.level,
        model: resolveModelFile(selectedLimb, selectedModelFile),
      },
    });
  }

  type CardEntry = (typeof limbModels)[0] & { cardId: string; variant?: number; modelFile?: string | null };

  const cards: CardEntry[] = (() => {
    if (!amputationType || amputationType === "other") {
      return limbModels.map((l) => ({ ...l, cardId: l.id }));
    }

    const limbType = amputationType.includes("knee") ? "leg" : "arm";

    if (amputationSide === "bilateral") {
      // Bilateral: show all 4 limb combinations for this limb type
      return limbModels
        .filter((l) => l.limbType === limbType)
        .map((l) => ({ ...l, cardId: l.id }));
    }

    // Single side: find the matching limb and generate 4 selectable variants
    const base = limbModels.find(
      (l) => l.level === amputationType && l.side === amputationSide
    );
    if (!base) return limbModels.map((l) => ({ ...l, cardId: l.id }));

    // Build paths matching the convention: leg_above_left_01.glb
    const levelPart = base.level.startsWith("above") ? "above" : "below";
    const prefix = `${base.limbType}_${levelPart}_${base.side}`;
    const count = VARIANT_COUNTS[prefix] ?? DEFAULT_VARIANT_COUNT;
    return Array.from({ length: count }, (_, i) => i + 1).map((v) => ({
      ...base,
      cardId: `${base.id}-v${v}`,
      variant: v,
      modelFile: `/models/${prefix}_${String(v).padStart(2, "0")}.glb`,
    }));
  })();

  return (
    <section>
      <h2 className="mb-1 font-heading text-base font-semibold text-foreground">
        {t("limb_grid_title")}
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">{t("limb_select_hint")}</p>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      >
        {cards.map((card) => (
          <motion.div key={card.cardId} variants={itemVariants}>
            <LimbPlaceholderCard
              label={locale === "he" ? card.labelHe : card.label}
              variant={card.variant}
              modelFile={card.modelFile}
              modelHeight={360}
              selected={selectedId === card.cardId}
              onSelect={() => handleSelect(card)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Once a limb is picked, surface a clear way forward. */}
      <AnimatePresence>
        {selectedLimb && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="sticky bottom-4 mt-6 flex justify-center"
          >
            <button
              type="button"
              onClick={handleContinue}
              className="group flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-heading text-sm font-bold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02]"
            >
              {t("continue_to_ar")}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
