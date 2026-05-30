"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { LimbPlaceholderCard } from "./LimbPlaceholderCard";
import { limbModels } from "@/lib/mock-data";

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

export function LimbGrid() {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  return (
    <section>
      <h2 className="mb-4 font-heading text-base font-semibold text-foreground">
        {t("limb_grid_title")}
      </h2>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      >
        {limbModels.map((limb) => (
          <motion.div key={limb.id} variants={itemVariants}>
            <LimbPlaceholderCard
              label={locale === "he" ? limb.labelHe : limb.label}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
