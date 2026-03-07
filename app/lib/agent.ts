import { parseGitHubUrl, buildRepoContext } from "./github";
import { buildPrompt } from "./prompts";
import { generateAnalysis } from "./gemini";
import { storage } from "./storage";
import type { AnalysisMode, AgentResult, AgentProgress, StepLog } from "./types";

// ---------------------------------------------------------------------------
// Agent options
// ---------------------------------------------------------------------------

export interface AgentOptions {
  url: string;
  mode: AnalysisMode;
  focus: string;
  onProgress: (progress: AgentProgress) => void;
}

// ---------------------------------------------------------------------------
// Step progress helper
// ---------------------------------------------------------------------------

class ProgressTracker {
  private steps: StepLog[] = [];
  private percent = 0;
  private readonly cb: (p: AgentProgress) => void;

  constructor(cb: (p: AgentProgress) => void) {
    this.cb = cb;
  }

  push(id: string, message: string, sub: string | undefined, pct: number) {
    // Mark previous step complete
    if (this.steps.length > 0) {
      const last = this.steps[this.steps.length - 1];
      this.steps[this.steps.length - 1] = { ...last, status: "complete" };
    }
    this.percent = pct;
    const step: StepLog = { id, message, sub, status: "active" };
    this.steps.push(step);
    this.emit();
  }

  error() {
    if (this.steps.length > 0) {
      const last = this.steps[this.steps.length - 1];
      this.steps[this.steps.length - 1] = { ...last, status: "error" };
    }
    this.emit();
  }

  complete() {
    if (this.steps.length > 0) {
      const last = this.steps[this.steps.length - 1];
      this.steps[this.steps.length - 1] = { ...last, status: "complete" };
    }
    this.percent = 100;
    this.emit();
  }

  private emit() {
    this.cb({
      steps: [...this.steps],
      currentStep: this.steps.length - 1,
      totalSteps: this.steps.length,
      percent: this.percent,
    });
  }
}

// ---------------------------------------------------------------------------
// Main agent runner
// ---------------------------------------------------------------------------

export async function runAgent(opts: AgentOptions): Promise<AgentResult> {
  const { url, mode, focus, onProgress } = opts;

  const geminiKey = storage.getApiKey();
  if (!geminiKey) {
    throw new Error("No Gemini API key found. Add one in Settings (⚙).");
  }
  const githubKey = storage.getGithubKey() ?? undefined;

  const tracker = new ProgressTracker(onProgress);

  try {
    // Step 1 — Boot
    tracker.push("boot", "> EMBERCORE.EXE — warming up", "→ Checking mission parameters...", 5);

    // Step 2 — Parse URL
    tracker.push("parse", "> Parsing repository coordinates...", `→ Target: ${url}`, 10);
    const { owner, repo } = parseGitHubUrl(url);

    // Steps 3-5 (+ optionally step 6) — Build repo context
    // buildRepoContext calls onProgress for each sub-step
    const percentMap: Record<string, number> = {
      "> Fetching repository metadata...": 20,
      "> Scanning codebase...": 35,
      "> Reading key files...": 55,
      "> Checking open issues...": 62,
    };

    const context = await buildRepoContext(
      owner,
      repo,
      mode,
      focus,
      githubKey,
      (message, sub) => {
        const id = message.replace(/[^a-z]/gi, "").slice(0, 10).toLowerCase();
        const pct = percentMap[message] ?? tracker["percent"];
        tracker.push(id, message, sub, pct);
      }
    );

    // Step N — AI analysis
    tracker.push(
      "ai",
      "> Consulting the AI oracle...",
      "→ Asking Gemini to illuminate this codebase...",
      68
    );

    const prompt = buildPrompt(mode, context, focus);
    const output = await generateAnalysis(prompt, geminiKey);

    // Final step — Done
    tracker.push(
      "done",
      "> Mission complete.",
      `→ Report ready for ${owner}/${repo}`,
      100
    );
    tracker.complete();

    return {
      metadata: context.metadata,
      output,
      mode,
    };
  } catch (err) {
    tracker.error();
    throw err;
  }
}
