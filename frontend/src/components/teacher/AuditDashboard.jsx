import React, { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { useLesson } from "../../context/LessonContext.jsx";

const SEVERITY_STYLES = {
  critical: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/40 dark:text-orange-200",
  medium: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200",
  low: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200",
};

function ScoreRing({ score }) {
  const color = score >= 80 ? "text-green-500" : score >= 50 ? "text-amber-500" : "text-red-500";
  return (
    <div className="flex flex-col items-center" role="img" aria-label={`Accessibility score: ${score} out of 100`}>
      <div className={`text-5xl font-bold ${color}`}>{score}</div>
      <div className="text-sm text-slate-500">/ 100</div>
    </div>
  );
}

export default function AuditDashboard({ onAudited }) {
  const { lesson, audit, loading, error } = useLesson();

  useEffect(() => {
    if (lesson && lesson.status === "uploaded") {
      audit(lesson.lessonId).then((updated) => onAudited?.(updated));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.lessonId]);

  if (!lesson) return null;

  const runningAudit = loading && lesson.status !== "audited";

  return (
    <section aria-labelledby="audit-heading" className="space-y-6">
      <h2 id="audit-heading" className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-brand-600" aria-hidden="true" />
        Accessibility Audit
      </h2>

      {runningAudit && (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <Loader2 className="h-5 w-5 animate-spin text-brand-600" aria-hidden="true" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Analyzing document layout for missing alt-text, unlabeled graphs, complex equations, and structure
            failures…
          </p>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {!runningAudit && lesson.auditScore?.issues && (
        <div className="grid gap-6 md:grid-cols-[auto_1fr]">
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <ScoreRing score={lesson.auditScore.before} />
            <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">Before accessibility score</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {lesson.auditScore.issues.length} issue{lesson.auditScore.issues.length !== 1 ? "s" : ""} found
            </h3>
            <ul className="space-y-2">
              {lesson.auditScore.issues.map((issue) => (
                <li
                  key={issue.id}
                  className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.low}`}
                >
                  {issue.status === "resolved" ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  )}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide">
                      {issue.severity} · {issue.type.replace(/-/g, " ")}
                      {issue.pageNumber ? ` · p.${issue.pageNumber}` : ""}
                    </p>
                    <p className="text-sm">{issue.description}</p>
                  </div>
                </li>
              ))}
              {lesson.auditScore.issues.length === 0 && (
                <li className="text-sm text-slate-500">No issues detected — great job!</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
