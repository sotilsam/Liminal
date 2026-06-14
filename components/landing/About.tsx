"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { Lightbulb, Activity, Users } from "lucide-react";

const HowAreWe3D = dynamic(
  () => import("./HowAreWe3D").then((m) => m.HowAreWe3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse-ring h-16 w-16 rounded-full bg-primary/20" />
      </div>
    ),
  }
);

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const cards = [
  { Icon: Lightbulb, titleKey: "idea_title" as const, descKey: "idea_desc" as const },
  { Icon: Activity,  titleKey: "does_title" as const, descKey: "does_desc" as const },
  { Icon: Users,     titleKey: "who_title" as const,  descKey: "who_desc" as const },
];

const founders = [
  { nameKey: "founder1_name" as const, roleKey: "founder1_role" as const },
  { nameKey: "founder2_name" as const, roleKey: "founder2_role" as const },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function About() {
  const t = useTranslations("about");
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="border-t border-border px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl">

        {/* ── Hero row: copy (left) + 3D illustration (right) ──────────── */}
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">

          {/* Left: eyebrow + heading + intro */}
          <div className="text-center lg:text-start">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: EASE }}
              className="text-xs font-bold uppercase tracking-[0.28em]"
              style={{
                background: "linear-gradient(90deg, #a855f7 0%, #14b8a6 55%, #f43f5e 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t("eyebrow")}
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.08, duration: 0.55, ease: EASE }}
              className="mt-5 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
            >
              {t("title")}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.16, duration: 0.55, ease: EASE }}
              className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-foreground/70 lg:mx-0"
            >
              {t("intro")}
            </motion.p>
          </div>

          {/* Right: 3D characters on a grounded teal panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
            className="relative h-85 w-full overflow-hidden rounded-3xl border border-primary/15 sm:h-105"
            style={{
              background:
                "radial-gradient(120% 90% at 50% 12%, oklch(0.62 0.19 195 / 0.12), oklch(0.62 0.19 195 / 0.03) 70%)",
            }}
          >
            {/* Soft baseline shadow so the figures sit on the panel */}
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-10 left-1/2 h-9 w-3/5 -translate-x-1/2 rounded-[50%]"
              style={{
                background:
                  "radial-gradient(ellipse, oklch(0.45 0.05 250 / 0.28), transparent 70%)",
                filter: "blur(10px)",
              }}
            />
            <HowAreWe3D />
          </motion.div>
        </div>

        {/* ── Idea / What it does / Who it's for cards ─────────────────── */}
        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          {cards.map(({ Icon, titleKey, descKey }, i) => (
            <motion.div
              key={titleKey}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.24 + i * 0.1, duration: 0.55, ease: EASE }}
              className="group rounded-2xl border border-border bg-background/40 p-8 transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-[0_0_28px_oklch(0.62_0.19_195/0.18)]"
            >
              <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-background">
                <Icon className="size-6 text-primary" />
              </div>
              <h3 className="mt-6 font-heading text-xl font-semibold text-foreground">
                {t(titleKey)}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-foreground/70">
                {t(descKey)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.46, duration: 0.55, ease: EASE }}
          className="mt-16"
        >
          <p className="text-center text-xs font-bold uppercase tracking-[0.28em] text-foreground/50">
            {t("team_label")}
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            {founders.map(({ nameKey, roleKey }) => {
              const name = t(nameKey);
              return (
                <div
                  key={nameKey}
                  className="flex w-full max-w-xs items-center gap-4 rounded-full border border-border bg-background/40 py-3 ps-3 pe-6"
                >
                  <span
                    className="flex size-12 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #a855f7 0%, #14b8a6 100%)" }}
                  >
                    {initials(name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-heading font-semibold text-foreground">
                      {name}
                    </span>
                    <span className="block truncate text-sm text-foreground/60">
                      {t(roleKey)}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
