"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", Icon: Sun },
  { value: "dark", Icon: Moon },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="h-9 w-17 shrink-0" />;

  // next-themes is configured with enableSystem={false}; treat anything
  // that isn't explicitly "dark" as light.
  const active = theme === "dark" ? "dark" : "light";

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-white p-0.5 shadow"
    >
      {OPTIONS.map(({ value, Icon }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={isActive}
            aria-label={`Switch to ${value} mode`}
            onClick={() => setTheme(value)}
            className={cn(
              "relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors",
              isActive ? "text-white" : "text-gray-400 hover:text-gray-600"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="theme-active-pill"
                transition={{ type: "spring", bounce: 0.18, duration: 0.55 }}
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    value === "dark"
                      ? "linear-gradient(45deg, #6366f1, #a855f7)"
                      : "linear-gradient(45deg, #f59e0b, #fbbf24)",
                }}
              />
            )}
            <Icon className="relative z-10 size-4" />
          </button>
        );
      })}
    </div>
  );
}
