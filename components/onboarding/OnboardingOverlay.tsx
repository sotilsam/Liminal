"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { useOnboarding } from "./OnboardingProvider";
import { WelcomeIllustration } from "./WelcomeIllustration";
import type { TourPlacement } from "./tourSteps";

/** Viewport-space rectangle of the spotlight (already padded). */
interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const SPOTLIGHT_PAD = 8;
const CARD_WIDTH = 320; // fixed so positioning is deterministic
const GAP = 16; // distance between target and card
const EDGE = 12; // min margin from viewport edges
const EASE = [0.22, 1, 0.36, 1] as const;

function measure(el: Element): Rect {
  const r = el.getBoundingClientRect();
  const top = Math.max(EDGE / 2, r.top - SPOTLIGHT_PAD);
  const left = Math.max(EDGE / 2, r.left - SPOTLIGHT_PAD);
  return {
    top,
    left,
    width: Math.min(window.innerWidth - left - EDGE / 2, r.width + SPOTLIGHT_PAD * 2),
    height: Math.min(window.innerHeight - top - EDGE / 2, r.height + SPOTLIGHT_PAD * 2),
  };
}

interface Positioned {
  top: number;
  left: number;
  side: "top" | "bottom" | "left" | "right";
  /** Arrow offset (px) from the card's start edge along the relevant axis. */
  arrow: number;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/** Pick a side with room (preferring `placement`) and place the card + arrow. */
function place(
  rect: Rect,
  cardH: number,
  placement: TourPlacement
): Positioned {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const room: Record<TourPlacement, boolean> = {
    bottom: rect.top + rect.height + GAP + cardH + EDGE <= vh,
    top: rect.top - GAP - cardH - EDGE >= 0,
    right: rect.left + rect.width + GAP + CARD_WIDTH + EDGE <= vw,
    left: rect.left - GAP - CARD_WIDTH - EDGE >= 0,
  };
  const order: TourPlacement[] = [
    placement,
    "bottom",
    "top",
    "right",
    "left",
  ];
  const side = order.find((p) => room[p]) ?? placement;

  if (side === "top" || side === "bottom") {
    const left = clamp(cx - CARD_WIDTH / 2, EDGE, vw - CARD_WIDTH - EDGE);
    const top = side === "bottom" ? rect.top + rect.height + GAP : rect.top - GAP - cardH;
    return { top, left, side, arrow: clamp(cx - left, 18, CARD_WIDTH - 18) };
  }
  const top = clamp(cy - cardH / 2, EDGE, vh - cardH - EDGE);
  const left = side === "right" ? rect.left + rect.width + GAP : rect.left - GAP - CARD_WIDTH;
  return { top, left, side, arrow: clamp(cy - top, 18, cardH - 18) };
}

export function OnboardingOverlay() {
  const t = useTranslations("onboarding");
  const reduce = useReducedMotion();
  const { step, index, total, next, back, skip } = useOnboarding();

  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const [ready, setReady] = useState(false);
  const [cardH, setCardH] = useState(180);

  const targetElRef = useRef<Element | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const maskId = useId().replace(/:/g, "");

  useEffect(() => {
    setMounted(true);
  }, []);

  const isWelcome = !!step?.welcome;

  // --- Locate + measure the target for the current step ------------------
  useEffect(() => {
    if (!step) return;
    let cancelled = false;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    setReady(false);

    if (isWelcome) {
      targetElRef.current = null;
      setRect(null);
      setReady(true);
      return;
    }

    const locate = () => {
      if (cancelled) return;
      let el = step.target
        ? document.querySelector(`[data-tour="${step.target}"]`)
        : null;
      if (!el && step.fallbackTarget) {
        el = document.querySelector(`[data-tour="${step.fallbackTarget}"]`);
      }
      if (el) {
        targetElRef.current = el;
        el.scrollIntoView({ block: "center", inline: "center", behavior: "auto" });
        // Measure after the (instant) scroll settles.
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            if (cancelled || !el) return;
            setRect(measure(el));
            setReady(true);
          })
        );
        return;
      }
      // Not mounted yet — poll briefly, then skip this step gracefully.
      if (tries++ > 30) {
        next();
        return;
      }
      timer = setTimeout(locate, 50);
    };

