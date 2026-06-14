"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { UserCircle2, Scan, TrendingUp } from "lucide-react";

const steps = [
  { Icon: UserCircle2, titleKey: "step1_title" as const, descKey: "step1_desc" as const, img: "/Create.png" },
  { Icon: Scan,        titleKey: "step2_title" as const, descKey: "step2_desc" as const, img: "/Calibrate.png" },
  { Icon: TrendingUp,  titleKey: "step3_title" as const, descKey: "step3_desc" as const, img: "/Train.png" },
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
          className="text-center font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
        >
          {t("title")}
        </motion.h2>

        {/* Process flow */}
        <div className="relative mt-24">
          {/* Connecting line — desktop only */}
          <div
            aria-hidden
            className="absolute top-9 hidden bg-border sm:block"
            style={{ left: "calc(16.666% + 32px)", right: "calc(16.666% + 32px)", height: "1px" }}
          />

          <div className="grid gap-14 sm:grid-cols-3">
            {steps.map(({ Icon, titleKey, descKey, img }, i) => {
              return (
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
                    className="relative z-10 flex h-18 w-18 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-[border-color,box-shadow] duration-200 group-hover:border-primary/40 group-hover:shadow-[0_0_24px_oklch(0.62_0.19_195/0.32)]"
                  >
                    <Icon className="size-8 text-primary" />
                  </motion.div>

                  <h3 className="mt-7 font-heading text-xl font-semibold text-foreground sm:text-2xl">
                    {t(titleKey)}
                  </h3>
                  <p
                    className="mt-3 text-base leading-relaxed text-foreground/70"
                    style={{ maxWidth: "30ch" }}
                  >
                    {t(descKey)}
                  </p>

                  {/* Step illustration — uniform width & aspect across the row */}
                  <div className="relative mt-8 aspect-19/10 w-full overflow-hidden rounded-xl border border-border bg-background shadow-sm">
                    <Image
                      src={img}
                      alt={t(titleKey)}
                      fill
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
