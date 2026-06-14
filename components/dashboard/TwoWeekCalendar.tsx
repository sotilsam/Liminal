"use client";

import type { CSSProperties } from "react";
import { useLocale } from "next-intl";
import { X } from "lucide-react";

export interface CalendarSession {
  id: string;
  date: string; // YYYY-MM-DD
  label: string;
  sublabel?: string;
}

interface TwoWeekCalendarProps {
  sessions: CalendarSession[];
  /** Day the 2-week window starts on. Defaults to the start of this week. */
  startDate?: Date;
  /** When set, each pill gets a hover delete button calling this. */
  onDelete?: (session: CalendarSession) => void;
  /** Accessible label for the delete button. */
  deleteLabel?: string;
}

function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay()); // Sunday start
  return x;
}

export function TwoWeekCalendar({
  sessions,
  startDate,
  onDelete,
  deleteLabel,
}: TwoWeekCalendarProps) {
  const locale = useLocale();
  const dir = locale === "he" ? "rtl" : "ltr";

  const start = startOfWeek(startDate ?? new Date());
  const todayIso = isoDay(new Date());

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  const byDay = new Map<string, CalendarSession[]>();
  for (const s of sessions) {
    const key = s.date.slice(0, 10);
    const list = byDay.get(key);
    if (list) list.push(s);
    else byDay.set(key, [s]);
  }

  const weekdays = days.slice(0, 7).map((d) =>
    d.toLocaleDateString(locale, { weekday: "short" })
  );

  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
    gap: "0.375rem",
  };

  return (
    <div dir={dir}>
      <div style={gridStyle} className="mb-1.5">
        {weekdays.map((w, i) => (
          <div
            key={i}
            className="text-center text-xs font-medium text-muted-foreground"
          >
            {w}
          </div>
        ))}
      </div>
      <div style={gridStyle}>
        {days.map((d) => {
          const key = isoDay(d);
          const dayS = byDay.get(key) ?? [];
          const isToday = key === todayIso;
          return (
            <div
              key={key}
              className={[
                "min-h-[76px] rounded-xl border p-1.5 text-start",
                isToday
                  ? "border-primary bg-primary/[0.06]"
                  : "border-border bg-card",
              ].join(" ")}
            >
              <div
                className={[
                  "mb-1 text-xs font-semibold",
                  isToday ? "text-primary" : "text-muted-foreground",
                ].join(" ")}
              >
                {d.getDate()}
              </div>
              <div className="space-y-1">
                {dayS.slice(0, 3).map((s) => (
                  <div
                    key={s.id}
                    dir="auto"
                    title={[s.label, s.sublabel].filter(Boolean).join(" · ")}
                    className="group/pill flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-primary"
                  >
                    <span className="min-w-0 flex-1 truncate">{s.label}</span>
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(s)}
                        aria-label={deleteLabel}
                        title={deleteLabel}
                        className="shrink-0 text-primary/60 opacity-0 transition-opacity hover:text-destructive group-hover/pill:opacity-100"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                ))}
                {dayS.length > 3 && (
                  <div className="px-1.5 text-[11px] text-muted-foreground">
                    +{dayS.length - 3}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
