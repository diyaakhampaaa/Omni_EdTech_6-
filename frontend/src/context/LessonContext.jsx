import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import * as api from "../api/client.js";

const LessonContext = createContext(null);

const ACTIVE_LESSON_KEY = "accesslens-active-lesson-id";

export function LessonProvider({ children }) {
  const [lesson, setLessonState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restoring, setRestoring] = useState(true);

  const setLesson = useCallback((next) => {
    setLessonState(next);
    if (next?.lessonId) {
      localStorage.setItem(ACTIVE_LESSON_KEY, next.lessonId);
    }
  }, []);

  const clearLesson = useCallback(() => {
    setLessonState(null);
    localStorage.removeItem(ACTIVE_LESSON_KEY);
  }, []);

  useEffect(() => {
    const savedId = localStorage.getItem(ACTIVE_LESSON_KEY);
    if (!savedId) {
      setRestoring(false);
      return;
    }
    api
      .fetchLesson(savedId)
      .then(setLessonState)
      .catch(() => localStorage.removeItem(ACTIVE_LESSON_KEY))
      .finally(() => setRestoring(false));
  }, []);

  const upload = useCallback(
    async (payload) => {
      setLoading(true);
      setError(null);
      try {
        const created = await api.uploadLesson(payload);
        setLesson(created);
        return created;
      } catch (err) {
        setError(err.response?.data?.error || err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLesson]
  );

  const audit = useCallback(
    async (lessonId) => {
      setLoading(true);
      setError(null);
      try {
        const updated = await api.runAudit(lessonId);
        setLesson(updated);
        return updated;
      } catch (err) {
        setError(err.response?.data?.error || err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLesson]
  );

  const transform = useCallback(
    async (lessonId) => {
      setLoading(true);
      setError(null);
      try {
        const updated = await api.runTransformation(lessonId);
        setLesson(updated);
        return updated;
      } catch (err) {
        setError(err.response?.data?.error || err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLesson]
  );

  const loadLesson = useCallback(
    async (lessonId) => {
      setLoading(true);
      setError(null);
      try {
        const found = await api.fetchLesson(lessonId);
        setLesson(found);
        return found;
      } catch (err) {
        setError(err.response?.data?.error || err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLesson]
  );

  const value = {
    lesson,
    setLesson,
    clearLesson,
    loading,
    restoring,
    error,
    upload,
    audit,
    transform,
    loadLesson,
  };
  return <LessonContext.Provider value={value}>{children}</LessonContext.Provider>;
}

export function useLesson() {
  const ctx = useContext(LessonContext);
  if (!ctx) throw new Error("useLesson must be used within a LessonProvider");
  return ctx;
}