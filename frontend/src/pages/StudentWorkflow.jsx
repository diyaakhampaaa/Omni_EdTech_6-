import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { useLesson } from "../context/LessonContext.jsx";
import PlayerShell from "../components/student/PlayerShell.jsx";
import AskAccessLensDrawer from "../components/chat/AskAccessLensDrawer.jsx";

export default function StudentWorkflow() {
  const { lessonId } = useParams();
  const { lesson, loadLesson, loading, error } = useLesson();

  useEffect(() => {
    if (lessonId) loadLesson(lessonId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  if (loading || !lesson) {
    return (
      <div className="flex h-[60vh] items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading lesson…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-red-500" aria-hidden="true" />
        <p className="mt-2 text-red-600">{error}</p>
      </div>
    );
  }

  if (lesson.status !== "ready") {
    return (
      <div className="mx-auto max-w-lg py-16 text-center text-slate-500">
        This lesson hasn't finished the accessible transformation yet. Ask your teacher to complete
        the transformation step.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          {lesson.metadata.subject} · {lesson.metadata.referenceBook || "No reference book"}
        </p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{lesson.metadata.title}</h1>
        {lesson.metadata.chapter && <p className="text-slate-500">{lesson.metadata.chapter}</p>}
      </header>

      <PlayerShell lesson={lesson} />

      <AskAccessLensDrawer lessonId={lesson.lessonId} lessonTitle={lesson.metadata.title} />
    </div>
  );
}
