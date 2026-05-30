"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { UserCircle2, Scan, TrendingUp } from "lucide-react";

const steps = [
  { Icon: UserCircle2, titleKey: "step1_title" as const, descKey: "step1_desc" as const },
  { Icon: Scan,        titleKey: "step2_title" as const, descKey: "step2_desc" as const },
  { Icon: TrendingUp,  titleKey: "step3_title" as const, descKey: "step3_desc" as const },
];

export function HowItWorks() {
  const t = useTranslations("howItWorks");
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="mesh-animated border-t border-border px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-4xl">

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="text-center font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          {t("title")}
        </motion.h2>

        {/* Process flow */}
        <div className="relative mt-20">
          {/* Connecting line — desktop only */}
          <div
            aria-hidden
            className="absolute top-6 hidden sm:block"
            style={{ left: "calc(16.666% + 24px)", right: "calc(16.666% + 24px)", height: "1px", background: "oklch(0.89 0.025 195)" }}
          />

          <div className="grid gap-12 sm:grid-cols-3">
            {steps.map(({ Icon, titleKey, descKey }, i) => (
              <motion.div
                key={titleKey}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  delay: i * 0.15,
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                }}
                className="group flex flex-col items-center text-center"
              >
                {/* Icon node — the hover glow lives here */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 18 }}
                  className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-[border-color,box-shadow] duration-200 group-hover:border-primary/40 group-hover:shadow-[0_0_20px_oklch(0.62_0.19_195/0.28)]"
                >
                  <Icon className="size-5 text-primary" />
                </motion.div>

                <h3 className="mt-6 font-heading text-base font-semibold text-foreground">
                  {t(titleKey)}
                </h3>
                <p
                  className="mt-2.5 text-sm leading-relaxed text-muted-foreground"
                  style={{ maxWidth: "28ch" }}
                >
                  {t(descKey)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
