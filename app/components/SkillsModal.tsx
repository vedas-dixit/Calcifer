"use client";

import { useState } from "react";
import { DraggableWindow } from "./DraggableWindow";
import { storage } from "@/app/lib/storage";
import { toast } from "@/app/lib/toast";
import type { SkillProfile, SkillLanguage, SkillLevel } from "@/app/lib/types";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const LANGUAGES = [
  { id: "javascript", name: "JavaScript" },
  { id: "typescript", name: "TypeScript" },
  { id: "python", name: "Python" },
  { id: "go", name: "Go" },
  { id: "rust", name: "Rust" },
  { id: "java", name: "Java" },
  { id: "kotlin", name: "Kotlin" },
  { id: "ruby", name: "Ruby" },
  { id: "php", name: "PHP" },
  { id: "swift", name: "Swift" },
  { id: "csharp", name: "C#" },
  { id: "cpp", name: "C++" },
  { id: "c", name: "C" },
  { id: "dart", name: "Dart" },
  { id: "elixir", name: "Elixir" },
  { id: "scala", name: "Scala" },
  { id: "shell", name: "Shell/Bash" },
  { id: "sql", name: "SQL" },
  { id: "r", name: "R" },
  { id: "haskell", name: "Haskell" },
];

const LANG_FRAMEWORKS: Record<string, string[]> = {
  javascript: ["React", "Vue", "Angular", "Svelte", "Next.js", "Nuxt", "Node.js", "Express", "NestJS", "Electron"],
  typescript: ["React", "Vue", "Angular", "Svelte", "Next.js", "Nuxt", "NestJS", "tRPC", "Prisma"],
  python: ["Django", "FastAPI", "Flask", "NumPy", "Pandas", "PyTorch", "TensorFlow", "Celery", "Pydantic"],
  go: ["Gin", "Echo", "Fiber", "gRPC", "Chi", "Cobra"],
  rust: ["Tokio", "Actix", "Axum", "WebAssembly", "Bevy", "Tauri"],
  java: ["Spring Boot", "Maven", "Gradle", "Android", "Quarkus", "Micronaut"],
  kotlin: ["Spring Boot", "Android", "Ktor", "Compose", "Coroutines"],
  ruby: ["Rails", "Sinatra", "RSpec", "Sidekiq"],
  php: ["Laravel", "Symfony", "WordPress", "Composer"],
  swift: ["SwiftUI", "UIKit", "Vapor", "Combine"],
  csharp: ["ASP.NET", ".NET", "Unity", "Blazor", "Entity Framework"],
  cpp: ["Qt", "OpenGL", "SDL", "CMake", "Boost", "LLVM"],
  dart: ["Flutter"],
  elixir: ["Phoenix", "Ecto", "LiveView"],
  scala: ["Akka", "Play", "Spark", "Cats"],
  shell: ["Docker", "Kubernetes", "Terraform", "Ansible", "GitHub Actions"],
  sql: ["PostgreSQL", "MySQL", "SQLite", "Redis", "MongoDB"],
};

const DOMAINS = [
  { id: "Frontend / UI", label: "Frontend / UI" },
  { id: "Backend / APIs", label: "Backend / APIs" },
  { id: "Databases", label: "Databases" },
  { id: "DevOps / CI/CD", label: "DevOps / CI/CD" },
  { id: "Testing", label: "Testing" },
  { id: "Documentation", label: "Documentation" },
  { id: "Security", label: "Security" },
  { id: "Mobile", label: "Mobile" },
  { id: "Machine Learning / AI", label: "Machine Learning / AI" },
  { id: "Systems / Low-level", label: "Systems / Low-level" },
  { id: "Open Source tooling", label: "Open Source tooling" },
];

const GOALS = [
  { id: "Fix bugs", label: "Fix bugs" },
  { id: "Build features", label: "Build features" },
  { id: "Write documentation", label: "Write docs" },
  { id: "Add tests", label: "Add tests" },
  { id: "Refactor / clean up", label: "Refactor / clean up" },
  { id: "Improve performance", label: "Improve performance" },
  { id: "Anything useful", label: "Anything useful" },
];

