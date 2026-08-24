// import { lessonStore } from "../models/lessonSchema.js";
import { lessonStore, saveLesson } from "../models/lessonSchema.js";
import { sanitizeLesson } from "./ingestionController.js";
import { runAccessibilityAudit } from "../services/geminiService.js";

/**
 * POST /api/lessons/:lessonId/audit
 * Module B, Pass 1 — Accessibility Audit Engine
 * Analyzes the uploaded source document and produces a 0-100 score + issues.
 */
export async function auditLesson(req, res) {
  const lesson = lessonStore.get(req.params.lessonId);
  if (!lesson) return res.status(404).json({ error: "Lesson not found." });
  if (!lesson.sourceFile) return res.status(400).json({ error: "Lesson has no source file to audit." });

  try {
    lesson.status = "audited";
    const auditResult = await runAccessibilityAudit({
      filePath: lesson.sourceFile.path,
      mimeType: lesson.sourceFile.mimeType,
      metadata: lesson.metadata,
    });

    lesson.auditScore.before = auditResult.auditScore?.before ?? 0;
    lesson.auditScore.issues = auditResult.auditScore?.issues ?? [];
    // Stash for Pass 2 so the transformation prompt has audit context without re-uploading.
    lesson._auditContext = {
      issues: lesson.auditScore.issues,
      documentSummaryForTransformation: auditResult.documentSummaryForTransformation || "",
    };
    lesson.updatedAt = new Date().toISOString();

    saveLesson(lesson);
    return res.json({ lesson: sanitizeLesson(lesson) });
  } catch (err) {
    lesson.status = "error";
    console.error("auditLesson error:", err);
    return res.status(502).json({ error: "AI audit failed.", details: err.message });
  }
}
