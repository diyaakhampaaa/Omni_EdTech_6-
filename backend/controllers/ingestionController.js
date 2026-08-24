import { v4 as uuidv4 } from "uuid";
import { createEmptyLesson, lessonStore, saveLesson, findLessonByCode } from "../models/lessonSchema.js";

/**
 * POST /api/lessons/upload
 * multipart/form-data: file, title, subject, referenceBook, chapter, pageRange
 * Module A — Teacher Content Ingestion & Reference Mapping
 */
export async function uploadLesson(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Attach a PDF or image under field 'file'." });
    }

    const { title, subject, referenceBook, chapter, pageRange } = req.body;
    if (!title || !subject) {
      return res.status(400).json({ error: "title and subject are required." });
    }

    const lessonId = uuidv4();
    const lesson = createEmptyLesson({
      lessonId,
      metadata: { title, subject, referenceBook, chapter, pageRange },
      createdBy: req.user.id, // requireAuth + requireRole("teacher") already ran on this route
    });

    lesson.sourceFile = {
      path: req.file.path,
      mimeType: req.file.mimetype,
      originalName: req.file.originalname,
      sizeBytes: req.file.size,
    };

    saveLesson(lesson);

    return res.status(201).json({ lesson: sanitizeLesson(lesson) });
  } catch (err) {
    console.error("uploadLesson error:", err);
    return res.status(500).json({ error: "Failed to process upload.", details: err.message });
  }
}

/**
 * GET /api/lessons/:lessonId
 * A teacher may only open their own lesson here; a student reaches a lesson
 * via its lessonId after already joining with the class code (see joinLessonByCode),
 * so this stays a simple ownership check for teachers and an open read for
 * anyone who already has the id (e.g. a student mid-session).
 */
export function getLesson(req, res) {
  const lesson = lessonStore.get(req.params.lessonId);
  if (!lesson) return res.status(404).json({ error: "Lesson not found." });

  if (req.user.role === "teacher" && lesson.createdBy !== req.user.id) {
    return res.status(403).json({ error: "You can only view lessons you created." });
  }

  return res.json({ lesson: sanitizeLesson(lesson) });
}

/**
 * GET /api/lessons
 * Teachers only ever see their own lessons here — this powers the "Your
 * lessons" history panel. Students never browse a lesson list at all; they
 * must be given a specific class code by their teacher (see joinLessonByCode).
 */
export function listLessons(req, res) {
  if (req.user.role !== "teacher") {
    return res.json({ lessons: [] });
  }
  const lessons = Array.from(lessonStore.values())
    .filter((l) => l.createdBy === req.user.id)
    .map(sanitizeLesson);
  return res.json({ lessons });
}

/**
 * POST /api/lessons/join
 * body: { code: string }
 * A student enters the short code their teacher shared to open a specific
 * lesson — this is the only way a student can reach a lesson, so lessons
 * are never discoverable by browsing.
 */
export function joinLessonByCode(req, res) {
  const { code } = req.body;
  const lesson = findLessonByCode(code);

  if (!lesson) {
    return res.status(404).json({ error: "That code doesn't match any lesson. Double-check it with your teacher." });
  }
  if (lesson.status !== "ready") {
    return res.status(400).json({ error: "This lesson isn't ready for students yet. Ask your teacher to finish preparing it." });
  }

  return res.json({ lesson: sanitizeLesson(lesson) });
}

/** Never leak server filesystem paths to the client. */
export function sanitizeLesson(lesson) {
  const { sourceFile, ...rest } = lesson;
  return rest;
}