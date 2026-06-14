"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations, useFormatter, useNow } from "next-intl";
import { Loader2, MessageSquareHeart } from "lucide-react";
import {
  getMyFeedback,
  markFeedbackRead,
  type Feedback,
} from "@/lib/feedback";

interface PatientFeedbackFeedProps {
  /** Live unread count, shared with the sidebar badge. */
  unread: number;
  /** Report a new unread count up so the sidebar badge stays in sync. */
  onUnreadChange?: (count: number) => void;
}

export function PatientFeedbackFeed({ unread, onUnreadChange }: PatientFeedbackFeedProps) {
  const t = useTranslations("dashboard");
  const format = useFormatter();
  // Anchor relative times to a single "now" so next-intl doesn't fall back.
  const now = useNow();

  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getMyFeedback();
        if (!active) return;
        setItems(data);
        setLoading(false);

        const unreadItems = data.filter((f) => !f.read_at);
        onUnreadChange?.(unreadItems.length);

        // Viewing the feed marks the new items read. The teal accent stays for
        // this render (we keep the fetched read_at snapshot) so the patient can
        // still see what was new; the live count drops to zero.
        if (unreadItems.length > 0) {
          await Promise.all(
            unreadItems.map((f) => markFeedbackRead(f.id).catch(() => {}))
          );
          if (active) onUnreadChange?.(0);
        }
      } catch {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section>
      <div className="mb-4 flex items-center gap-2.5">
        <h2 className="font-heading text-base font-semibold text-foreground">
          {t("feedback_card_title")}
        </h2>
        {unread > 0 && (
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
            {unread}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex min-h-[140px] items-center justify-center rounded-2xl border border-border bg-card">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="placeholder-card flex min-h-[160px] flex-col items-center justify-center gap-4 rounded-2xl p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <MessageSquareHeart className="size-7 text-muted-foreground/50" />
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            {t("feedback_empty_patient")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((f, i) => {
            const isUnread = !f.read_at;
            return (
              <motion.article
                key={f.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 6) * 0.06 }}
                className={[
                  "relative overflow-hidden rounded-2xl border border-border bg-card p-5",
                  isUnread ? "bg-primary/[0.04]" : "",
                ].join(" ")}
              >
                {isUnread && (
                  <span
                    aria-hidden
                    className="absolute inset-y-0 start-0 w-1 bg-primary"
                  />
                )}
                <p dir="auto" className="text-sm leading-relaxed text-foreground">
                  {f.body}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {format.relativeTime(new Date(f.created_at), now)}
                </p>
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
}
