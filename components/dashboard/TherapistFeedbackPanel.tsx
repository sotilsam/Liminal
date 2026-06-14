"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useFormatter, useLocale, useNow } from "next-intl";
import { Check, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getFeedbackForPatient,
  getPatientSessions,
  sendFeedback,
  type Feedback,
  type PatientSession,
} from "@/lib/feedback";

const fieldClass =
  "w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors";

interface TherapistFeedbackPanelProps {
  /** Real patients.id the feedback is addressed to. */
  patientId: string;
}

export function TherapistFeedbackPanel({ patientId }: TherapistFeedbackPanelProps) {
  const t = useTranslations("dashboard");
  const format = useFormatter();
  const uiDir = useLocale() === "he" ? "rtl" : "ltr";
  // Anchor relative times to a single "now" so next-intl doesn't fall back.
  const now = useNow();

  const [body, setBody] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [sessions, setSessions] = useState<PatientSession[]>([]);
  const [items, setItems] = useState<Feedback[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const [sent, sess] = await Promise.all([
        getFeedbackForPatient(patientId).catch(() => [] as Feedback[]),
        getPatientSessions(patientId).catch(() => [] as PatientSession[]),
      ]);
      if (!active) return;
      setItems(sent);
      setSessions(sess);
    })();
    return () => {
      active = false;
    };
  }, [patientId]);

  function sessionLabel(s: PatientSession) {
    const date = s.date ? new Date(s.date).toLocaleDateString() : "";
    return [date, s.type].filter(Boolean).join(" · ") || s.id.slice(0, 8);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text || pending) return;

    setError(false);
    setPending(true);

    // Optimistic: show the message immediately with a temporary id.
    const tempId = `temp-${items.length}-${text.length}`;
    const optimistic: Feedback = {
      id: tempId,
      therapist_id: "",
      patient_id: patientId,
      session_id: sessionId || null,
      body: text,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    setItems((prev) => [optimistic, ...prev]);

    try {
      const saved = await sendFeedback({
        patientId,
        sessionId: sessionId || null,
        body: text,
      });
      setItems((prev) => prev.map((f) => (f.id === tempId ? saved : f)));
      setBody("");
      setSessionId("");
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    } catch {
      setItems((prev) => prev.filter((f) => f.id !== tempId));
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mt-6">
      <h2 className="mb-4 font-heading text-base font-semibold text-foreground">
        {t("feedback_title_therapist")}
      </h2>

      {/* Composer */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            dir="auto"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder={t("feedback_placeholder")}
            className={`${fieldClass} resize-none`}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              {t("feedback_attach_session")}
            </label>
            <select
              dir={uiDir}
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className={fieldClass}
            >
              <option value="">{t("feedback_no_session")}</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {sessionLabel(s)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={!body.trim() || pending}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <MessageSquare className="size-4" />
              )}
              {t("feedback_send")}
            </Button>
            {error && (
              <span className="text-xs font-medium text-destructive">
                {t("feedback_send_failed")}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Already-sent feedback, newest first */}
      {items.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            {t("feedback_sent_list_title")}
          </h3>
          <div className="space-y-3">
            {items.map((f, i) => (
              <motion.article
                key={f.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 6) * 0.05 }}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <p dir="auto" className="text-sm leading-relaxed text-foreground">
                  {f.body}
                </p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">
                    {format.relativeTime(new Date(f.created_at), now)}
                  </span>
                  <span
                    className={[
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                      f.read_at
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    ].join(" ")}
                  >
                    {f.read_at && <Check className="size-3" />}
                    {f.read_at ? t("feedback_read") : t("feedback_unread")}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      )}

      {/* Sent toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
          >
            <div className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25">
              <Check className="size-4" />
              {t("feedback_sent_toast")}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
