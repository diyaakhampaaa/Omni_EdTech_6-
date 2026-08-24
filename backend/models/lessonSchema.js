/**
 * AccessLens — Unified Lesson Data Contract
 * This is the single source of truth for the shape of a "Lesson" object as it
 * flows Teacher Upload -> Audit -> Transformation -> Student Player -> AI Tutor.
 * The frontend mirrors this shape in `frontend/src/types/lesson.js`.
 */

/**
 * @typedef {Object} AccessibilityIssue
 * @property {string} id
 * @property {"missing-alt-text"|"unlabeled-graph"|"complex-equation"|"structure-failure"|"low-contrast"|"missing-caption-source"|"other"} type
 * @property {"low"|"medium"|"high"|"critical"} severity
 * @property {string} description
 * @property {"open"|"resolved"} status
 * @property {number} [pageNumber]
 */

/**
 * @typedef {Object} AuditScore
 * @property {number} before   0-100 accessibility score prior to transformation
 * @property {number|null} after 0-100 accessibility score after transformation (null until Pass 2 runs)
 * @property {AccessibilityIssue[]} issues
 */

/**
 * @typedef {Object} GraphExplanation
 * @property {string} id
 * @property {string} sourceRef        e.g. "Figure 3, Page 12"
 * @property {string} axisSummary      Deep semantic description of x/y axes and units
 * @property {string} trendNarrative   What the data trend physically means
 * @property {string} keyDataPoints
 * @property {string} audioScript      SSML-friendly narration script for TTS
 */

/**
 * @typedef {Object} EquationExplanation
 * @property {string} id
 * @property {string} latex            e.g. "F = ma"
 * @property {string} plainLanguage    Spoken-friendly reading of the equation
 * @property {string} variableBreakdown
 * @property {string} conceptualMeaning
 */

/**
 * @typedef {Object} VisualMode
 * @property {string} structuredText           Semantic HTML/markdown reading order
 * @property {string} semanticAudioScript       Full narration script incl. figures/equations
 * @property {GraphExplanation[]} graphExplanations
 * @property {EquationExplanation[]} equationExplanations
 */

/**
 * @typedef {Object} CaptionCue
 * @property {number} start   seconds
 * @property {number} end     seconds
 * @property {string} text
 */

/**
 * @typedef {Object} ConceptCard
 * @property {string} title
 * @property {string} [formula]
 * @property {string} summary
 * @property {number} [timestamp]
 */

/**
 * @typedef {Object} HearingMode
 * @property {CaptionCue[]} synchronizedCaptions
 * @property {string} transcripts
 * @property {ConceptCard[]} conceptCards
 */

/**
 * @typedef {Object} Flashcard
 * @property {string} id
 * @property {string} front
 * @property {string} back
 */

/**
 * @typedef {Object} QuizQuestion
 * @property {string} id
 * @property {string} question
 * @property {string[]} options
 * @property {number} correctIndex
 * @property {string} explanation
 */

/**
 * @typedef {Object} UniversalMode
 * @property {string} simplifiedSummary
 * @property {string[]} keyTakeaways
 * @property {Flashcard[]} flashcards
 * @property {QuizQuestion[]} quiz
 */

/**
 * @typedef {Object} ContentPayload
 * @property {VisualMode} visualMode
 * @property {HearingMode} hearingMode
 * @property {UniversalMode} universalMode
 */

/**
 * @typedef {Object} ChatContext
 * @property {number[][]|null} embeddings
 * @property {string} vectorizedReferenceText
 * @property {string} lessonContent
 */

/**
 * @typedef {Object} LessonMetadata
 * @property {string} title
 * @property {string} subject
 * @property {string} referenceBook
 * @property {string} chapter
 * @property {string} pageRange
 */

/**
 * @typedef {Object} Lesson
 * @property {string} lessonId
 * @property {LessonMetadata} metadata
 * @property {AuditScore} auditScore
 * @property {ContentPayload} contentPayload
 * @property {ChatContext} chatContext
 * @property {"uploaded"|"audited"|"transforming"|"ready"|"error"} status
 * @property {string} createdAt
 * @property {string} updatedAt
 */

// Generates a short, human-shareable code (e.g. "K3F9QX") that a teacher can
// give directly to their students. Students use this code — not a browsable
// list — to open a lesson, so one teacher's students never see another
// teacher's lessons and a lesson is only reachable by someone who has the code.
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
function generateLessonCode() {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

function generateUniqueLessonCode() {
  const existingCodes = new Set(Array.from(lessonStore.values()).map((l) => l.lessonCode));
  let code = generateLessonCode();
  while (existingCodes.has(code)) {
    code = generateLessonCode();
  }
  return code;
}

export function createEmptyLesson({ lessonId, metadata, createdBy }) {
  return {
    lessonId,
    createdBy, // teacher user id — lets each teacher see only their own lessons
    lessonCode: generateUniqueLessonCode(), // students use this to open the lesson
    metadata: {
      title: metadata.title || "Untitled Lesson",
      subject: metadata.subject || "",
      referenceBook: metadata.referenceBook || "",
      chapter: metadata.chapter || "",
      pageRange: metadata.pageRange || "",
    },
    auditScore: {
      before: 0,
      after: null,
      issues: [],
    },
    contentPayload: {
      visualMode: {
        structuredText: "",
        semanticAudioScript: "",
        graphExplanations: [],
        equationExplanations: [],
      },
      hearingMode: {
        synchronizedCaptions: [],
        transcripts: "",
        conceptCards: [],
      },
      universalMode: {
        simplifiedSummary: "",
        keyTakeaways: [],
        flashcards: [],
        quiz: [],
      },
    },
    chatContext: {
      embeddings: null,
      vectorizedReferenceText: "",
      lessonContent: "",
    },
    status: "uploaded",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
/** Find a lesson by its shareable student-facing code (case-insensitive). */
export function findLessonByCode(code) {
  const normalized = (code || "").trim().toUpperCase();
  if (!normalized) return null;
  return Array.from(lessonStore.values()).find((l) => l.lessonCode === normalized) || null;
}

// // In-memory lesson store (swap for a real DB — Mongo/Postgres — in production)
// export const lessonStore = new Map();

// Lessons are backed by a JSON file on disk so they survive backend
// restarts (dev server reloads, deploys, crashes). This is still a
// stand-in for a real database — fine for a single-instance demo, but
// swap for Postgres/Mongo before running multiple server instances.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const LESSONS_FILE = path.join(DATA_DIR, "lessons.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

export const lessonStore = new Map();

// Load any previously-saved lessons back into memory at startup.
try {
  if (fs.existsSync(LESSONS_FILE)) {
    const raw = JSON.parse(fs.readFileSync(LESSONS_FILE, "utf-8"));
    for (const [id, lesson] of Object.entries(raw)) {
      lessonStore.set(id, lesson);
    }
    console.log(`Loaded ${lessonStore.size} saved lesson(s) from disk.`);
  }
} catch (err) {
  console.error("Failed to load saved lessons, starting with an empty store:", err.message);
}

function persistLessons() {
  try {
    const obj = Object.fromEntries(lessonStore);
    fs.writeFileSync(LESSONS_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save lessons to disk:", err.message);
  }
}

/** Always use this (not lessonStore.set directly) so changes survive a restart. */
export function saveLesson(lesson) {
  lessonStore.set(lesson.lessonId, lesson);
  persistLessons();
}
