import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * Wrap a route's element with this to require login, and optionally a
 * specific role. Usage:
 *   <ProtectedRoute role="teacher"><TeacherWorkflow /></ProtectedRoute>
 */
export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Checking your session…
      </div>
    );
  }

  if (!user) {
    // Remember where they were headed so we can send them back after login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-lg font-semibold text-slate-900 dark:text-white">
          This page is only available to {role} accounts.
        </p>
        <p className="mt-2 text-slate-500">
          You're logged in as a {user.role}. Log out and sign in with a {role} account to access this page.
        </p>
      </div>
    );
  }

  return children;
}

