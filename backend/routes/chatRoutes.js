import { Router } from "express";
import { askTutor } from "../controllers/chatController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Module D — Ask AccessLens (any logged-in user — teacher or student)
router.post("/:lessonId/chat", requireAuth, askTutor);

export default router;