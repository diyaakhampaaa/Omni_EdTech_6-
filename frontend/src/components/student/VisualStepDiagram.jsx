import React from "react";
import { ArrowRight, ArrowDown } from "lucide-react";

/**
 * Renders a sequential process as connected visual step cards, so a
 * procedural concept (e.g. "light hits boundary -> bends -> exits at a new
 * angle") is understood by structure and layout, not just by reading a
 * paragraph. Works entirely without audio.
 */
export default function VisualStepDiagram({ title, steps }) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      {title && <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">{title}</h4>}

      <div className="flex flex-col sm:flex-row sm:items-stretch gap-2 sm:gap-0">
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <div className="flex-1 rounded-lg border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/20 p-3">
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="font-semibold text-sm text-brand-800 dark:text-brand-200">{step.label}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">{step.detail}</p>
            </div>

            {i < steps.length - 1 && (
              <div className="flex items-center justify-center px-1 py-1 sm:py-0" aria-hidden="true">
                <ArrowDown className="h-4 w-4 text-slate-400 sm:hidden" />
                <ArrowRight className="h-4 w-4 text-slate-400 hidden sm:block" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}