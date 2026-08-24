/**
 * AccessLens Prompt Templates
 * Each template is a pure function returning a structured prompt string.
 * All "generation" prompts force strict JSON output matching the Lesson data
 * contract in models/lessonSchema.js, so the response can be parsed directly.
 */

const JSON_ONLY_RULE = `
CRITICAL OUTPUT RULES:
- Respond with ONLY valid JSON. No markdown fences, no commentary, no preamble.
- If a field has no content, use an empty string, empty array, or null as appropriate — never omit a key.
- All strings must be plain text (no markdown headers) unless a field explicitly expects LaTeX.
`;

/**
 * PASS 1 — ACCESSIBILITY AUDIT
 * Analyzes raw document layout/content for accessibility failures and produces
 * a 0-100 score plus a structured issue list, WITHOUT yet doing full narrative
 * transformation (that's Pass 2, so audits stay fast and cheap).
 */
export function buildAuditPrompt({ metadata }) {
  return `
You are an accessibility auditor specializing in educational materials for
visually-impaired and hearing-impaired students. You are examining a document
(provided as an attached PDF or image) that a teacher uploaded for the lesson below.

LESSON CONTEXT:
- Title: ${metadata.title}
- Subject: ${metadata.subject}
- Reference Textbook: ${metadata.referenceBook || "N/A"}
- Chapter: ${metadata.chapter || "N/A"}
- Page Range / Focus: ${metadata.pageRange || "N/A"}

TASK — Perform a rigorous accessibility audit of the document. Identify:
1. Unlabeled or poorly labeled graphs/charts/diagrams (no axis labels, no legend, no alt text).
2. Images or figures with missing/insufficient alt-text equivalents.
3. Complex mathematical equations, chemical formulas, or notation that would be
   unreadable by a screen reader or meaningless without narration.
4. Structural failures: missing heading hierarchy, poor reading order, tables
   without headers, dense unstructured text blocks, low color-contrast visuals.
5. Any content that relies purely on color or spatial position to convey meaning.

Score the document's overall accessibility from 0 (completely inaccessible) to
100 (fully accessible to blind/low-vision AND deaf/hard-of-hearing learners).
Be strict — a typical unmodified textbook page/scan should usually score below 40.

${JSON_ONLY_RULE}

Return JSON matching exactly this shape:
{
  "auditScore": {
    "before": <number 0-100>,
    "issues": [
      {
        "id": "<short unique slug, e.g. 'issue-1'>",
        "type": "missing-alt-text" | "unlabeled-graph" | "complex-equation" | "structure-failure" | "low-contrast" | "missing-caption-source" | "other",
        "severity": "low" | "medium" | "high" | "critical",
        "description": "<specific, actionable description of the failure and where it occurs>",
        "status": "open",
        "pageNumber": <number or null>
      }
    ]
  },
  "documentSummaryForTransformation": "<2-4 sentence summary of what the document contains, to guide Pass 2 transformation>"
}`;
}

/**
 * PASS 2 — DEEP SEMANTIC TRANSFORMATION
 * Converts the raw document into the full multimodal ContentPayload:
 * visualMode, hearingMode, universalMode — grounded in the reference textbook
 * context so explanations align with the classroom curriculum.
 */
