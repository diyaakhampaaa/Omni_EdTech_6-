import React from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { Accessibility, LogOut } from "lucide-react";
import { LessonProvider } from "./context/LessonContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import ThemeToggle from "./components/common/ThemeToggle.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import TeacherWorkflow from "./pages/TeacherWorkflow.jsx";
import StudentHome from "./pages/StudentHome.jsx";
import StudentWorkflow from "./pages/StudentWorkflow.jsx";

function NavAuthSection() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <>
        <Link to="/login" className="hover:text-brand-600">Log in</Link>
        <Link
          to="/signup"
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-white font-semibold hover:bg-brand-700"
        >
          Sign up
        </Link>
      </>
    );
  }

  return (
    <>
      <span className="hidden sm:inline text-slate-500">
        {user.name} <span className="text-xs uppercase">({user.role})</span>
      </span>
      <button
        onClick={() => {
          logout();
          navigate("/");
        }}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
      </button>
    </>
  );
}

function NavBar() {
  const { user } = useAuth();
  return (
    <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <Accessibility className="h-6 w-6 text-brand-600" aria-hidden="true" />
          AccessLens
        </Link>
        <div className="ml-auto flex items-center gap-4 text-sm font-medium">
          {user?.role === "teacher" && <Link to="/teacher" className="hover:text-brand-600">Teacher</Link>}
          {user?.role === "student" && <Link to="/student" className="hover:text-brand-600">Student</Link>}
          <NavAuthSection />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LessonProvider>
          <BrowserRouter>
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
              Skip to main content
            </a>
            <NavBar />

            <main id="main-content" className="min-h-screen bg-slate-50 dark:bg-slate-950">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route
                  path="/teacher"
                  element={
                    <ProtectedRoute role="teacher">
                      <TeacherWorkflow />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/student"
                  element={
                    <ProtectedRoute role="student">
                      <StudentHome />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/:lessonId"
                  element={
                    <ProtectedRoute>
                      <StudentWorkflow />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </BrowserRouter>
        </LessonProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}