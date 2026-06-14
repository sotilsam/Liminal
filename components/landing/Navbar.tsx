"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { LoginPanel } from "./LoginPanel";
import { Link } from "@/i18n/navigation";
import { LogIn, UserPlus } from "lucide-react";

export function Navbar() {
  const t = useTranslations("nav");
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const open = () => setLoginOpen(true);
    window.addEventListener("open-login", open);
    return () => window.removeEventListener("open-login", open);
  }, []);

  return (
    <>
      <header className="glass fixed inset-x-0 top-0 z-50 h-16">
        <div className="flex h-full w-full items-center justify-between px-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.span
              className="font-heading text-xl font-bold tracking-tight text-foreground"
              whileHover={{ opacity: 0.7 }}
              transition={{ duration: 0.15 }}
            >
              {t("logo")}
              <span className="text-primary">.</span>
            </motion.span>
          </Link>

          {/* Actions */}
          <nav className="flex items-center gap-2">
            {/* Utility group: language + theme */}
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>

            {/* Divider + spacing to separate auth actions */}
            <span aria-hidden className="mx-2 h-6 w-px bg-border" />

            {/* Auth group: login + register */}
            <GradientPill
              icon={<LogIn className="size-5" />}
              label={t("login")}
              gradientFrom="#a955ff"
              gradientTo="#ea51ff"
              onClick={() => setLoginOpen(true)}
            />

            <Link href="/register">
              <GradientPill
                icon={<UserPlus className="size-5" />}
                label={t("register")}
                gradientFrom="#56CCF2"
                gradientTo="#2F80ED"
              />
            </Link>
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {loginOpen && <LoginPanel onClose={() => setLoginOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

interface GradientPillProps {
  icon: React.ReactNode;
  label: string;
  gradientFrom: string;
  gradientTo: string;
  onClick?: () => void;
}

function GradientPill({ icon, label, gradientFrom, gradientTo, onClick }: GradientPillProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{ width: hovered ? 120 : 44 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-11 shrink-0 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden cursor-pointer"
      style={{ minWidth: 44 }}
    >
      {/* Gradient fill */}
      <motion.span
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: `linear-gradient(45deg, ${gradientFrom}, ${gradientTo})` }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      />

      {/* Glow */}
      <motion.span
        className="absolute top-2.5 inset-x-0 h-full rounded-full pointer-events-none -z-10"
        style={{
          background: `linear-gradient(45deg, ${gradientFrom}, ${gradientTo})`,
          filter: "blur(15px)",
        }}
        animate={{ opacity: hovered ? 0.5 : 0 }}
        transition={{ duration: 0.4 }}
      />

      {/* Icon — shrinks out */}
      <motion.span
        className="relative z-10 text-gray-400"
        animate={{ scale: hovered ? 0 : 1, opacity: hovered ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {icon}
      </motion.span>

      {/* Label — grows in */}
      <motion.span
        className="absolute z-10 text-white text-sm font-semibold uppercase tracking-wide whitespace-nowrap"
        animate={{ scale: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.2, delay: hovered ? 0.15 : 0 }}
      >
        {label}
      </motion.span>
    </motion.button>
  );
}
