"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "@/i18n/navigation";
import { SettingsCard, inputClass } from "./primitives";

export function DangerZone() {
  const t = useTranslations("settings");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("delete_account");
      if (rpcError) {
        setError(rpcError.message);
        setDeleting(false);
        return;
      }
      await supabase.auth.signOut();
      router.push("/");
    } catch {
      setError(t("save_failed"));
      setDeleting(false);
    }
  }

  return (
    <>
      <SettingsCard
        title={t("danger_title")}
        description={t("danger_desc")}
        icon={Trash2}
        tone="danger"
      >
        <button
          type="button"
          onClick={() => {
            setConfirmText("");
            setError("");
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-destructive px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          <Trash2 className="size-4" />
          {t("delete_account")}
        </button>
      </SettingsCard>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => !deleting && setOpen(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                    <AlertTriangle className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-heading text-base font-semibold text-foreground">
                      {t("delete_confirm_title")}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("delete_confirm_desc")}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-1.5">
                  <label
                    htmlFor="delete-confirm"
                    className="block text-sm font-medium text-foreground"
                  >
                    {t("delete_confirm_label")}
                  </label>
                  <input
                    id="delete-confirm"
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className={inputClass}
                    autoComplete="off"
                  />
                </div>

                {error && (
                  <p className="mt-3 text-xs font-medium text-destructive">
                    {error}
                  </p>
                )}

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={deleting}
                    className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting || confirmText !== "DELETE"}
                    className="inline-flex items-center gap-2 rounded-xl bg-destructive px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deleting && <Loader2 className="size-4 animate-spin" />}
                    {deleting ? t("deleting") : t("confirm_delete")}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
