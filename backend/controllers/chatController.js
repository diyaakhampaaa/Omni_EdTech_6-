import { lessonStore } from "../models/lessonSchema.js";
import { runTutorTurn } from "../services/geminiService.js";

/**
 * POST /api/lessons/:lessonId/chat
 * body: { question: string, history?: [{role: 'user'|'assistant', content: string}] }
 * Module D — Context-Grounded AI Tutor ("Ask AccessLens")
 */
export async function askTutor(req, res) {
  const lesson = lessonStore.get(req.params.lessonId);
  if (!lesson) return res.status(404).json({ error: "Lesson not found." });

  const { question, history = [] } = req.body;
  if (!question || !question.trim()) {
    return res.status(400).json({ error: "question is required." });
  }

  if (!lesson.chatContext.lessonContent) {
    return res.status(400).json({
      error: "This lesson hasn't been transformed yet — run the transformation pass before chatting.",
    });
  }

  try {
    const answer = await runTutorTurn({
      metadata: lesson.metadata,
      lessonContent: lesson.chatContext.lessonContent,
      question,
      history,
    });

    return res.json({
      answer,
      groundedIn: {
        title: lesson.metadata.title,
        chapter: lesson.metadata.chapter,
        referenceBook: lesson.metadata.referenceBook,
      },
    });
  } catch (err) {
    console.error("askTutor error:", err);
    return res.status(502).json({ error: "AI tutor failed to respond.", details: err.message });
  }
}
