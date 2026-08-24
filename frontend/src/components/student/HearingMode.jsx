import React, { useState } from "react";
import { Captions, BookOpenText, Clock, Workflow, BookMarked, BarChart3 } from "lucide-react";
import VisualStepDiagram from "./VisualStepDiagram.jsx";
import BarChart from "./BarChart.jsx";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function HearingMode({ hearingMode, graphExplanations }) {
  const [activeCue, setActiveCue] = useState(0);
  if (!hearingMode) return null;
  const { synchronizedCaptions, transcripts, conceptCards, visualSteps, keyTerms } = hearingMode;

  const chartsWithData = (graphExplanations || []).filter((g) => g.dataPoints?.length > 0);

  return (
    <div className="space-y-8 rounded-xl bg-white dark:bg-slate-900 p-6">
      {visualSteps?.length > 0 && (
        <section aria-labelledby="steps-heading" className="space-y-4">
          <h3 id="steps-heading" className="flex items-center gap-2 text-lg font-semibold">
            <Workflow className="h-5 w-5 text-brand-600" aria-hidden="true" /> How It Works, Step by Step
          </h3>
          {visualSteps.map((process) => (
            <VisualStepDiagram key={process.id} title={process.title} steps={process.steps} />
          ))}
        </section>
      )}

      {chartsWithData.length > 0 && (
        <section aria-labelledby="charts-heading" className="space-y-4">
          <h3 id="charts-heading" className="flex items-center gap-2 text-lg font-semibold">
            <BarChart3 className="h-5 w-5 text-brand-600" aria-hidden="true" /> Data at a Glance
          </h3>
          {chartsWithData.map((g) => (
            <BarChart key={g.id} title={g.sourceRef} dataPoints={g.dataPoints} />
          ))}
        </section>
      )}

      {keyTerms?.length > 0 && (
        <section aria-labelledby="glossary-heading" className="space-y-3">
          <h3 id="glossary-heading" className="flex items-center gap-2 text-lg font-semibold">
            <BookMarked className="h-5 w-5 text-brand-600" aria-hidden="true" /> Key Terms
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {keyTerms.map((kt, i) => (
              <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <p className="font-semibold text-sm text-brand-700 dark:text-brand-300">{kt.term}</p>
                <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{kt.definition}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {conceptCards?.length > 0 && (
        <section aria-labelledby="concept-cards-heading" className="space-y-3">
          <h3 id="concept-cards-heading" className="flex items-center gap-2 text-lg font-semibold">
            <Clock className="h-5 w-5 text-brand-600" aria-hidden="true" /> Key Concept Cards
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {conceptCards.map((card, i) => (
              <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{card.title}</h4>
                  {typeof card.timestamp === "number" && (
                    <span className="text-xs tabular-nums text-slate-400">{formatTime(card.timestamp)}</span>
                  )}
                </div>
                {card.formula && <p className="mt-1 font-mono text-brand-700 dark:text-brand-300">{card.formula}</p>}
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{card.summary}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="captions-heading" className="space-y-3">
        <h3 id="captions-heading" className="flex items-center gap-2 text-lg font-semibold">
          <Captions className="h-5 w-5 text-brand-600" aria-hidden="true" /> Paced Reading
        </h3>
        <p className="text-xs text-slate-500">
          The same content as the transcript below, broken into short chunks so you can read at a
          steady pace — click any line to mark your place.
        </p>
        <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
          {synchronizedCaptions?.map((cue, i) => (
            <button
              key={i}
              onClick={() => setActiveCue(i)}
              aria-current={activeCue === i}
              className={`flex w-full items-start gap-3 px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 ${
                activeCue === i ? "bg-brand-50 dark:bg-brand-900/30 font-medium" : ""
              }`}
            >
              <span>{cue.text}</span>
            </button>
          ))}
          {(!synchronizedCaptions || synchronizedCaptions.length === 0) && (
            <p className="p-4 text-sm text-slate-500">No content generated for this lesson.</p>
          )}
        </div>
      </section>

      <section aria-labelledby="transcript-heading" className="space-y-3">
        <h3 id="transcript-heading" className="flex items-center gap-2 text-lg font-semibold">
          <BookOpenText className="h-5 w-5 text-brand-600" aria-hidden="true" /> Full Transcript
        </h3>
        <p className="max-w-3xl whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-200">
          {transcripts}
        </p>
      </section>
    </div>
  );
}