export function buildTransformationPrompt({ metadata, auditContext }) {
  return `
You are an expert accessibility content designer and subject-matter teacher.
Transform the attached educational document into a fully accessible, multi-modal
learning experience for the lesson described below. You must produce deep
SEMANTIC narratives, not literal image descriptions — e.g. for a graph, explain
what the x/y axes represent, the trend and its physical/scientific meaning, and
why it matters, rather than "a line chart with a blue line going up".

LESSON CONTEXT:
- Title: ${metadata.title}
- Subject: ${metadata.subject}
- Reference Textbook: ${metadata.referenceBook || "N/A"}
- Chapter: ${metadata.chapter || "N/A"}
- Page Range / Focus: ${metadata.pageRange || "N/A"}

KNOWN ACCESSIBILITY ISSUES FROM AUDIT (address every one of these in your transformation):
${auditContext?.issues?.length ? auditContext.issues.map(i => `- [${i.severity}] ${i.type}: ${i.description}`).join("\n") : "- (no prior audit issues provided; perform your own analysis)"}

DOCUMENT SUMMARY: ${auditContext?.documentSummaryForTransformation || "N/A"}

TASK — Produce all three accessible modes:

1. VISUAL ACCESSIBILITY MODE (for blind/low-vision learners):
   - structuredText: the document's content reorganized into clean, logically
     ordered semantic text (proper reading order, headings implied by context).
   - semanticAudioScript: a complete narration script suitable for text-to-speech
     playback of the ENTIRE lesson, including spoken descriptions of every graph
     and equation woven naturally into the narrative.
   - graphExplanations: one entry per graph/chart/diagram found, with deep
     semantic axis/trend/meaning analysis and its own standalone audioScript.
     ALSO include a "dataPoints" array — extract or reasonably estimate the
     actual numeric data the graph shows, as {"label": "...", "value": <number>}
     pairs (e.g. angle values and their corresponding measurements), so it can
     be rendered as a real accessible bar chart, not just described in text.
     If the graph has no extractable numeric data (e.g. a conceptual diagram),
     return an empty array.
   - equationExplanations: one entry per formula/equation, with a plain-language
     spoken reading, a variable-by-variable breakdown, and its conceptual meaning.

2. HEARING ACCESSIBILITY MODE (for deaf/hard-of-hearing learners — assume they
   will NOT play any audio, so every concept must stand fully on its own as
   text/visuals):
   - synchronizedCaptions: an array of caption cues with start/end times in
     seconds (estimate reasonable pacing, ~2.5 words/sec) and text, as a
     readable transcript broken into short readable chunks (these are shown
     as a paced reading list, not synced to actual audio playback).
   - transcripts: the full clean transcript text.
   - conceptCards: key formulas/equations/definitions as standalone visual
     cards (title, formula if applicable, short summary), each with an
     estimated timestamp matching where it appears in the captions.
   - visualSteps: for any sequential or procedural concept in the lesson
     (a process, a cause-and-effect chain, an ordered set of stages), break
     it into an ordered visual step diagram: {"id": "...", "title": "...",
     "steps": [{"label": "short 2-5 word step name", "detail": "one sentence
     explaining this step"}]}. Include one entry per distinct process found.
     If the lesson has no clearly sequential process, return an empty array.
   - keyTerms: a visual glossary of the lesson's important vocabulary —
     {"term": "...", "definition": "one clear sentence"} — 4 to 10 entries,
     covering every technical term used in structuredText that a student
     would need defined.

3. UNIVERSAL LEARNING MODE (for all learners, cognitive accessibility):
   - simplifiedSummary: a plain-language summary of the whole lesson.
   - keyTakeaways: 4-7 concise bullet points.
   - flashcards: 5-10 term/concept front-back flashcards.
   - quiz: 4-6 multiple-choice self-assessment questions with 4 options each,
     the correct option index, and a short explanation.

Also re-score accessibility 0-100 assuming this transformed output replaces the
original (this should be high, reflecting the improvements you made), and list
each original issue as "resolved" if your transformation addresses it.

${JSON_ONLY_RULE}

Return JSON matching exactly this shape:
{
  "auditScore": {
    "after": <number 0-100>,
    "issues": [ { "id": "<matching id from audit if resolved, else new>", "type": "...", "severity": "...", "description": "...", "status": "resolved" | "open", "pageNumber": <number|null> } ]
  },
  "contentPayload": {
    "visualMode": {
      "structuredText": "...",
      "semanticAudioScript": "...",
      "graphExplanations": [
        { "id": "graph-1", "sourceRef": "...", "axisSummary": "...", "trendNarrative": "...", "keyDataPoints": "...", "audioScript": "...", "dataPoints": [ { "label": "...", "value": 0 } ] }
      ],
      "equationExplanations": [
        { "id": "eq-1", "latex": "...", "plainLanguage": "...", "variableBreakdown": "...", "conceptualMeaning": "..." }
      ]
    },
    "hearingMode": {
      "synchronizedCaptions": [ { "start": 0, "end": 3.2, "text": "..." } ],
      "transcripts": "...",
      "conceptCards": [ { "title": "...", "formula": "...", "summary": "...", "timestamp": 0 } ],
      "visualSteps": [
        { "id": "process-1", "title": "...", "steps": [ { "label": "...", "detail": "..." } ] }
      ],
      "keyTerms": [ { "term": "...", "definition": "..." } ]
    },
    "universalMode": {
      "simplifiedSummary": "...",
      "keyTakeaways": ["...","..."],
      "flashcards": [ { "id": "fc-1", "front": "...", "back": "..." } ],
      "quiz": [ { "id": "q-1", "question": "...", "options": ["...","...","...","..."], "correctIndex": 0, "explanation": "..." } ]
    }
  }
}`;
}

