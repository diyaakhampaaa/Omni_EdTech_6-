/**
 * AccessLens — Unified Lesson Data Contract (frontend mirror)
 * Keep in sync with backend/models/lessonSchema.js
 *
 * @typedef {Object} LessonMetadata
 * @property {string} title
 * @property {string} subject
 * @property {string} referenceBook
 * @property {string} chapter
 * @property {string} pageRange
 *
 * @typedef {Object} AccessibilityIssue
 * @property {string} id
 * @property {string} type
 * @property {"low"|"medium"|"high"|"critical"} severity
 * @property {string} description
 * @property {"open"|"resolved"} status
 * @property {number|null} [pageNumber]
 *
 * @typedef {Object} AuditScore
 * @property {number} before
 * @property {number|null} after
 * @property {AccessibilityIssue[]} issues
 *
 * @typedef {Object} GraphExplanation
 * @property {string} id
 * @property {string} sourceRef
 * @property {string} axisSummary
 * @property {string} trendNarrative
 * @property {string} keyDataPoints
 * @property {string} audioScript
 *
 * @typedef {Object} EquationExplanation
 * @property {string} id
 * @property {string} latex
 * @property {string} plainLanguage
 * @property {string} variableBreakdown
 * @property {string} conceptualMeaning
 *
 * @typedef {Object} VisualMode
 * @property {string} structuredText
 * @property {string} semanticAudioScript
 * @property {GraphExplanation[]} graphExplanations
 * @property {EquationExplanation[]} equationExplanations
 *
 * @typedef {Object} CaptionCue
 * @property {number} start
 * @property {number} end
 * @property {string} text
 *
 * @typedef {Object} ConceptCard
 * @property {string} title
 * @property {string} [formula]
 * @property {string} summary
 * @property {number} [timestamp]
 *
 * @typedef {Object} HearingMode
 * @property {CaptionCue[]} synchronizedCaptions
 * @property {string} transcripts
 * @property {ConceptCard[]} conceptCards
 *
 * @typedef {Object} Flashcard
 * @property {string} id
 * @property {string} front
 * @property {string} back
 *
 * @typedef {Object} QuizQuestion
 * @property {string} id
 * @property {string} question
 * @property {string[]} options
 * @property {number} correctIndex
 * @property {string} explanation
 *
 * @typedef {Object} UniversalMode
 * @property {string} simplifiedSummary
 * @property {string[]} keyTakeaways
 * @property {Flashcard[]} flashcards
 * @property {QuizQuestion[]} quiz
 *
 * @typedef {Object} ContentPayload
 * @property {VisualMode} visualMode
 * @property {HearingMode} hearingMode
 * @property {UniversalMode} universalMode
 *
 * @typedef {Object} ChatContext
 * @property {number[][]|null} embeddings
 * @property {string} vectorizedReferenceText
 * @property {string} lessonContent
 *
 * @typedef {Object} Lesson
 * @property {string} lessonId
 * @property {LessonMetadata} metadata
 * @property {AuditScore} auditScore
 * @property {ContentPayload} contentPayload
 * @property {ChatContext} chatContext
 * @property {"uploaded"|"audited"|"transforming"|"ready"|"error"} status
 */

export const LESSON_STATUS = {
  UPLOADED: "uploaded",
  AUDITED: "audited",
  TRANSFORMING: "transforming",
  READY: "ready",
  ERROR: "error",
};

export const PLAYER_MODES = {
  VISUAL: "visual",
  HEARING: "hearing",
  UNIVERSAL: "universal",
};
