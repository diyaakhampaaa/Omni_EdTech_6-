import React, { useEffect, useState } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import Uploader from "../components/teacher/Uploader.jsx";
import AuditDashboard from "../components/teacher/AuditDashboard.jsx";
import TransformPanel from "../components/teacher/TransformPanel.jsx";
import LessonHistory from "../components/teacher/LessonHistory.jsx";
import { useLesson } from "../context/LessonContext.jsx";

const STEPS = ["Upload", "Audit", "Transform"];

function stepForStatus(status) {
  if (status === "transforming" || status === "ready") return 2;
  if (status === "audited" || status === "error") return 1;
  return 1;
}

export default function TeacherWorkflow() {
  const { lesson, restoring, loadLesson, clearLesson } = useLesson();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (lesson) setStep(stepForStatus(lesson.status));
  }, [lesson?.lessonId, lesson?.status]);

  function handleStartNew() {
    clearLesson();
    setStep(0);
  }

  async function handleSelectLesson(lessonId) {
    await loadLesson(lessonId);
  }

  if (restoring) {
    return (
      <div className="flex h-[60vh] items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Restoring your last lesson…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Teacher Workflow</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Turn any lesson material into an accessible experience
        </h1>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <LessonHistory
          onSelect={handleSelectLesson}
          onStartNew={handleStartNew}
          activeLessonId={lesson?.lessonId}
        />

        <div className="flex-1 min-w-0">
          <ol className="mb-10 flex items-center gap-4" aria-label="Progress">
            {STEPS.map((label, i) => (
              <li key={label} className="flex items-center gap-2">
                {i < step ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" aria-hidden="true" />
                ) : (
                  <Circle className={`h-5 w-5 ${i === step ? "text-brand-600" : "text-slate-300"}`} aria-hidden="true" />
                )}
                <span
                  className={`text-sm font-medium ${i === step ? "text-slate-900 dark:text-white" : "text-slate-500"}`}
                >
                  {label}
                </span>
                {i < STEPS.length - 1 && <span className="mx-2 h-px w-8 bg-slate-300" aria-hidden="true" />}
              </li>
            ))}
          </ol>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
            {step === 0 && <Uploader onUploaded={() => setStep(1)} />}
            {step === 1 && lesson && <AuditDashboard onAudited={() => setStep(2)} />}
            {step === 2 && lesson && <TransformPanel />}
          </div>
        </div>
      </div>
    </div>
  );
}