/**
 * CONTEXT-GROUNDED TUTOR Q&A ("Ask AccessLens")
 * Strictly grounds answers in the lesson's transformed content + reference
 * textbook metadata. Explicitly instructs the model to refuse/redirect when
 * asked about anything outside that scope, to prevent hallucination.
 */
export function buildTutorSystemPrompt({ metadata, lessonContent }) {
  return `
You are "Ask AccessLens", a supportive, patient AI tutor embedded inside an
accessible lesson player. You help a student understand ONE specific lesson.

LESSON METADATA:
- Title: ${metadata.title}
- Subject: ${metadata.subject}
- Reference Textbook: ${metadata.referenceBook || "N/A"}
- Chapter: ${metadata.chapter || "N/A"}
- Page Range / Focus: ${metadata.pageRange || "N/A"}

GROUNDING RULES (strict):
1. Answer ONLY using the LESSON CONTENT below and general, well-established
   knowledge of the SAME textbook chapter/topic needed to explain it clearly.
2. If the student asks something unrelated to this lesson/chapter/subject, or
   asks for content the lesson does not cover, politely say that it's outside
   this lesson's scope and redirect them to ask about the current material.
   Do NOT fabricate facts, page references, or citations that aren't grounded
   in the lesson content.
3. Keep answers accessible: short sentences, define jargon, offer to explain
   equations/graphs verbally step by step if asked.
4. When helpful, reference which part of the lesson (e.g. a concept card or
   graph explanation) your answer is drawn from.
5. Never claim to see images/graphs directly — refer to the semantic
   explanations already generated for this lesson.
6. FORMATTING — CRITICAL: Write in plain spoken-style prose only. This chat
   may be read aloud by a screen reader or text-to-speech tool, so NEVER use
   markdown syntax of any kind: no asterisks for bold/italics, no "#" headers,
   no "---" dividers, no bullet "-" or numbered "1." lists, no code fences.
   If you need to present steps, write them as a flowing sentence or
   paragraph ("First... Next... Finally...") instead of a list. Keep
   paragraphs short and use blank lines between them for readability.
7. Every answer must work equally well for a deaf/hard-of-hearing student
   reading silently as it does for a blind/low-vision student having it read
   aloud by text-to-speech. Never write phrases that assume the student can
   hear you (e.g. "listen to this", "as you can hear"). Use "notice", "read",
   or "note" instead. Do not assume the student has played any audio.

LESSON CONTENT (ground truth — do not contradict this):
"""
${lessonContent}
"""`;
}

export function buildTutorUserTurn({ question }) {
  return `Student question: ${question}`;
}