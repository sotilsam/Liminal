"use client";

import { useTranslations } from "next-intl";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { progressData } from "@/lib/mock-data";

export function ProgressChart() {
  const t = useTranslations("dashboard");

  return (
    <section>
      <h2 className="mb-4 font-heading text-base font-semibold text-foreground">
        {t("progress_over_time")}
      </h2>
      <div className="rounded-2xl border border-border bg-card p-5">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={progressData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.89 0.025 195)" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: "oklch(0.50 0.03 195)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "oklch(0.50 0.03 195)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid oklch(0.89 0.025 195)",
                background: "#fff",
                fontSize: 12,
              }}
              cursor={{ stroke: "oklch(0.62 0.19 195)", strokeWidth: 1, opacity: 0.3 }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="oklch(0.62 0.19 195)"
              strokeWidth={2.5}
              dot={{ fill: "oklch(0.62 0.19 195)", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "oklch(0.62 0.19 195)", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
