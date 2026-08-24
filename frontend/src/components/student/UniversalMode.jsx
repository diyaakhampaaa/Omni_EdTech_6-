import React, { useState } from "react";
import { Lightbulb, Layers, ListChecks, RotateCw, CheckCircle2, XCircle } from "lucide-react";

function FlashcardDeck({ flashcards }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  if (!flashcards?.length) return <p className="text-sm text-slate-500">No flashcards generated.</p>;

  const card = flashcards[index];

  return (
    <div className="max-w-md">
      <button
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Showing answer, click to show question" : "Showing question, click to show answer"}
        className="flex min-h-[10rem] w-full items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-brand-50 dark:bg-brand-900/20 p-6 text-center"
      >
        <p className="text-lg font-medium">{flipped ? card.back : card.front}</p>
      </button>
      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => {
            setFlipped(false);
            setIndex((i) => (i - 1 + flashcards.length) % flashcards.length);
          }}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        >
          Previous
        </button>
        <span className="text-sm text-slate-500">
          {index + 1} / {flashcards.length}
        </span>
        <button
          onClick={() => setFlipped((f) => !f)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        >
          <RotateCw className="h-3.5 w-3.5" aria-hidden="true" /> Flip
        </button>
        <button
          onClick={() => {
            setFlipped(false);
            setIndex((i) => (i + 1) % flashcards.length);
          }}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function Quiz({ quiz }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!quiz?.length) return <p className="text-sm text-slate-500">No quiz generated.</p>;

  const score = quiz.reduce((acc, q) => acc + (answers[q.id] === q.correctIndex ? 1 : 0), 0);

  return (
    <div className="space-y-6">
      {quiz.map((q) => (
        <fieldset key={q.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <legend className="mb-2 font-medium">{q.question}</legend>
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const selected = answers[q.id] === i;
              const isCorrect = submitted && i === q.correctIndex;
              const isWrongSelected = submitted && selected && i !== q.correctIndex;
              return (
                <label
                  key={i}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer
                    ${isCorrect ? "border-green-400 bg-green-50 dark:bg-green-900/20" : ""}
                    ${isWrongSelected ? "border-red-400 bg-red-50 dark:bg-red-900/20" : ""}
                    ${!submitted ? "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800" : ""}
                  `}
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={selected}
                    disabled={submitted}
                    onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                    className="accent-brand-600"
                  />
                  {opt}
                  {isCorrect && <CheckCircle2 className="ml-auto h-4 w-4 text-green-600" aria-hidden="true" />}
                  {isWrongSelected && <XCircle className="ml-auto h-4 w-4 text-red-600" aria-hidden="true" />}
                </label>
              );
            })}
          </div>
          {submitted && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{q.explanation}</p>}
        </fieldset>
      ))}

      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Submit answers
        </button>
      ) : (
        <p className="font-semibold" role="status">
          You scored {score} / {quiz.length}
        </p>
      )}
    </div>
  );
}

export default function UniversalMode({ universalMode }) {
  if (!universalMode) return null;
  const { simplifiedSummary, keyTakeaways, flashcards, quiz } = universalMode;

  return (
    <div className="space-y-8 rounded-xl bg-white dark:bg-slate-900 p-6">
      <section aria-labelledby="summary-heading" className="space-y-2">
        <h3 id="summary-heading" className="flex items-center gap-2 text-lg font-semibold">
          <Lightbulb className="h-5 w-5 text-brand-600" aria-hidden="true" /> Simplified Summary
        </h3>
        <p className="max-w-3xl text-sm leading-7 text-slate-700 dark:text-slate-200">{simplifiedSummary}</p>
      </section>

      {keyTakeaways?.length > 0 && (
        <section aria-labelledby="takeaways-heading" className="space-y-2">
          <h3 id="takeaways-heading" className="flex items-center gap-2 text-lg font-semibold">
            <ListChecks className="h-5 w-5 text-brand-600" aria-hidden="true" /> Key Takeaways
          </h3>
          <ul className="list-disc space-y-1 pl-6 text-sm text-slate-700 dark:text-slate-200">
            {keyTakeaways.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="flashcards-heading" className="space-y-3">
        <h3 id="flashcards-heading" className="flex items-center gap-2 text-lg font-semibold">
          <Layers className="h-5 w-5 text-brand-600" aria-hidden="true" /> Flashcards
        </h3>
        <FlashcardDeck flashcards={flashcards} />
      </section>

      <section aria-labelledby="quiz-heading" className="space-y-3">
        <h3 id="quiz-heading" className="text-lg font-semibold">
          Self-Assessment Quiz
        </h3>
        <Quiz quiz={quiz} />
      </section>
    </div>
  );
}
