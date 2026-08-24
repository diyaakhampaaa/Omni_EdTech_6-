import React, { useState } from "react";
import { Eye, Ear, Users } from "lucide-react";
import VisualMode from "./VisualMode.jsx";
import HearingMode from "./HearingMode.jsx";
import UniversalMode from "./UniversalMode.jsx";
import { PLAYER_MODES } from "../../types/lesson.js";

const TABS = [
  { id: PLAYER_MODES.VISUAL, label: "Visual Accessibility", icon: Eye },
  { id: PLAYER_MODES.HEARING, label: "Hearing Accessibility", icon: Ear },
  { id: PLAYER_MODES.UNIVERSAL, label: "Universal Learning", icon: Users },
];

export default function PlayerShell({ lesson }) {
  const [mode, setMode] = useState(PLAYER_MODES.VISUAL);

  return (
    <div>
      <div role="tablist" aria-label="Accessibility mode" className="mb-6 flex gap-2 border-b border-slate-200 dark:border-slate-800">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={mode === id}
            aria-controls={`panel-${id}`}
            id={`tab-${id}`}
            onClick={() => setMode(id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              mode === id
                ? "border-brand-600 text-brand-700 dark:text-brand-300"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div id={`panel-${mode}`} role="tabpanel" aria-labelledby={`tab-${mode}`}>
        {mode === PLAYER_MODES.VISUAL && <VisualMode visualMode={lesson.contentPayload.visualMode} />}
        {mode === PLAYER_MODES.HEARING && <HearingMode hearingMode={lesson.contentPayload.hearingMode} />}
        {mode === PLAYER_MODES.UNIVERSAL && <UniversalMode universalMode={lesson.contentPayload.universalMode} />}
      </div>
    </div>
  );
}
