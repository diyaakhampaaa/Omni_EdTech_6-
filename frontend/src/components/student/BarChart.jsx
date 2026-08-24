import React from "react";

/**
 * A dependency-free, accessible bar chart built from plain divs — no
 * canvas/SVG library needed. Every value is also rendered as visible text
 * next to its bar, so the data is readable even without perceiving bar
 * length (useful for cognitive accessibility, not just low vision).
 */
export default function BarChart({ title, dataPoints }) {
  if (!dataPoints || dataPoints.length === 0) return null;

  const max = Math.max(...dataPoints.map((d) => d.value), 1);

  return (
    <figure
      className="rounded-lg border border-slate-200 dark:border-slate-700 p-4"
      role="img"
      aria-label={`Bar chart: ${title}. ${dataPoints.map((d) => `${d.label}: ${d.value}`).join(", ")}.`}
    >
      {title && <figcaption className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</figcaption>}
      <div className="space-y-2">
        {dataPoints.map((d, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <span className="w-20 shrink-0 truncate text-slate-600 dark:text-slate-300" title={d.label}>
              {d.label}
            </span>
            <div className="flex-1 h-5 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded bg-brand-500"
                style={{ width: `${Math.max((d.value / max) * 100, 3)}%` }}
              />
            </div>
            <span className="w-14 shrink-0 text-right tabular-nums font-medium text-slate-700 dark:text-slate-200">
              {d.value}
            </span>
          </div>
        ))}
      </div>
    </figure>
  );
}