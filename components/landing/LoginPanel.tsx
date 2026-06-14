"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { X, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase";

interface LoginPanelProps {
  onClose: () => void;
}

export function LoginPanel({ onClose }: LoginPanelProps) {
  const t = useTranslations("login");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const role = profile?.role ?? "patient";
      onClose();
      router.push(`/dashboard/${role}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl"
      >
        {/* Gradient accent strip */}
        <div
          aria-hidden
          style={{ background: "linear-gradient(90deg, #a855f7, #14b8a6, #f43f5e)", height: 3, flexShrink: 0 }}
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-8 py-5">
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              {t("title")}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex flex-1 overflow-y-auto">
          {/* Form */}
          <div className="flex flex-1 flex-col justify-center px-8 py-10">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-sm font-medium text-foreground">
                  {t("email")}
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-border bg-input px-4 py-2.5 ps-9 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="text-sm font-medium text-foreground">
                    {t("password")}
                  </label>
                  <button type="button" className="text-xs text-primary hover:underline">
                    {t("forgot_password")}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-border bg-input px-4 py-2.5 ps-9 pe-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                className="w-full rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #a855f7 0%, #14b8a6 100%)" }}
              >
                {isLoading ? "…" : t("submit")}
              </motion.button>
            </form>

            {/* Register link */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t("no_account")}{" "}
              <Link
                href="/register"
                className="font-medium text-primary hover:underline"
                onClick={onClose}
              >
                {t("register_link")}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
