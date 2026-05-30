"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { Sparkles, ChevronDown, ArrowUpRight } from "lucide-react";
import { UploadCharacterModal } from "./UploadCharacterModal";

const HeroCharacter3D = dynamic(
  () => import("./HeroCharacter3D").then((m) => m.HeroCharacter3D),
  { ssr: false, loading: () => <CharacterFallback /> }
);

function CharacterFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="animate-pulse-ring h-20 w-20 rounded-full bg-primary/20" />
    </div>
  );
}


export function HeroSection() {
  const t = useTranslations("hero");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Slow parallax on LIMINAL watermark
  const { scrollY } = useScroll();
  const liminalY = useTransform(scrollY, [0, 800], [0, -100]);

  return (
    <>
      <section className="hero-premium relative min-h-screen overflow-hidden">

        {/* ── Layer 0: animated gradient (section bg, visible at edges) ── */}

        {/* ── Layer 10: Spline 3D scene ────────────────────────────────── */}
        <div className="absolute inset-0 z-10">
          {uploadedImage ? (
            <div className="absolute inset-0 flex items-center justify-center p-16">
              <motion.img
                src={uploadedImage}
                alt="Your character"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="animate-float max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <HeroCharacter3D />
          )}
        </div>

        {/* ── Layer 11: Giant LIMINAL watermark — above canvas, 7% opacity ── */}
        {/*   Appears to float "behind" the character due to near-transparency  */}
        <motion.div
          aria-hidden
          style={{ y: liminalY }}
          className="pointer-events-none select-none absolute inset-0 z-5 flex items-center justify-center overflow-hidden"
        >
          <span
            style={{
              fontSize: "clamp(150px, 20vw, 300px)",
              fontWeight: 900,
              textTransform: "uppercase" as const,
              letterSpacing: "0.05em",
              color: "rgba(0, 200, 200, 0.07)",
              lineHeight: 1,
              fontFamily: "var(--font-heading)",
              userSelect: "none",
            }}
          >
            LIMINAL
          </span>
        </motion.div>

        {/* ── Layer 12: Dot grid texture overlay ───────────────────────── */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[12] hero-dots"
        />

        {/* ── Layer 20: Heading (left) ──────────────────────────────────── */}
        <div className="absolute left-8 top-[30%] z-20 max-w-[360px] lg:left-14 lg:top-[32%]">

          {/* "AI · AR · REHABILITATION" label */}
          <motion.p
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: "12px",
              letterSpacing: "4px",
              color: "rgba(0, 170, 170, 1)",
              textTransform: "uppercase" as const,
              fontWeight: 600,
            }}
          >
            AI · AR · REHABILITATION
          </motion.p>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: "clamp(36px, 5vw, 64px)",
              fontWeight: 800,
              lineHeight: 1.1,
              color: "#1a1a1a",
              marginTop: "12px",
              fontFamily: "var(--font-heading)",
            }}
          >
            {t("headline")}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.42, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: "16px",
              color: "#666",
              maxWidth: "320px",
              marginTop: "14px",
              lineHeight: 1.65,
            }}
          >
            {t("subheadline")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.58, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setUploadOpen(true)}
              className="glow-teal-sm relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <span
                aria-hidden
                className="animate-cta-shimmer absolute inset-0 -skew-x-12 bg-linear-to-r from-transparent via-white/20 to-transparent"
              />
              <Sparkles className="size-3.5" />
              {t("cta_character")}
            </motion.button>

            <motion.a
              href="#how-it-works"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: "#555" }}
            >
              {t("cta_start")}
              <ArrowUpRight className="size-3.5" />
            </motion.a>
          </motion.div>
        </div>

        {/* ── Scroll indicator ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown style={{ width: 20, height: 20, color: "rgba(0,0,0,0.20)" }} />
          </motion.div>
        </motion.div>
      </section>

      <AnimatePresence>
        {uploadOpen && (
          <UploadCharacterModal
            onClose={() => setUploadOpen(false)}
            onUploadComplete={(url) => setUploadedImage(url)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
