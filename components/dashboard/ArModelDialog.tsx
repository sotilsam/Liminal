"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Scan, Boxes, RefreshCw, X } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import type { LimbModel } from "@/lib/mock-data";
import { getLastModelUrl } from "@/lib/limbSelection";

interface ArModelDialogProps {
  /** The limb the AR session will launch with. */
  limb: LimbModel;
  open: boolean;
  onClose: () => void;
  /** Send the patient to Limb Selection to pick a different model. */
  onTryAnother: () => void;
}

/**
 * Asks a returning patient whether to reuse the 3D model from their last AR
 * session or pick a different one:
 *  - "Use last model": opens AR straight into the remembered model (the camera).
 *  - "Try another":    sends them back to Limb Selection to choose a new one.
 */
export function ArModelDialog({ limb, open, onClose, onTryAnother }: ArModelDialogProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();

  function useLastModel() {
    onClose();
    // getLastModelUrl() may be "" (the built-in/default model) — pass it through.
    router.push({
      pathname: "/ar-test",
      query: {
        limbType: limb.limbType,
        side: limb.side,
        level: limb.level,
        model: getLastModelUrl() ?? "",
      },
    });
  }

  function tryAnother() {
    onClose();
    onTryAnother();
  }

  const limbLabel = locale === "he" ? limb.labelHe : limb.label;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label={t("ar_model_cancel")}
            onClick={onClose}
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={t("ar_model_cancel")}
              className="absolute end-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary"
            >
              <X className="size-4" />
            </button>

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Scan className="size-6" />
            </div>

            <h3 className="font-heading text-lg font-bold text-foreground">
              {t("ar_model_dialog_title")}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("ar_model_dialog_desc", { limb: limbLabel })}
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={useLastModel}
                className="group flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 text-start transition-colors hover:bg-primary/15"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Boxes className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-sm font-bold text-foreground">
                    {t("ar_use_last_model")}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {t("ar_use_last_model_sub")}
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={tryAnother}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-start transition-colors hover:bg-secondary/50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <RefreshCw className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-sm font-bold text-foreground">
                    {t("ar_try_another")}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {t("ar_try_another_sub")}
                  </span>
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
