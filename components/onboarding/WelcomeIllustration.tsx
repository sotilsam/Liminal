"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * On-brand illustrated visual for the welcome step: a holographic hand/limb
 * silhouette inside pulsing teal scanner rings — echoing the product's AR
 * calibration aesthetic. Pure SVG so it stays crisp and theme-aware (it uses
 * the live --primary token, so it adapts to light/dark automatically).
 */
const EASE_INOUT = [0.42, 0, 0.58, 1] as const;

export function WelcomeIllustration() {
  const reduce = useReducedMotion();

  const ring = (delay: number) =>
    reduce
      ? {}
      : {
          animate: { scale: [1, 1.06, 1], opacity: [0.5, 0.85, 0.5] },
          transition: { duration: 3.4, repeat: Infinity, ease: EASE_INOUT, delay },
        };

  return (
    <div className="relative mx-auto flex h-36 w-full items-center justify-center overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-secondary/60 via-card to-secondary/30">
      {/* Soft glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute h-40 w-40 rounded-full bg-primary/15 blur-3xl"
      />

      <svg
        viewBox="0 0 200 200"
        className="relative h-full w-auto"
        role="img"
        aria-hidden
      >
        {/* Scanner rings */}
        <motion.circle
          cx="100"
          cy="100"
          r="74"
          fill="none"
          stroke="var(--primary)"
          strokeOpacity="0.22"
          strokeWidth="1.5"
          style={{ transformOrigin: "100px 100px" }}
          {...ring(0)}
        />
        <motion.circle
          cx="100"
          cy="100"
          r="56"
          fill="none"
          stroke="var(--primary)"
          strokeOpacity="0.4"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          style={{ transformOrigin: "100px 100px" }}
          {...ring(0.6)}
        />
        <motion.circle
          cx="100"
          cy="100"
          r="40"
          fill="none"
          stroke="var(--primary)"
          strokeOpacity="0.5"
          strokeWidth="1.5"
          style={{ transformOrigin: "100px 100px" }}
          {...ring(1.1)}
        />

        {/* Stylised hand / limb */}
        <g
          fill="none"
          stroke="var(--primary)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* palm */}
          <path d="M84 118 q-2 -14 4 -22 l0 -2 q1 -6 6 -6 q5 0 6 6 l0 14" fill="var(--primary)" fillOpacity="0.08" />
          {/* fingers */}
          <path d="M100 108 l0 -30 q0 -6 5 -6 q5 0 5 6 l0 30" />
          <path d="M110 108 l0 -24 q0 -6 5 -6 q5 0 5 6 l0 24" />
          <path d="M90 110 l0 -22 q0 -6 5 -6 q5 0 5 6 l0 22" />
          {/* thumb */}
          <path d="M84 112 l-10 -8 q-5 -4 -1 -9 q4 -4 9 0 l9 8" />
          {/* wrist */}
          <path d="M86 116 q14 8 28 0 l0 18 q-14 7 -28 0 z" fill="var(--primary)" fillOpacity="0.1" />
        </g>

        {/* Sparkle accent */}
        <motion.g
          {...(reduce
            ? {}
            : {
                animate: { opacity: [0.4, 1, 0.4] },
                transition: { duration: 2.2, repeat: Infinity, ease: EASE_INOUT },
              })}
        >
          <path
            d="M148 56 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5 z"
            fill="var(--primary)"
          />
        </motion.g>
      </svg>
    </div>
  );
}
