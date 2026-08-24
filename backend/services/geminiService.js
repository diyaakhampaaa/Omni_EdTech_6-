import fs from "fs";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  buildAuditPrompt,
  buildTransformationPrompt,
  buildTutorSystemPrompt,
  buildTutorUserTurn,
} from "./promptTemplates.js";

// NOTE: every value read from process.env in this file must be read lazily
// (inside a function, at call time) rather than as a top-level constant.
// ES module imports all resolve before any code in server.js runs — including
// its dotenv.config() call — so a top-level `const X = process.env.X` here
// would always see undefined/blank env vars, regardless of what's in .env.

function getProvider() {
  return (process.env.AI_PROVIDER || "gemini").toLowerCase();
}

function getGeminiModelName() {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash";
}

function getOpenAIModelName() {
  return process.env.OPENAI_MODEL || "gpt-4o";
}

let genAI = null;
function getGenAI() {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) return null;
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

/** Read a locally-stored upload into a base64 inline data part for Gemini. */
function fileToGeminiPart(filePath, mimeType) {
  const data = fs.readFileSync(filePath).toString("base64");
  return { inlineData: { data, mimeType } };
}

function fileToOpenAIImageContent(filePath, mimeType) {
  const data = fs.readFileSync(filePath).toString("base64");
  return {
    type: "image_url",
    image_url: { url: `data:${mimeType};base64,${data}` },
  };
}

/** Strip accidental markdown code fences before JSON.parse. */
function safeParseJSON(text) {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`AI response was not valid JSON: ${err.message}\nRaw: ${cleaned.slice(0, 500)}`);
  }
}

/**
 * Runs a multimodal (file + text prompt) generation call against the
 * configured provider and returns parsed JSON.
 */
async function generateJSONFromFile({ filePath, mimeType, prompt }) {
  if (getProvider() === "openai") {
    return generateJSONFromFileOpenAI({ filePath, mimeType, prompt });
  }
  return generateJSONFromFileGemini({ filePath, mimeType, prompt });
}

async function generateJSONFromFileGemini({ filePath, mimeType, prompt }) {
  const genAI = getGenAI();
  if (!genAI) throw new Error("GEMINI_API_KEY is not configured on the server.");

  const model = genAI.getGenerativeModel({
    model: getGeminiModelName(),
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });

  const filePart = fileToGeminiPart(filePath, mimeType);
  const result = await model.generateContent([prompt, filePart]);
  const text = result.response.text();
  return safeParseJSON(text);
}

async function generateJSONFromFileOpenAI({ filePath, mimeType, prompt }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured on the server.");

  // GPT-4o vision expects images; for PDFs, callers should pre-render pages
  // to images or extract text upstream (see pdfTextFallback in ingestionController).
  const content = [
    { type: "text", text: prompt },
    fileToOpenAIImageContent(filePath, mimeType),
  ];

  const { data } = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: getOpenAIModelName(),
      response_format: { type: "json_object" },
      temperature: 0.3,
      messages: [{ role: "user", content }],
    },
    { headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" } }
  );

  const text = data.choices[0].message.content;
  return safeParseJSON(text);
}

/** PASS 1 — Accessibility Audit */
export async function runAccessibilityAudit({ filePath, mimeType, metadata }) {
  const prompt = buildAuditPrompt({ metadata });
  return generateJSONFromFile({ filePath, mimeType, prompt });
}

/** PASS 2 — Deep Semantic Transformation */
export async function runContentTransformation({ filePath, mimeType, metadata, auditContext }) {
  const prompt = buildTransformationPrompt({ metadata, auditContext });
  return generateJSONFromFile({ filePath, mimeType, prompt });
}

/** Context-grounded tutor turn (text-only, grounded in already-extracted lesson content) */
export async function runTutorTurn({ metadata, lessonContent, question, history = [] }) {
  const systemPrompt = buildTutorSystemPrompt({ metadata, lessonContent });
  const userTurn = buildTutorUserTurn({ question });

  if (getProvider() === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured on the server.");

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: userTurn },
    ];

    const { data } = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      { model: getOpenAIModelName(), temperature: 0.4, messages },
      { headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" } }
    );
    return data.choices[0].message.content;
  }

  const genAI = getGenAI();
  if (!genAI) throw new Error("GEMINI_API_KEY is not configured on the server.");
  const model = genAI.getGenerativeModel({
    model: getGeminiModelName(),
    systemInstruction: systemPrompt,
    generationConfig: { temperature: 0.4 },
  });

  const chat = model.startChat({
    history: history.map((h) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content }],
    })),
  });

  const result = await chat.sendMessage(userTurn);
  return result.response.text();
}