"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BellOff, LogOut } from "lucide-react";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { OnboardingHelpButton } from "@/components/onboarding/OnboardingHelpButton";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase";

interface TopBarProps {
  userName?: string;
  badge?: string;
  avatarUrl?: string | null;
}

export function TopBar({ userName = "User", badge, avatarUrl }: TopBarProps) {
  const t = useTranslations("dashboard");
  const tNav = useTranslations("nav");
  const router = useRouter();

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // No real notifications yet — surface an explicit empty state.
  const notifications: { id: string; text: string }[] = [];
  const hasNotifications = notifications.length > 0;

  useEffect(() => {
    if (!notifOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setNotifOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [notifOpen]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <header className="glass flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
      {/* Logo / Brand */}
      <Link href="/" className="font-heading text-lg font-bold text-foreground">
        {tNav("logo")}<span className="text-primary">.</span>
      </Link>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <LanguageToggle />
        <ThemeToggle />

        {/* Re-launch the guided walkthrough on demand */}
        <OnboardingHelpButton />

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((o) => !o)}
            aria-label={t("notifications")}
            aria-haspopup="dialog"
            aria-expanded={notifOpen}
            className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground"
          >
            <Bell className="size-4" />
            {hasNotifications && (
              <span
                aria-hidden
                className="absolute inset-e-1 top-1 h-2 w-2 rounded-full bg-primary"
              />
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                role="dialog"
                aria-label={t("notifications")}
                className="absolute inset-e-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl"
              >
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">
                    {t("notifications")}
                  </p>
                </div>
                {hasNotifications ? (
                  <ul className="max-h-72 overflow-y-auto py-1">
                    {notifications.map((n) => (
                      <li
                        key={n.id}
                        className="px-4 py-2.5 text-sm text-foreground hover:bg-muted/50"
                      >
                        {n.text}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <BellOff className="size-5" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {t("notifications_empty")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("notifications_empty_desc")}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User chip */}
        <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
          <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={userName}
                className="h-full w-full object-cover"
              />
            ) : (
              userName.charAt(0).toUpperCase()
            )}
          </div>
          <span className="max-w-25 truncate text-xs font-medium text-foreground">
            {userName}
          </span>
          {badge && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              {badge}
            </span>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-3.5" />
          {t("logout")}
        </button>
      </div>
    </header>
  );
}
