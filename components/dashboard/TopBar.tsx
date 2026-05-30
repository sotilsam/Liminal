"use client";

import { useTranslations } from "next-intl";
import { Bell, LogOut } from "lucide-react";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase";

interface TopBarProps {
  userName?: string;
  badge?: string;
}

export function TopBar({ userName = "User", badge }: TopBarProps) {
  const t = useTranslations("dashboard");
  const tNav = useTranslations("nav");
  const router = useRouter();

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

        {/* Notifications */}
        <button
          className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={t("notifications")}
        >
          <Bell className="size-4" />
          <span
            aria-hidden
            className="absolute inset-e-1 top-1 h-2 w-2 rounded-full bg-primary"
          />
        </button>

        {/* User chip */}
        <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {userName.charAt(0).toUpperCase()}
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