const LEVEL_ORDER: SkillLevel[] = ["learning", "familiar", "strong"];
const LEVEL_LABEL: Record<SkillLevel, string> = {
  learning: "LEARNING",
  familiar: "FAMILIAR",
  strong: "STRONG",
};
const LEVEL_COLOR: Record<SkillLevel, string> = {
  learning: "var(--color-ember-muted)",
  familiar: "var(--color-ember-amber)",
  strong: "var(--color-ember-orange)",
};
const LEVEL_BORDER: Record<SkillLevel, string> = {
  learning: "rgba(255,180,0,0.25)",
  familiar: "var(--color-ember-amber)",
  strong: "var(--color-ember-orange)",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAvailableFrameworks(langIds: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const id of langIds) {
    for (const fw of LANG_FRAMEWORKS[id] ?? []) {
      if (!seen.has(fw)) {
        seen.add(fw);
        result.push(fw);
      }
    }
  }
  return result;
}

function buildEmptyProfile(): SkillProfile {
  return { experience: "first-timer", languages: [], frameworks: [], domains: [], goals: [] };
}

function loadInitialProfile(): SkillProfile {
  return storage.getSkillProfile() ?? buildEmptyProfile();
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StepHeader({ step, total, title }: { step: number; total: number; title: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 3,
              flex: 1,
              borderRadius: 2,
              background: i < step
                ? "var(--color-ember-amber)"
                : i === step - 1
                  ? "var(--color-ember-orange)"
                  : "var(--color-ember-ash)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ color: "var(--color-ember-amber)", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {title}
        </span>
        <span style={{ color: "var(--color-ember-dim)", fontSize: 11, letterSpacing: "0.05em" }}>
          {step} / {total}
        </span>
      </div>
    </div>
  );
}

function Chip({
  label,
  selected,
  level,
  onClick,
}: {
  label: string;
  selected: boolean;
  level?: SkillLevel;
  onClick: () => void;
}) {
  const color = selected && level ? LEVEL_COLOR[level] : selected ? "var(--color-ember-amber)" : "var(--color-ember-dim)";
  const border = selected && level ? LEVEL_BORDER[level] : selected ? "var(--color-ember-amber)" : "var(--color-ember-ash)";
  const bg = selected ? "rgba(255,140,0,0.07)" : "transparent";

  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 11px",
        borderRadius: 4,
        border: `1px solid ${border}`,
        background: bg,
        color,
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.04em",
        cursor: "pointer",
        transition: "all 0.15s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        minWidth: selected && level ? 74 : undefined,
      }}
    >
      <span>{label}</span>
      {selected && level && (
        <span style={{ fontSize: 9, opacity: 0.85, letterSpacing: "0.08em" }}>
          {LEVEL_LABEL[level]}
        </span>
      )}
    </button>
  );
}

function ToggleChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 11px",
        borderRadius: 4,
        border: `1px solid ${selected ? "var(--color-ember-amber)" : "var(--color-ember-ash)"}`,
        background: selected ? "rgba(255,140,0,0.07)" : "transparent",
        color: selected ? "var(--color-ember-amber)" : "var(--color-ember-dim)",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.04em",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface SkillsModalProps {
  onClose: () => void;
  onSaved?: () => void;
}

