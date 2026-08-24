import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import lessonRoutes from "./routes/lessonRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  })
);
app.use(express.json({ limit: "2mb" }));

// AI calls are expensive — rate limit the endpoints that hit Gemini/GPT-4o.
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many AI requests — please slow down." },
});
app.use("/api/lessons/:lessonId/audit", aiLimiter);
app.use("/api/lessons/:lessonId/transform", aiLimiter);
app.use("/api/lessons/:lessonId/chat", aiLimiter);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    provider: process.env.AI_PROVIDER || "gemini",
    time: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/lessons", chatRoutes);

// Centralized error handler (catches Multer errors, thrown errors, etc.)
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`AccessLens backend running on http://localhost:${PORT}`);
});