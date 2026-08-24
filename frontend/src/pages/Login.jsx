import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { LogIn, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const user = await login(form);
      const redirectTo = location.state?.from?.pathname || (user.role === "teacher" ? "/teacher" : "/student");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">Log in</h1>
      <p className="mb-6 text-sm text-slate-500">Access your AccessLens teacher or student account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="input"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="input"
          />
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
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link to="/signup" className="font-semibold text-brand-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}