export function SkillsModal({ onClose, onSaved }: SkillsModalProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<SkillProfile>(loadInitialProfile);

  const TOTAL_STEPS = 5;

  // ── Step 1 helpers ──
  function setExperience(exp: SkillProfile["experience"]) {
    setProfile((p) => ({ ...p, experience: exp }));
  }

  // ── Step 2: language cycling ──
  function toggleLanguage(lang: { id: string; name: string }) {
    setProfile((p) => {
      const existing = p.languages.find((l) => l.id === lang.id);
      if (!existing) {
        return { ...p, languages: [...p.languages, { id: lang.id, name: lang.name, level: "familiar" }] };
      }
      const currentIdx = LEVEL_ORDER.indexOf(existing.level);
      if (currentIdx === LEVEL_ORDER.length - 1) {
        // remove — also remove frameworks that belong only to this language
        const remaining = p.languages.filter((l) => l.id !== lang.id);
        const availableFw = getAvailableFrameworks(remaining.map((l) => l.id));
        return { ...p, languages: remaining, frameworks: p.frameworks.filter((f) => availableFw.includes(f)) };
      }
      return {
        ...p,
        languages: p.languages.map((l) =>
          l.id === lang.id ? { ...l, level: LEVEL_ORDER[currentIdx + 1] } : l
        ),
      };
    });
  }

  // ── Step 3: framework toggle ──
  function toggleFramework(fw: string) {
    setProfile((p) => ({
      ...p,
      frameworks: p.frameworks.includes(fw) ? p.frameworks.filter((f) => f !== fw) : [...p.frameworks, fw],
    }));
  }

  // ── Step 4: domain toggle ──
  function toggleDomain(d: string) {
    setProfile((p) => ({
      ...p,
      domains: p.domains.includes(d) ? p.domains.filter((x) => x !== d) : [...p.domains, d],
    }));
  }

  // ── Step 5: goal toggle ──
  function toggleGoal(g: string) {
    setProfile((p) => ({
      ...p,
      goals: p.goals.includes(g) ? p.goals.filter((x) => x !== g) : [...p.goals, g],
    }));
  }

  function handleSave() {
    storage.setSkillProfile(profile);
    toast.fire("Skill profile saved. Ready for Skill Match mode.");
    onSaved?.();
    onClose();
  }

  const availableFrameworks = getAvailableFrameworks(profile.languages.map((l) => l.id));

  // ── Render steps ──
  function renderStep() {
    switch (step) {
      case 1:
        return (
          <div>
            <p style={{ color: "var(--color-ember-muted)", fontSize: 12, marginBottom: 14, lineHeight: 1.6 }}>
              How much open source experience do you have?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {([
                { id: "first-timer", label: "First timer", sub: "Never made an open source PR before" },
                { id: "some-prs", label: "Getting started", sub: "Made a few PRs, still finding my feet" },
                { id: "regular", label: "Regular contributor", sub: "Comfortable with the full PR workflow" },
              ] as const).map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setExperience(opt.id)}
                  className={`radio-card ${profile.experience === opt.id ? "is-selected" : ""}`}
                  role="radio"
                  aria-checked={profile.experience === opt.id}
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setExperience(opt.id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="radio-dot"><div className="radio-dot-inner" /></div>
                  <div>
                    <div style={{ color: profile.experience === opt.id ? "var(--color-ember-text)" : "var(--color-ember-muted)", fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                      {opt.label}
                    </div>
                    <div style={{ color: "var(--color-ember-dim)", fontSize: 11, lineHeight: 1.5 }}>
                      {opt.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <p style={{ color: "var(--color-ember-muted)", fontSize: 12, marginBottom: 6, lineHeight: 1.6 }}>
              Click to add · click again to set proficiency · click once more to remove.
            </p>
            <p style={{ color: "var(--color-ember-dim)", fontSize: 11, marginBottom: 14 }}>
              learning → familiar → strong → remove
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {LANGUAGES.map((lang) => {
                const sel = profile.languages.find((l) => l.id === lang.id);
                return (
                  <Chip
                    key={lang.id}
                    label={lang.name}
                    selected={!!sel}
                    level={sel?.level}
                    onClick={() => toggleLanguage(lang)}
                  />
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            {availableFrameworks.length === 0 ? (
              <p style={{ color: "var(--color-ember-dim)", fontSize: 12, lineHeight: 1.7 }}>
                No languages selected yet — go back and pick some first.
              </p>
            ) : (
              <>
                <p style={{ color: "var(--color-ember-muted)", fontSize: 12, marginBottom: 14, lineHeight: 1.6 }}>
                  Which frameworks and tools do you know? Showing options based on your selected languages.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {availableFrameworks.map((fw) => (
                    <ToggleChip
                      key={fw}
                      label={fw}
                      selected={profile.frameworks.includes(fw)}
                      onClick={() => toggleFramework(fw)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        );

      case 4:
        return (
          <div>
            <p style={{ color: "var(--color-ember-muted)", fontSize: 12, marginBottom: 14, lineHeight: 1.6 }}>
              What areas of software do you want to work in?
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {DOMAINS.map((d) => (
                <ToggleChip
                  key={d.id}
                  label={d.label}
                  selected={profile.domains.includes(d.id)}
                  onClick={() => toggleDomain(d.id)}
                />
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <p style={{ color: "var(--color-ember-muted)", fontSize: 12, marginBottom: 14, lineHeight: 1.6 }}>
              What kind of contributions do you want to make?
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {GOALS.map((g) => (
                <ToggleChip
                  key={g.id}
                  label={g.label}
                  selected={profile.goals.includes(g.id)}
                  onClick={() => toggleGoal(g.id)}
                />
              ))}
            </div>

            {/* Summary preview */}
            {profile.languages.length > 0 && (
              <div
                style={{
                  marginTop: 20,
                  padding: "12px 14px",
                  background: "var(--color-ember-elevated)",
                  border: "1px solid var(--color-ember-ash)",
                  borderRadius: 5,
                }}
              >
                <p style={{ color: "var(--color-ember-amber)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8, textTransform: "uppercase" }}>
                  Your Profile
                </p>
                <p style={{ color: "var(--color-ember-muted)", fontSize: 11, lineHeight: 1.7 }}>
                  <strong style={{ color: "var(--color-ember-text)" }}>Languages:</strong>{" "}
                  {profile.languages.map((l) => `${l.name} (${l.level})`).join(", ")}
                </p>
                {profile.frameworks.length > 0 && (
                  <p style={{ color: "var(--color-ember-muted)", fontSize: 11, lineHeight: 1.7 }}>
                    <strong style={{ color: "var(--color-ember-text)" }}>Frameworks:</strong>{" "}
                    {profile.frameworks.join(", ")}
                  </p>
                )}
                {profile.domains.length > 0 && (
                  <p style={{ color: "var(--color-ember-muted)", fontSize: 11, lineHeight: 1.7 }}>
                    <strong style={{ color: "var(--color-ember-text)" }}>Interests:</strong>{" "}
                    {profile.domains.join(", ")}
                  </p>
                )}
              </div>
            )}
          </div>
        );
    }
  }

  const STEP_TITLES = ["Experience", "Languages", "Frameworks", "Domains", "Goals"];

  return (
    <DraggableWindow
      title="SKILL_PROFILE.EXE"
      variant="dark"
      defaultWidth={500}
      onClose={onClose}
      zIndex={50}
      titleAlign="right"
    >
      <div style={{ padding: "20px 22px 22px" }}>
        <StepHeader step={step} total={TOTAL_STEPS} title={STEP_TITLES[step - 1]} />

        <div style={{ minHeight: 200 }}>
          {renderStep()}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          {step > 1 && (
            <button
              className="btn-ghost"
              onClick={() => setStep((s) => s - 1)}
              style={{ flex: 1 }}
            >
              ← Back
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              className="btn-ignite"
              onClick={() => setStep((s) => s + 1)}
              style={{ flex: 2 }}
            >
              Next →
            </button>
          ) : (
            <button
              className="btn-ignite"
              onClick={handleSave}
              style={{ flex: 2 }}
            >
              🔥 Save Profile
            </button>
          )}
        </div>
      </div>
    </DraggableWindow>
  );
}