    timer = setTimeout(locate, 60);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // index drives re-runs even when target string repeats across steps.
  }, [step, index, isWelcome, next]);

  // Keep the spotlight glued to the element on scroll / resize.
  useEffect(() => {
    if (isWelcome || !ready) return;
    const update = () => {
      const el = targetElRef.current;
      if (el && el.isConnected) setRect(measure(el));
    };
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [isWelcome, ready]);

  // Measure the card height so the tooltip can be placed precisely.
  useLayoutEffect(() => {
    if (cardRef.current) setCardH(cardRef.current.offsetHeight);
  }, [step, ready, rect]);

  // --- Keyboard: Esc skips, Tab is trapped inside the card ----------------
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        skip();
        return;
      }
      if (e.key !== "Tab") return;
      const root = cardRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [skip]
  );

  // Move focus into the card whenever the step changes.
  useEffect(() => {
    if (!ready) return;
    const id = requestAnimationFrame(() => {
      const root = cardRef.current;
      if (!root) return;
      const primary = root.querySelector<HTMLElement>("[data-onb-primary]");
      (primary ?? root).focus();
    });
    return () => cancelAnimationFrame(id);
  }, [ready, index]);

  if (!mounted || !step) return null;

  const pos =
    !isWelcome && rect
      ? place(rect, cardH, step.placement ?? "bottom")
      : null;

  const titleId = `onb-title-${index}`;
  const bodyId = `onb-body-${index}`;
  const spring = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 320, damping: 32 };

  const dots = Array.from({ length: total });

  // Shared footer: progress + controls (Skip is always reachable).
  const footer = (
    <div className="mt-5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5" aria-hidden>
        {dots.map((_, i) => (
          <span
            key={i}
            className={
              i === index
                ? "h-1.5 w-4 rounded-full bg-primary transition-all"
                : "h-1.5 w-1.5 rounded-full bg-primary/25 transition-all"
            }
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        {index > 0 && (
          <button
            type="button"
            onClick={back}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {t("controls.back")}
          </button>
        )}
        <button
          type="button"
          data-onb-primary
          onClick={next}
          className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          {index >= total - 1 ? t("controls.finish") : t("controls.next")}
        </button>
      </div>
    </div>
  );

  const header = (
    <div className="flex items-start justify-between gap-3">
      <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-primary">
        {t("controls.step", { current: index + 1, total })}
      </span>
      <button
        type="button"
        onClick={skip}
        aria-label={t("controls.skip")}
        className="-me-1 -mt-1 flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {t("controls.skip")}
        <X className="size-3.5" />
      </button>
    </div>
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      onKeyDown={onKeyDown}
    >
      {/* Dim + spotlight cutout. Subtle teal-tinted dim, not heavy black. */}
      {pos ? (
        <svg className="pointer-events-auto absolute inset-0 h-full w-full">
          <defs>
            <mask id={`mask-${maskId}`}>
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <motion.rect
                initial={false}
                animate={{
                  x: rect!.left,
                  y: rect!.top,
                  width: rect!.width,
                  height: rect!.height,
                }}
                transition={spring}
                rx={16}
                ry={16}
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="oklch(0.22 0.03 220 / 0.42)"
            mask={`url(#mask-${maskId})`}
          />
          {/* Holographic ring around the spotlight */}
          <motion.rect
            initial={false}
            animate={{
              x: rect!.left,
              y: rect!.top,
              width: rect!.width,
              height: rect!.height,
            }}
            transition={spring}
            rx={16}
            ry={16}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={1.5}
            opacity={0.9}
            style={{ filter: "drop-shadow(0 0 8px var(--primary))" }}
          />
        </svg>
      ) : (
        <div className="pointer-events-auto absolute inset-0 bg-[oklch(0.22_0.03_220_/_0.42)] backdrop-blur-[2px]" />
      )}

      {/* Welcome card — centered illustrated step */}
      <AnimatePresence mode="wait">
        {isWelcome ? (
          <motion.div
            key="welcome"
            ref={cardRef}
            tabIndex={-1}
            initial={reduce ? false : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="pointer-events-auto absolute left-1/2 top-1/2 w-[26rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-popover p-6 text-popover-foreground shadow-2xl outline-none"
          >
            {header}
            <div className="mt-4">
              <WelcomeIllustration />
            </div>
            <h2
              id={titleId}
              className="mt-5 font-heading text-xl font-bold text-foreground"
            >
              {t(step.title)}
            </h2>
            <p id={bodyId} className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t(step.body)}
            </p>
            {footer}
          </motion.div>
        ) : (
          pos && (
            <motion.div
              key={`step-${index}`}
              ref={cardRef}
              tabIndex={-1}
              initial={reduce ? false : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: EASE }}
              style={{ top: pos.top, left: pos.left, width: CARD_WIDTH }}
              className="pointer-events-auto fixed outline-none"
            >
              {/* Arrow (diamond) pointing at the target */}
              <div
                aria-hidden
                className="absolute h-3.5 w-3.5 rotate-45 border border-border bg-popover"
                style={
                  pos.side === "top"
                    ? { top: -7, left: pos.arrow - 7 }
                    : pos.side === "bottom"
                    ? { bottom: -7, left: pos.arrow - 7 }
                    : pos.side === "left"
                    ? { left: -7, top: pos.arrow - 7 }
                    : { right: -7, top: pos.arrow - 7 }
                }
              />
              <div className="relative rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-2xl">
                {header}
                <h3
                  id={titleId}
                  className="mt-3 font-heading text-base font-bold text-foreground"
                >
                  {t(step.title)}
                </h3>
                <p
                  id={bodyId}
                  className="mt-1.5 text-sm leading-relaxed text-muted-foreground"
                >
                  {t(step.body)}
                </p>
                {footer}
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}
