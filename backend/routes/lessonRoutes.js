import { Router } from "express";
import { upload } from "../middleware/upload.js";
import { uploadLesson, getLesson, listLessons, joinLessonByCode } from "../controllers/ingestionController.js";
import { auditLesson } from "../controllers/auditController.js";
import { transformLesson } from "../controllers/transformController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// Module A — Ingestion (teacher-only actions)
router.get("/", requireAuth, listLessons);
router.post("/upload", requireAuth, requireRole("teacher"), upload.single("file"), uploadLesson);

// Students open a lesson only by entering the code their teacher shared —
// this must be defined before "/:lessonId" so Express doesn't treat "join"
// as a lessonId.
router.post("/join", requireAuth, requireRole("student"), joinLessonByCode);

// A logged-in user can view a lesson by id once they already have it
// (teacher owns it, or a student already joined via code in this session).
router.get("/:lessonId", requireAuth, getLesson);

// Module B — Audit (Pass 1) & Transformation (Pass 2) — teacher-only.
router.post("/:lessonId/audit", requireAuth, requireRole("teacher"), auditLesson);
router.post("/:lessonId/transform", requireAuth, requireRole("teacher"), transformLesson);

export default router;