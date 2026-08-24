import React, { useState } from "react";
import { Play, Pause, Square, Sun, Moon, Sigma, LineChart } from "lucide-react";
import { useTTS } from "../../hooks/useTTS.js";

// Tailwind only generates classes it can find as literal strings at build
// time — building "text-" + fontScale dynamically means the class never
// gets generated and the size never visually changes. Map to static classes.
const FONT_SIZE_CLASSES = {
  "reader-base": "text-reader-base",
  "reader-lg": "text-reader-lg",
  "reader-xl": "text-reader-xl",
};

export default function VisualMode({ visualMode }) {
  const tts = useTTS();
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScale] = useState("reader-base");

  if (!visualMode) return null;
  const { structuredText, semanticAudioScript, graphExplanations, equationExplanations } = visualMode;

  return (
    <div className={`space-y-8 rounded-xl p-6 ${highContrast ? "high-contrast" : "bg-white dark:bg-slate-900"}`}>
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
        <button
          onClick={() => setHighContrast((v) => !v)}
          aria-pressed={highContrast}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          {highContrast ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          {highContrast ? "Standard contrast" : "High contrast"}
        </button>

        <label className="flex items-center gap-2 text-sm">
          Text size
          <select
            value={fontScale}
            onChange={(e) => setFontScale(e.target.value)}
            className="input w-auto"
          >
            <option value="reader-base">Normal</option>
            <option value="reader-lg">Large</option>
            <option value="reader-xl">Extra large</option>
          </select>
        </label>

        <div className="ml-auto flex items-center gap-2">
          {!tts.isSpeaking ? (
            <button
              onClick={() => tts.speak(semanticAudioScript)}
              disabled={!tts.supported}
              className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              <Play className="h-4 w-4" aria-hidden="true" /> Play narration
            </button>
          ) : (
            <>
              {tts.isPaused ? (
                <button onClick={tts.resume} className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white">
                  <Play className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : (
                <button onClick={tts.pause} className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white" aria-label="Pause narration">
                  <Pause className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
              <button onClick={tts.stop} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold" aria-label="Stop narration">
                <Square className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          )}

          <label className="flex items-center gap-2 text-sm">
            Speed
            <input
              type="range"
              min="1"
              max="2"
              step="0.1"
              value={tts.rate}
              onChange={(e) => tts.setRate(Number(e.target.value), semanticAudioScript)}
              aria-label="Playback speed, 1.0x to 2.0x"
              className="w-28"
            />
            <span className="tabular-nums w-10">{tts.rate.toFixed(1)}x</span>
          </label>
        </div>
      </div>

      {!tts.supported && (
        <p className="text-sm text-amber-600" role="status">
          Text-to-speech isn't supported in this browser. Content is still fully readable below.
        </p>
      )}

      <article
        className={`whitespace-pre-line font-serif ${FONT_SIZE_CLASSES[fontScale]} max-w-3xl`}
        aria-label="Lesson content, structured reading order"
      >
        {structuredText}
      </article>

      {graphExplanations?.length > 0 && (
        <section aria-labelledby="graphs-heading" className="space-y-4">
          <h3 id="graphs-heading" className="flex items-center gap-2 text-lg font-semibold">
            <LineChart className="h-5 w-5 text-brand-600" aria-hidden="true" /> Graph & Diagram Narrations
          </h3>
          {graphExplanations.map((g) => (
            <div key={g.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-2">
              <p className="text-xs font-semibold uppercase text-slate-500">{g.sourceRef}</p>
              <p><strong>Axes:</strong> {g.axisSummary}</p>
              <p><strong>Trend & meaning:</strong> {g.trendNarrative}</p>
              <p><strong>Key data points:</strong> {g.keyDataPoints}</p>
              <button
                onClick={() => tts.speak(g.audioScript)}
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
              >
                <Play className="h-3.5 w-3.5" aria-hidden="true" /> Listen to this graph explained
              </button>
            </div>
          ))}
        </section>
      )}

      {equationExplanations?.length > 0 && (
        <section aria-labelledby="equations-heading" className="space-y-4">
          <h3 id="equations-heading" className="flex items-center gap-2 text-lg font-semibold">
            <Sigma className="h-5 w-5 text-brand-600" aria-hidden="true" /> Equation Explanations
          </h3>
          {equationExplanations.map((eq) => (
            <div key={eq.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-2">
              <p className="font-mono text-lg">{eq.latex}</p>
              <p><strong>Read aloud as:</strong> {eq.plainLanguage}</p>
              <p><strong>Variables:</strong> {eq.variableBreakdown}</p>
              <p><strong>What it means:</strong> {eq.conceptualMeaning}</p>
              <button
                onClick={() => tts.speak(`${eq.plainLanguage}. ${eq.conceptualMeaning}`)}
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
              >
                <Play className="h-3.5 w-3.5" aria-hidden="true" /> Listen to this equation explained
              </button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}