"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import {
  Camera,
  PersonStanding,
  Box,
  SlidersHorizontal,
  X,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { arInstructionsSeenKey } from "@/lib/onboarding";

// The first-run primer shown the first time a patient lands on AR training.
// Mirrors the dashboard walkthrough's "show once" behaviour, but it's a single
// self-contained card gated by a per-user local-storage marker (no DB flag).
const STEP_KEYS = ["camera", "frame", "limb", "adjust"] as const;
const STEP_ICONS: Record<(typeof STEP_KEYS)[number], LucideIcon> = {
  camera: Camera,
  frame: PersonStanding,
  limb: Box,
  adjust: SlidersHorizontal,
};

export function ArTrainingInstructions() {
  const t = useTranslations("ar_instructions");
  const locale = useLocale();
  const dir = locale === "he" ? "rtl" : "ltr";

  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Decide whether to show only after we know who's signed in, so a returning
  // patient who's already seen it never gets a flash of the card.
  useEffect(() => {
    let active = true;
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (!active) return;
        const id = data.user?.id ?? null;
        setUserId(id);
        try {
          const seen =
            !!id &&
            window.localStorage.getItem(arInstructionsSeenKey(id)) === "1";
          if (!seen) setOpen(true);
        } catch {
          // Storage blocked (private mode) — show it; worst case it reappears.
          setOpen(true);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      if (userId)
        window.localStorage.setItem(arInstructionsSeenKey(userId), "1");
    } catch {
      /* nothing durable to write to — it'll just show again next time */
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label={t("title")}
          dir={dir}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            background: "rgba(4,4,10,.78)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            fontFamily: '"Heebo", sans-serif',
          }}
          onClick={dismiss}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 460,
              maxHeight: "calc(100vh - 32px)",
              overflowY: "auto",
              background: "#0e0e1a",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 24px 60px rgba(0,0,0,.55)",
              color: "#eef0f6",
            }}
          >
            <button
              type="button"
              onClick={dismiss}
              aria-label={t("dismiss")}
              style={{
                position: "absolute",
                top: 14,
                insetInlineEnd: 14,
                display: "inline-flex",
                padding: 6,
                color: "rgba(238,240,246,.5)",
                background: "transparent",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>

            <p
              style={{
                fontSize: 22,
                fontWeight: 700,
                margin: 0,
                paddingInlineEnd: 28,
              }}
            >
              {t("title")}
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 14,
                lineHeight: 1.5,
                color: "rgba(238,240,246,.65)",
              }}
            >
              {t("subtitle")}
            </p>

            <ol
              style={{
                listStyle: "none",
                margin: "20px 0 0",
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {STEP_KEYS.map((key, i) => {
                const Icon = STEP_ICONS[key];
                return (
                  <li
                    key={key}
                    style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
                  >
                    <span
                      aria-hidden
                      style={{
                        position: "relative",
                        flexShrink: 0,
                        width: 40,
                        height: 40,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 12,
                        background: "rgba(45,212,191,.12)",
                        color: "#2dd4bf",
                      }}
                    >
                      <Icon size={20} />
                      <span
                        style={{
                          position: "absolute",
                          top: -6,
                          insetInlineStart: -6,
                          width: 18,
                          height: 18,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          background: "#2dd4bf",
                          color: "#03201c",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {i + 1}
                      </span>
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 15,
                          fontWeight: 600,
                          color: "#eef0f6",
                        }}
                      >
                        {t(`steps.${key}.title`)}
                      </p>
                      <p
                        style={{
                          margin: "3px 0 0",
                          fontSize: 13.5,
                          lineHeight: 1.5,
                          color: "rgba(238,240,246,.6)",
                        }}
                      >
                        {t(`steps.${key}.body`)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <button
              type="button"
              onClick={dismiss}
              style={{
                marginTop: 24,
                width: "100%",
                padding: "12px 16px",
                fontSize: 15,
                fontWeight: 700,
                color: "#03201c",
                background: "linear-gradient(135deg, #2dd4bf, #14b8a6)",
                border: "none",
                borderRadius: 12,
                cursor: "pointer",
              }}
            >
              {t("dismiss")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
