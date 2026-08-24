import React from "react";
import { Sparkles, Loader2, ArrowRight, ExternalLink, Copy, Check } from "lucide-react";
import { useLesson } from "../../context/LessonContext.jsx";

export default function TransformPanel({ onTransformed }) {
  const { lesson, transform, loading, error } = useLesson();
  const [copied, setCopied] = React.useState(false);

  if (!lesson) return null;
  const canTransform = lesson.status === "audited" || lesson.status === "error";
  const isTransforming = loading && lesson.status === "transforming";
  const isReady = lesson.status === "ready";

  async function handleTransform() {
    const updated = await transform(lesson.lessonId);
    onTransformed?.(updated);
  }

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(lesson.lessonCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail (e.g. insecure context) — the code is still visible to copy manually.
    }
  }

  return (
    <section aria-labelledby="transform-heading" className="space-y-5">
      <h2 id="transform-heading" className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-brand-600" aria-hidden="true" />
        Deep Semantic Transformation
      </h2>

      <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
        Generates the accessible Visual, Hearing, and Universal learning modes: semantic audio
        narration, graph and equation explanations, synchronized captions, concept cards, and a
        simplified summary with flashcards and a quiz — all grounded in the reference textbook
        context you provided.
      </p>

      {(canTransform || isTransforming) && (
        <button
          onClick={handleTransform}
          disabled={isTransforming}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {isTransforming && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {isTransforming ? "Transforming lesson…" : "Run transformation"}
        </button>
      )}

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {isReady && (
        <div className="rounded-xl border border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-800 p-6 space-y-5">
          <div className="flex items-center gap-6">
            <ScoreDelta before={lesson.auditScore.before} after={lesson.auditScore.after} />
            <p className="text-sm text-green-800 dark:text-green-200">
              Lesson transformed successfully. All three accessible modes are ready for students.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
              Share this code with your students
            </p>
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-bold tracking-widest text-brand-700 dark:text-brand-300">
                {lesson.lessonCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-600" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Students enter this code on their Student page to open this lesson. Only students with
              this code can access it.
            </p>
          </div>

          
            <a href={`/student/${lesson.lessonId}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 dark:text-brand-300 hover:underline"
          >
            Preview as a student <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      )}
    </section>
  );
}

function ScoreDelta({ before, after }) {
  return (
    <div className="flex items-center gap-3" role="img" aria-label={`Accessibility score improved from ${before} to ${after}`}>
      <span className="text-2xl font-bold text-red-500">{before}</span>
      <ArrowRight className="h-5 w-5 text-slate-400" aria-hidden="true" />
      <span className="text-2xl font-bold text-green-600">{after}</span>
    </div>
  );
}