"use client";

import { useState } from "react";
import { DraggableWindow } from "./DraggableWindow";
import { FireAnimation } from "./FireAnimation";
import { storage } from "@/app/lib/storage";
import { useSettings } from "@/app/lib/settings-store";
import type { AnalysisMode, SkillProfile } from "@/app/lib/types";

interface MainAppProps {
  onIgnite: (url: string, mode: AnalysisMode, focus: string, skillProfile?: SkillProfile) => void;
  onClose?: () => void;
  onMinimize?: () => void;
}

interface ModeOption {
  id: AnalysisMode;
  icon: string;
  label: string;
  description: string;
}

const MODES: ModeOption[] = [
  {
    id: "documentation",
    icon: "📄",
    label: "Full Documentation",
    description: "Architecture overview · module breakdown · getting started guide",
  },
  {
    id: "contribution",
    icon: "🤝",
    label: "Contribution Guide",
    description: "Good first issues · codebase entry points · contribution patterns",
  },
  {
    id: "bugs",
    icon: "🔍",
    label: "Bug Hunt",
    description: "Potential issues · weak spots · code smells",
  },
  {
    id: "skillmatch",
    icon: "🧠",
    label: "Skill Match",
    description: "Match your skills against the repo · personalized entry points · what you can do right now",
  },
];

export function MainApp({ onIgnite, onClose, onMinimize }: MainAppProps) {
  const { hasSkillProfile } = useSettings();
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<AnalysisMode>("documentation");
  const [focus, setFocus] = useState("");
  const [urlError, setUrlError] = useState("");

  function handleIgnite() {
    const trimmed = url.trim();
    if (!trimmed) {
      setUrlError("Feed me a GitHub URL first.");
      return;
    }
    if (!trimmed.includes("github.com")) {
      setUrlError("Has to be a GitHub URL. I only speak GitHub.");
      return;
    }
    setUrlError("");
    const skillProfile = mode === "skillmatch" ? storage.getSkillProfile() ?? undefined : undefined;
    onIgnite(trimmed, mode, focus.trim(), skillProfile);
  }

  return (
    <DraggableWindow
      title="MISSION_CONFIG.EXE"
      defaultWidth={560}
      titleAlign="right"
      onClose={onClose}
      onMinimize={onMinimize}
    >
      <div style={{ padding: "24px" }}>
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "28px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <FireAnimation width={88} height={88} className="animate-flicker" showEyes />

          <h1
            className="fire-glow animate-glow"
            style={{
              color: "var(--color-ember-amber)",
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              margin: "4px 0 6px",
            }}
          >
            CALCIFER
          </h1>

          <p
            style={{
              color: "var(--color-ember-muted)",
              fontSize: "12.5px",
              letterSpacing: "0.06em",
            }}
          >
            Feed me a repo. I&apos;ll light the way.
          </p>
        </div>

        {/* URL */}
        <div style={{ marginBottom: "20px" }}>
          <label className="field-label" htmlFor="repo-url">
            GitHub Repository URL
          </label>
          <input
            id="repo-url"
            type="url"
            className="retro-input"
            placeholder="https://github.com/owner/repo"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setUrlError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleIgnite()}
            autoFocus
          />
          {urlError && <p className="field-error">{urlError}</p>}
        </div>

        {/* Mode */}
        <div style={{ marginBottom: "20px" }}>
          <label className="field-label">What should I cook?</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {MODES.map((m) => (
              <div key={m.id}>
                <div
                  className={`radio-card ${mode === m.id ? "is-selected" : ""}`}
                  onClick={() => setMode(m.id)}
                  role="radio"
                  aria-checked={mode === m.id}
                  tabIndex={0}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && setMode(m.id)
                  }
                >
                  <div className="radio-dot">
                    <div className="radio-dot-inner" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        color:
                          mode === m.id
                            ? "var(--color-ember-text)"
                            : "var(--color-ember-muted)",
                        fontSize: "13px",
                        fontWeight: 600,
                        marginBottom: "2px",
                        transition: "color 0.2s",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {m.icon}&nbsp;&nbsp;{m.label}
                      {m.id === "skillmatch" && hasSkillProfile && (
                        <span style={{ fontSize: 9, letterSpacing: "0.08em", color: "#4ADE80", border: "1px solid rgba(74,222,128,0.4)", borderRadius: 3, padding: "1px 5px" }}>
                          PROFILE SET
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        color: "var(--color-ember-dim)",
                        fontSize: "11px",
                        lineHeight: "1.5",
                      }}
                    >
                      {m.description}
                    </div>
                  </div>
                </div>
                {m.id === "skillmatch" && mode === "skillmatch" && !hasSkillProfile && (
                  <div style={{ marginTop: 4, padding: "7px 10px", background: "rgba(255,140,0,0.06)", border: "1px solid rgba(255,140,0,0.2)", borderRadius: 4, fontSize: 11, color: "var(--color-ember-muted)", lineHeight: 1.6 }}>
                    ⚠ No skill profile set. Open <strong style={{ color: "var(--color-ember-amber)" }}>⚙ Settings → Set My Skills</strong> first for a personalized report.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Focus area */}
        <div style={{ marginBottom: "24px" }}>
          <label className="field-label" htmlFor="focus-area">
            Specific focus area
            <span
              style={{
                textTransform: "none",
                letterSpacing: 0,
                fontWeight: 400,
                marginLeft: "6px",
                color: "var(--color-ember-dim)",
              }}
            >
              — optional
            </span>
          </label>
          <input
            id="focus-area"
            type="text"
            className="retro-input"
            placeholder="e.g., frontend only, auth module, API routes..."
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
          />
        </div>

        {/* Ignite */}
        <button
          className="btn-ignite"
          onClick={handleIgnite}
          style={{ width: "100%" }}
        >
          🔥&nbsp;&nbsp;IGNITE
        </button>

        <p
          style={{
            textAlign: "center",
            color: "var(--color-ember-dim)",
            fontSize: "11px",
            marginTop: "10px",
            letterSpacing: "0.02em",
          }}
        >
          ~60 seconds &middot; uses your Gemini key &middot; public repos only
        </p>
      </div>
    </DraggableWindow>
  );
}
