"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { LoginPanel } from "./LoginPanel";
import { Link } from "@/i18n/navigation";

export function Navbar() {
  const t = useTranslations("nav");
  const [loginOpen, setLoginOpen] = useState(false);

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
          <nav className="flex items-center gap-3">
            <LanguageToggle />
            <motion.button
              onClick={() => setLoginOpen(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {t("login")}
            </motion.button>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/register"
                className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                {t("register")}
              </Link>
            </motion.div>
          </nav>
        </div>
      </header>

      {/* Login slide-in panel */}
      <AnimatePresence>
        {loginOpen && (
          <LoginPanel onClose={() => setLoginOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
