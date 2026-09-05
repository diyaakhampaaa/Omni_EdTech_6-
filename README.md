
# AccessLens

AI-powered accessibility platform that converts inaccessible educational materials
(PDFs, images, slides) into fully accessible, multi-modal learning experiences for
visually- and hearing-impaired students.

**[Watch the demo video](https://www.youtube.com/watch?v=LQ0Lt88dB3U)**

**[Try AccessLens →](https://accesslens-front.onrender.com)**

## Project layout

```
accesslens/
├── backend/
│   ├── server.js                 Express app entry
│   ├── routes/                   lessonRoutes.js, chatRoutes.js
│   ├── controllers/               ingestion / audit / transform / chat
│   ├── services/
│   │   ├── promptTemplates.js    Structured prompts (Audit, Transform, Tutor)
│   │   └── geminiService.js      Gemini/GPT-4o API wrapper, JSON parsing
│   ├── middleware/upload.js      Multer config (PDF/image, 25MB limit)
│   └── models/lessonSchema.js    Unified Lesson data contract + in-memory store
└── frontend/
    └── src/
        ├── types/lesson.js       JSDoc mirror of the backend data contract
        ├── api/client.js         Axios wrapper for all backend endpoints
        ├── context/LessonContext.jsx
        ├── hooks/useTTS.js       Web Speech API hook (play/pause/rate)
        ├── components/
        │   ├── teacher/          Uploader, AuditDashboard, TransformPanel
        │   ├── student/          PlayerShell, VisualMode, HearingMode, UniversalMode
        │   └── chat/             AskAccessLensDrawer
        └── pages/                Home, TeacherWorkflow, StudentWorkflow
```


## Processing pipeline

1. **Module A — Ingestion** (`POST /api/lessons/upload`): teacher drags a PDF/image
   onto the uploader and fills in reference-textbook context (book, chapter, page
   range). Creates a `Lesson` in `status: "uploaded"`.
2. **Module B, Pass 1 — Audit** (`POST /api/lessons/:id/audit`): sends the raw file
   to Gemini with `buildAuditPrompt`, which scores 0-100 and returns a structured
   issue list (unlabeled graphs, missing alt-text, complex equations, structural
   failures). `status: "audited"`.
3. **Module B, Pass 2 — Transformation** (`POST /api/lessons/:id/transform`): sends
   the file again with `buildTransformationPrompt`, which is grounded in the Pass 1
   issues and produces the full `contentPayload` for all three modes, plus an
   "after" score and issue resolution status. `status: "ready"`.
4. **Module C — Student Player**: `PlayerShell` renders `VisualMode`, `HearingMode`,
   and `UniversalMode` as accessible tabs over the same `contentPayload`.
5. **Module D — Ask AccessLens** (`POST /api/lessons/:id/chat`): a grounded chat
   turn using `buildTutorSystemPrompt`, which embeds the lesson's transformed
   content directly in the system prompt and instructs the model to refuse
   out-of-scope questions rather than hallucinate.

## Running locally

### Backend

```bash
cd backend   
npm install
npm run dev             
```

### Frontend

```bash
cd frontend
npm install
npm run dev              
```

# AccessLens
## Accessible Learning for Visually and Hearing Impaired Students

Students with visual or hearing impairments often lack access to learning content designed for their needs. Design an inclusive solution that improves their access to quality education.

##  Proposed Solution — AccessLens
**AI Accessibility Compiler for Educational Content — One Lesson. Every Learner.**

AccessLens will transform existing educational content (PDFs, PPTs, videos) into personalized, accessible learning experiences across three paths:
-  **Visual** — TTS, structured text, graph/diagram narration
-  **Hearing** — Captions, transcripts, visual concept cards
-  **Universal** — Simplified explanations, concept maps, quizzes

## 👤 Author

**Diya Khampa**
Indira Gandhi Delhi Technical University for Women (IGDTUW)
IT '29

📧 Email: [khampadiya8@gmail.com]
🔗 LinkedIn: [linkedin.com/in/diya-khampa-4b9851302](https://www.linkedin.com/in/diya-khampa-4b9851302/)

---

