"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Dumbbell,
  TrendingUp,
  Settings,
  Users,
  BarChart2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type DashboardType = "patient" | "experience" | "therapist";
type NavIcon = React.ComponentType<{ className?: string }>;

const navItems: Record<DashboardType, { tabKey: string; icon: NavIcon; labelKey: string }[]> = {
  patient: [
    { tabKey: "overview", icon: LayoutDashboard, labelKey: "overview" },
    { tabKey: "limbs", icon: Layers, labelKey: "limb_selection" },
    { tabKey: "program", icon: BookOpen, labelKey: "my_program" },
    { tabKey: "training", icon: Dumbbell, labelKey: "training" },
    { tabKey: "progress", icon: TrendingUp, labelKey: "my_progress" },
    { tabKey: "settings", icon: Settings, labelKey: "settings" },
  ],
  experience: [
    { tabKey: "overview", icon: LayoutDashboard, labelKey: "overview" },
    { tabKey: "design", icon: Layers, labelKey: "design_interface" },
    { tabKey: "settings", icon: Settings, labelKey: "settings" },
  ],
  therapist: [
    { tabKey: "home", icon: LayoutDashboard, labelKey: "home" },
    { tabKey: "patients", icon: Users, labelKey: "patients" },
    { tabKey: "reports", icon: BarChart2, labelKey: "reports" },
    { tabKey: "settings", icon: Settings, labelKey: "settings" },
  ],
};

interface SidebarProps {
  type: DashboardType;
  activeTab: string;
  onTabChange: (tab: string) => void;
  /** Per-tab unread counts, keyed by tabKey. Shown as a badge on the nav item. */
  badges?: Record<string, number>;
}

export function Sidebar({ type, activeTab, onTabChange, badges }: SidebarProps) {
  const t = useTranslations("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const items = navItems[type];

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="glass-sidebar flex h-full flex-col border-e border-border overflow-hidden"
    >
      {/* Toggle */}
      <div className="flex h-14 items-center justify-end border-b border-border px-3">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-2 pt-4">
        {items.map(({ tabKey, icon: Icon, labelKey }) => {
          const isActive = activeTab === tabKey;
          const badge = badges?.[tabKey] ?? 0;
          return (
            <button
              key={tabKey}
              data-tour={`nav-${tabKey}`}
              onClick={() => onTabChange(tabKey)}
              className={cn(
                "group relative flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-lg bg-primary/10"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative shrink-0">
                <Icon
                  className={cn(
                    "size-4",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {/* Collapsed: a dot stands in for the count. */}
                {badge > 0 && collapsed && (
                  <span className="absolute -end-1 -top-1 size-2 rounded-full bg-primary ring-2 ring-sidebar" />
                )}
              </span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.18 }}
                    className="relative flex flex-1 items-center gap-2 overflow-hidden whitespace-nowrap text-start"
                  >
                    {t(labelKey as Parameters<typeof t>[0])}
                    {badge > 0 && (
                      <span className="ms-auto inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                        {badge}
                      </span>
                    )}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>
    </motion.aside>
  );
}
