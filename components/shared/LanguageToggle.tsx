"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { motion } from "framer-motion";

const langs = [
  { code: "en", label: "EN", gradientFrom: "#80FF72", gradientTo: "#7EE8FA" },
  { code: "he", label: "עב", gradientFrom: "#ffa9c6", gradientTo: "#f434e2" },
] as const;

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div role="group" aria-label="Language selection" className="flex items-center gap-2">
      {langs.map(({ code, label, gradientFrom, gradientTo }) => (
        <LangPill
          key={code}
          label={label}
          isActive={locale === code}
          gradientFrom={gradientFrom}
          gradientTo={gradientTo}
          onClick={() => router.replace(pathname, { locale: code })}
        />
      ))}
    </div>
  );
}

interface LangPillProps {
  label: string;
  isActive: boolean;
  gradientFrom: string;
  gradientTo: string;
  onClick: () => void;
}

function LangPill({ label, isActive, gradientFrom, gradientTo, onClick }: LangPillProps) {
  const [hovered, setHovered] = useState(false);
  const lit = isActive || hovered;

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      aria-pressed={isActive}
      className="relative h-9 w-9 rounded-full bg-white shadow flex items-center justify-center overflow-hidden cursor-pointer"
    >
      {/* Gradient fill */}
      <motion.span
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: `linear-gradient(45deg, ${gradientFrom}, ${gradientTo})` }}
        animate={{ opacity: lit ? 1 : 0 }}
        transition={{ duration: 0.35 }}
      />

      {/* Glow */}
      <motion.span
        className="absolute top-2 inset-x-0 h-full rounded-full pointer-events-none -z-10"
        style={{
          background: `linear-gradient(45deg, ${gradientFrom}, ${gradientTo})`,
          filter: "blur(12px)",
        }}
        animate={{ opacity: lit ? 0.5 : 0 }}
        transition={{ duration: 0.35 }}
      />

      <motion.span
        className="relative z-10 text-xs font-bold tracking-wide"
        animate={{ color: lit ? "#ffffff" : "#9ca3af" }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.span>
    </motion.button>
  );
}
