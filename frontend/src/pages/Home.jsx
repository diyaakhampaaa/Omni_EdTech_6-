import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white">AccessLens</h1>
      <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
        Turn any lesson PDF, slide deck, or image into a fully accessible, multi-modal learning
        experience for visually and hearing-impaired students.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <Link
          to="/teacher"
          className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 hover:border-brand-400 hover:shadow-md transition"
        >
          <GraduationCap className="h-8 w-8 text-brand-600" aria-hidden="true" />
          <span className="text-lg font-semibold text-slate-900 dark:text-white">Teacher Workflow</span>
          <span className="text-sm text-slate-500">Upload → Audit → Transform</span>
        </Link>

        <Link
          to="/student"
          className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 hover:border-brand-400 hover:shadow-md transition"
        >
          <Users className="h-8 w-8 text-brand-600" aria-hidden="true" />
          <span className="text-lg font-semibold text-slate-900 dark:text-white">Student Player</span>
          <span className="text-sm text-slate-500">Visual · Hearing · Universal modes + AI tutor</span>
        </Link>
      </div>
    </div>
  );
}
