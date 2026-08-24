import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, BookOpen, KeyRound, AlertCircle } from "lucide-react";
import { joinLessonByCode, fetchLesson } from "../api/client.js";

// Remembers which lessons this student has already joined (by id) so they
// don't have to re-enter the class code every time — this is purely a
// local convenience list, not an access-control mechanism. Access itself
// is still enforced server-side: opening a lesson id you were never given
// the code for will 403/404 on the backend.
const JOINED_KEY = "accesslens-joined-lessons";

function getJoinedIds() {
  try {
    return JSON.parse(localStorage.getItem(JOINED_KEY) || "[]");
  } catch {
    return [];
  }
}

function rememberJoined(lessonId) {
  const ids = new Set(getJoinedIds());
  ids.add(lessonId);
  localStorage.setItem(JOINED_KEY, JSON.stringify(Array.from(ids)));
}

export default function StudentHome() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState(null);

  const [recentLessons, setRecentLessons] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    const ids = getJoinedIds();
    if (ids.length === 0) {
      setLoadingRecent(false);
      return;
    }
    Promise.all(
      ids.map((id) =>
        fetchLesson(id)
          .then((lesson) => lesson)
          .catch(() => null) // lesson may no longer exist or no longer be accessible — skip it
      )
    )
      .then((results) => setRecentLessons(results.filter(Boolean)))
      .finally(() => setLoadingRecent(false));
  }, []);

  async function handleJoin(e) {
    e.preventDefault();
    setJoinError(null);
    if (!code.trim()) return;

    setJoining(true);
    try {
      const lesson = await joinLessonByCode(code.trim());
      rememberJoined(lesson.lessonId);
      navigate(`/student/${lesson.lessonId}`);
    } catch (err) {
      setJoinError(err.response?.data?.error || "Couldn't join that lesson.");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">Open a lesson</h1>
      <p className="mb-6 text-sm text-slate-500">
        Enter the code your teacher shared with you to open an accessible lesson.
      </p>

      <form onSubmit={handleJoin} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Class code</span>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. K3F9QX"
              autoCapitalize="characters"
              autoComplete="off"
              className="input pl-9 font-mono tracking-widest uppercase"
            />
          </div>
        </label>

        {joinError && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {joinError}
          </p>
        )}

        <button
          type="submit"
          disabled={joining || !code.trim()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {joining && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {joining ? "Opening…" : "Open lesson"}
        </button>
      </form>

      {(loadingRecent || recentLessons.length > 0) && (
        <div className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Recently opened
          </h2>
          {loadingRecent && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading…
            </div>
          )}
          <ul className="space-y-2">
            {recentLessons.map((lesson) => (
              <li key={lesson.lessonId}>
                <button
                  onClick={() => navigate(`/student/${lesson.lessonId}`)}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-left hover:border-brand-400 hover:shadow-sm transition"
                >
                  <BookOpen className="h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{lesson.metadata.title}</p>
                    <p className="text-sm text-slate-500">{lesson.metadata.subject}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loadingRecent && recentLessons.length === 0 && (
        <p className="mt-6 flex items-center gap-2 text-xs text-slate-400">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Lessons you open will appear here for quick access next time.
        </p>
      )}
    </div>
  );
}