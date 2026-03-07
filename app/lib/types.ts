export type AnalysisMode = "documentation" | "contribution" | "bugs";

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
