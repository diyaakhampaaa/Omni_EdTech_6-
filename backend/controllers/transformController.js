import { lessonStore, saveLesson } from "../models/lessonSchema.js";
import { sanitizeLesson } from "./ingestionController.js";
import { runContentTransformation } from "../services/geminiService.js";

/**
 * POST /api/lessons/:lessonId/transform
 * Module B, Pass 2 — Deep Semantic Transformation
 * Produces the full 3-mode contentPayload (visual, hearing, universal) and
 * populates chatContext.lessonContent so the AI Tutor is grounded.
 */
export async function transformLesson(req, res) {
  const lesson = lessonStore.get(req.params.lessonId);
  if (!lesson) return res.status(404).json({ error: "Lesson not found." });
  if (!lesson.sourceFile) return res.status(400).json({ error: "Lesson has no source file to transform." });

  try {
    lesson.status = "transforming";

    const result = await runContentTransformation({
      filePath: lesson.sourceFile.path,
      mimeType: lesson.sourceFile.mimeType,
      metadata: lesson.metadata,
      auditContext: lesson._auditContext || { issues: lesson.auditScore.issues, documentSummaryForTransformation: "" },
    });

    lesson.auditScore.after = result.auditScore?.after ?? null;
    if (result.auditScore?.issues?.length) {
      lesson.auditScore.issues = mergeIssues(lesson.auditScore.issues, result.auditScore.issues);
    }

    lesson.contentPayload = result.contentPayload;

    // Ground the AI Tutor in the transformed content (structured text + transcript + summary).
    const grounding = [
      result.contentPayload?.visualMode?.structuredText,
      result.contentPayload?.hearingMode?.transcripts,
      result.contentPayload?.universalMode?.simplifiedSummary,
    ]
      .filter(Boolean)
      .join("\n\n---\n\n");

    lesson.chatContext.lessonContent = grounding;
    lesson.chatContext.vectorizedReferenceText = grounding; // placeholder for real embedding pipeline
    lesson.status = "ready";
    lesson.updatedAt = new Date().toISOString();

    saveLesson(lesson);
    return res.json({ lesson: sanitizeLesson(lesson) });
  } catch (err) {
    lesson.status = "error";
    console.error("transformLesson error:", err);
    return res.status(502).json({ error: "AI transformation failed.", details: err.message });
  }
}

function mergeIssues(originalIssues, updatedIssues) {
  const byId = new Map(originalIssues.map((i) => [i.id, i]));
  for (const u of updatedIssues) byId.set(u.id, u);
  return Array.from(byId.values());
}
