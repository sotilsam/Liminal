"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { motion } from "framer-motion";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next });
  }

  return (
    <div
      role="group"
      aria-label="Language selection"
      className="flex items-center gap-0.5 rounded-full border border-border bg-muted/60 p-0.5"
    >
      {(["he", "en"] as const).map((lang) => (
        <motion.button
          key={lang}
          onClick={() => switchLocale(lang)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className={[
            "rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-colors",
            locale === lang
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
          aria-pressed={locale === lang}
        >
          {lang === "he" ? "עב" : "EN"}
        </motion.button>
      ))}
    </div>
  );
}
