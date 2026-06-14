"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Box, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const LimbViewer3D = dynamic(
  () => import("./LimbViewer3D").then((m) => m.LimbViewer3D),
  { ssr: false, loading: () => <Box className="size-8 text-muted-foreground/40" /> }
);

interface LimbPlaceholderCardProps {
  label: string;
  variant?: number;
  modelFile?: string | null;
  selected?: boolean;
  onSelect?: () => void;
  /** Height of the 3D model area in pixels. Default: 400 */
  modelHeight?: number;
}

export function LimbPlaceholderCard({
  modelFile = null,
  selected = false,
  onSelect,
  modelHeight = 400,
}: LimbPlaceholderCardProps) {
  const t = useTranslations("dashboard");

  return (
    <div
      className={cn(
        "placeholder-card flex flex-col gap-3 rounded-2xl p-3 transition-colors",
        selected && "ring-2 ring-primary"
      )}
    >
      {/* Model area — height controlled via modelHeight prop */}
      <div
        className="relative w-full overflow-hidden rounded-xl"
        style={{ height: modelHeight }}
      >
        {modelFile ? (
          <LimbViewer3D src={modelFile} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/60">
            <Box className="size-10 text-muted-foreground/40" />
          </div>
        )}
        {selected && (
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-3.5" />
          </span>
        )}
      </div>

      {/* Select button */}
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          "w-full rounded-lg py-1.5 text-xs font-semibold transition-colors",
          selected
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-muted text-foreground hover:bg-secondary"
        )}
      >
        {selected ? t("limb_selected") : t("select")}
      </button>
    </div>
  );
}
