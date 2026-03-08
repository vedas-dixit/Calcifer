export type AnalysisMode = "documentation" | "contribution" | "bugs" | "skillmatch";

export type SkillLevel = "learning" | "familiar" | "strong";

export interface SkillLanguage {
  id: string;
  name: string;
  level: SkillLevel;
}

export interface SkillProfile {
  experience: "first-timer" | "some-prs" | "regular";
  languages: SkillLanguage[];
  frameworks: string[];
  domains: string[];
  goals: string[];
}

export type AppPhase =
  | "loading"
  | "setup"
  | "main"
  | "processing"
  | "output"
  | "error";

export interface StepLog {
  id: string;
  message: string;
  sub?: string;
  status: "active" | "complete" | "error";
}

export interface AgentProgress {
  steps: StepLog[];
  currentStep: number;
  totalSteps: number;
  percent: number;
}

export interface RepoMetadata {
  owner: string;
  repo: string;
  description: string | null;
  language: string | null;
  stars: number;
  openIssues: number;
  url: string;
}

export interface AgentResult {
  metadata: RepoMetadata;
  output: string; // final markdown
  mode: AnalysisMode;
}
