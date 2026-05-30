"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { X, Upload, ImageIcon, CheckCircle2 } from "lucide-react";

interface UploadCharacterModalProps {
  onClose: () => void;
  onUploadComplete: (imageUrl: string) => void;
}

type UploadState = "idle" | "dragging" | "processing" | "complete";

export function UploadCharacterModal({
  onClose,
  onUploadComplete,
}: UploadCharacterModalProps) {
  const t = useTranslations("uploadModal");
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setState("processing");
      setProgress(0);

      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            setState("complete");
            const url = URL.createObjectURL(file);
            setTimeout(() => {
              onUploadComplete(url);
              onClose();
            }, 800);
            return 100;
          }
          return p + Math.random() * 18 + 4;
        });
      }, 120);
    },
    [onUploadComplete, onClose]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setState("idle");
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: "spring", damping: 30, stiffness: 350 }}
        className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-2xl bg-background p-8 shadow-2xl ring-1 ring-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {t("title")}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {t("description")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ms-4 shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Upload zone */}
        <AnimatePresence mode="wait">
          {state === "idle" || state === "dragging" ? (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={[
                "placeholder-card flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl px-6 py-10 text-center transition-colors",
                state === "dragging" && "border-primary bg-primary/5",
              ]
                .filter(Boolean)
                .join(" ")}
              onDragOver={(e) => {
                e.preventDefault();
                setState("dragging");
              }}
              onDragLeave={() => setState("idle")}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <ImageIcon className="size-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t("dropzone")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("formats")}
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
              >
                {t("upload")}
              </motion.div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </motion.div>
          ) : state === "processing" ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-8"
            >
              <div className="relative flex h-14 w-14 items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
                />
                <Upload className="size-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">{t("processing")}</p>
              {/* Progress bar */}
              <div className="w-full overflow-hidden rounded-full bg-secondary h-1.5">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.15 }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-8"
            >
              <CheckCircle2 className="size-10 text-primary" />
              <p className="text-sm font-medium text-foreground">Done!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
