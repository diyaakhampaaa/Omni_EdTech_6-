import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Loader2, GraduationCap, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const { signup, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    if (form.password.length < 8) {
      return setFormError("Password must be at least 8 characters.");
    }

    setSubmitting(true);
    try {
      const user = await signup(form);
      navigate(user.role === "teacher" ? "/teacher" : "/student", { replace: true });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">Create an account</h1>
      <p className="mb-6 text-sm text-slate-500">Set up your AccessLens teacher or student account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">I am a…</legend>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border p-3 text-sm font-medium transition-colors ${
                form.role === "teacher"
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300"
                  : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              <input
                type="radio"
                name="role"
                value="teacher"
                checked={form.role === "teacher"}
                onChange={() => updateField("role", "teacher")}
                className="sr-only"
              />
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
              Teacher
            </label>
            <label
              className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border p-3 text-sm font-medium transition-colors ${
                form.role === "student"
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300"
                  : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              <input
                type="radio"
                name="role"
                value="student"
                checked={form.role === "student"}
                onChange={() => updateField("role", "student")}
                className="sr-only"
              />
              <Users className="h-5 w-5" aria-hidden="true" />
              Student
            </label>
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Full name</span>
          <input
            type="text"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="input"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="input"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            className="input"
          />
          <span className="mt-1 block text-xs text-slate-500">At least 8 characters.</span>
        </label>

        {(formError || error) && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {formError || error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <UserPlus className="h-4 w-4" aria-hidden="true" />}
          {submitting ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}