import React, { useEffect, useState } from "react";
import { Loader2, FileText, Plus } from "lucide-react";
import { fetchLessons } from "../../api/client.js";

const STATUS_LABEL = {
  uploaded: "Uploaded — not yet audited",
  audited: "Audited — ready to transform",
  transforming: "Transforming…",
  ready: "Ready for students",
  error: "Needs attention",
};

const STATUS_COLOR = {
  uploaded: "text-slate-500",
  audited: "text-amber-600",
  transforming: "text-brand-600",
  ready: "text-green-600",
  error: "text-red-600",
};

export default function LessonHistory({ onSelect, onStartNew, activeLessonId }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons()
      .then(setLessons)
      .catch(() => setLessons([]))
      .finally(() => setLoading(false));
  }, [activeLessonId]);

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Your lessons</h2>
        <button
          onClick={onStartNew}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> New
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading…
        </div>
      )}

      {!loading && lessons.length === 0 && (
        <p className="text-sm text-slate-500">No lessons yet — upload your first one to get started.</p>
      )}

      <ul className="space-y-2">
        {lessons.map((l) => (
          <li key={l.lessonId}>
            <button
              onClick={() => onSelect(l.lessonId)}
              aria-current={l.lessonId === activeLessonId}
              className={`flex w-full items-start gap-2 rounded-lg border p-3 text-left text-sm transition-colors ${
                l.lessonId === activeLessonId
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <FileText className="h-4 w-4 shrink-0 mt-0.5 text-slate-400" aria-hidden="true" />
              <span>
                <span className="block font-medium text-slate-900 dark:text-white">{l.metadata.title}</span>
                <span className={`block text-xs ${STATUS_COLOR[l.status] || "text-slate-500"}`}>
                  {STATUS_LABEL[l.status] || l.status}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}