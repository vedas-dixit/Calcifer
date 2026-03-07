import type { AnalysisMode } from "./types";
import type { RepoContext } from "./github";

// ---------------------------------------------------------------------------
// Shared context block builder
// ---------------------------------------------------------------------------

function buildContextBlock(ctx: RepoContext, focus: string): string {
  const { metadata, treeStr, files } = ctx;

  const meta = [
    `Repository: ${metadata.owner}/${metadata.repo}`,
    metadata.description ? `Description: ${metadata.description}` : null,
    metadata.language ? `Primary language: ${metadata.language}` : null,
    `Stars: ${metadata.stars.toLocaleString()}`,
    `Open issues: ${metadata.openIssues.toLocaleString()}`,
    `URL: ${metadata.url}`,
    focus ? `User focus area: ${focus}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const fileBlocks = files
    .map((f) => {
      const ext = f.path.split(".").pop() ?? "";
      return `### ${f.path}\n\`\`\`${ext}\n${f.content}\n\`\`\``;
    })
    .join("\n\n");

  return `## Repository Info\n${meta}\n\n## File Structure\n\`\`\`\n${treeStr}\n\`\`\`\n\n## Key Source Files\n\n${fileBlocks}`;
}

// ---------------------------------------------------------------------------
// Documentation prompt
// ---------------------------------------------------------------------------

function buildDocumentationPrompt(ctx: RepoContext, focus: string): string {
  const { metadata } = ctx;

  return `You are EMBERCORE, an expert software architect. Your job is to generate a comprehensive architecture and documentation guide for an open source repository so that a developer who has never seen this codebase can fully understand it and get productive fast.

${buildContextBlock(ctx, focus)}

---

## Your Task

Generate a thorough, well-structured documentation guide in Markdown. Cover every section below. Be specific — reference actual file names, directories, and code patterns from what I gave you above. Don't make things up; only document what you can see in the files.

${focus ? `> Pay special attention to: **${focus}**\n` : ""}

### Required Sections

**1. What This Project Does**
One paragraph — what problem does this solve, who uses it, what does it output. Plain English, no buzzwords.

**2. Tech Stack**
A markdown table with columns: Layer | Technology | Purpose. Include language, framework, build tool, test runner, etc.

**3. Repository Structure**
Walk through the most important directories and files. Explain what lives where and why. Use the file tree I gave you.

**4. Architecture Overview**
How does the system fit together? Data flow, key abstractions, component relationships. A diagram in ASCII or mermaid if it helps.

**5. Entry Points**
Where does execution start? List the 3-5 most important files with a one-line description of each.

**6. Core Concepts & Patterns**
What patterns, conventions, or abstractions does this codebase use? (e.g., hooks, middleware chains, event emitters, etc.)

**7. How to Run Locally**
Step-by-step commands to clone, install, and run. Include how to run tests. Copy-pasteable.

**8. Configuration**
What env vars or config files need to be set up? What do the key config options do?

**9. Glossary** (if the project has domain-specific terms)
Define any project-specific terms, file naming conventions, or jargon.

---

Write in a professional but accessible tone. Be specific. Cite file paths where relevant. Format everything cleanly in Markdown.`;
}

// ---------------------------------------------------------------------------
// Contribution guide prompt (noobie-first)
// ---------------------------------------------------------------------------

function buildContributionPrompt(ctx: RepoContext, focus: string): string {
  const { metadata, goodFirstIssues } = ctx;

  const issuesList =
    goodFirstIssues.length > 0
      ? goodFirstIssues
          .map((i) => `- **#${i.number}**: ${i.title} — ${i.url}`)
          .join("\n")
      : "No labeled 'good first issue' issues found. Suggest logical starting points based on the code.";

  return `You are EMBERCORE, a welcoming senior open source maintainer. Your job is to write a contribution guide for ${metadata.owner}/${metadata.repo} aimed at someone who may have NEVER contributed to open source before.

Assume this reader:
- Knows how to code but has never opened a PR on someone else's project
- Is intimidated by large codebases and doesn't know where to start
- Has maybe used git for their own projects but not collaboratively
- Wants to contribute but has no idea what's approachable

Your guide should make them feel capable, not overwhelmed. Be warm, specific, and honest.

${buildContextBlock(ctx, focus)}

### Open Issues Tagged "good first issue"
${issuesList}

---

## Your Task

Write a complete, beginner-friendly contribution guide in Markdown. Cover every section below. Be **specific** — reference actual file names, directories, and commands from what I gave you. Do not write generic advice; everything should be specific to THIS repository.

${focus ? `> Pay special attention to: **${focus}**\n` : ""}

### Required Sections

**1. What This Project Actually Does (The 60-Second Version)**
Explain what the software does as if talking to a smart non-engineer. What pain does it solve? Who uses it? What does output look like?

**2. Before You Start: Prerequisites**
What do they need installed? What accounts? What knowledge? Be honest about the learning curve.

**3. Getting It Running Locally**
Step-by-step commands. Include what success looks like at each step (expected terminal output or behavior). If something commonly goes wrong, mention it.

**4. How the Codebase Is Organized**
Walk through the key directories and files. Use the tree I gave you. Explain what goes where in plain English. Point out the files a new contributor should read first vs. files they can ignore for now.

**5. Your First Contribution: Where to Start**
Point to 2-3 specific files that are the best entry points for a first change. Explain why they're good starting points. What's approachable and what isn't yet.

**6. Good First Issues**
Based on the issues list above, pick the top 3 most approachable and explain WHY they're good first issues and roughly what files would need to change. If no issues are labeled, suggest 3 concrete types of contributions that fit this codebase (docs, tests, small features, bug fixes).

**7. How to Make a Change**
The full workflow: branch naming, making the change, running tests/linting, writing a commit message, opening a PR, what to write in the PR description. Specific to how THIS project works.

**8. What Reviewers Look For**
Based on the codebase patterns, what does a good PR for this project look like? Code style, test coverage, docs?

**9. Common Mistakes to Avoid**
3-5 gotchas that are specific to this codebase. Things a newcomer might do that would get their PR rejected or slow it down.

**10. Getting Help**
Where to ask questions? How to ask a good question? How to avoid going silent for weeks.

---

Tone: Friendly, encouraging, direct. Write like a senior who genuinely wants to help someone succeed, not a corporate wiki. Use "you" and "your PR" and "your branch". Keep jargon to a minimum and explain it when you use it.`;
}

// ---------------------------------------------------------------------------
// Bug hunt prompt
// ---------------------------------------------------------------------------

function buildBugHuntPrompt(ctx: RepoContext, focus: string): string {
  const { metadata } = ctx;

  return `You are EMBERCORE, a senior security-conscious engineer doing a thorough code review of ${metadata.owner}/${metadata.repo}. Your job is to identify real, concrete potential bugs, vulnerabilities, and code quality issues — not generic advice.

Only flag issues you can actually see evidence of in the files provided. Do not speculate about things you can't see. Reference actual file paths and code patterns.

${buildContextBlock(ctx, focus)}

---

## Your Task

Produce a structured bug hunt report in Markdown. Be specific and actionable.

${focus ? `> Focus especially on: **${focus}**\n` : ""}

### Report Structure

**Executive Summary**
2-3 sentences: what's the overall health of this codebase? What's the most important area of concern?

**Findings**

For each finding, use this format:

---
**[SEVERITY] Title**
- **File:** \`path/to/file.ts\`
- **Issue:** What the problem is and why it matters
- **Evidence:** Quote or describe the specific code pattern you see
- **Fix:** Concrete suggestion for how to address it
---

Severity levels: 🔴 HIGH | 🟡 MEDIUM | 🟢 LOW | 🔵 INFO

Organize findings into these categories (include only categories with actual findings):

**Security Issues**
Input validation gaps, injection risks, auth flaws, insecure data handling, exposed secrets in code, dependency issues.

**Logic Bugs**
Race conditions, off-by-one errors, missing edge case handling, incorrect assumptions about data, null/undefined handling.

**Error Handling**
Swallowed exceptions, missing error boundaries, unhandled promise rejections, non-informative error messages, fail-open vs fail-closed decisions.

**Performance Concerns**
N+1 queries, unnecessary re-renders, blocking operations, missing memoization, large bundle contributions.

**Code Smells & Maintainability**
Duplicated logic, overly complex functions, dead code, inconsistent patterns, missing types, misleading variable names.

**Missing Tests**
Critical paths with no test coverage based on what you can see.

**Summary Table**
| Severity | Count | Top Priority Fix |
|----------|-------|-----------------|
| 🔴 HIGH  | X     | ...             |
| 🟡 MEDIUM| X     | ...             |
| 🟢 LOW   | X     | ...             |

**Recommended Next Steps**
Top 3 things to fix first, in priority order, with a rationale for why.

---

Be honest. If the code is generally well-written, say so and focus on the real issues. Don't pad the report with generic warnings. Every finding should be traceable back to something you actually saw in the files.`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function buildPrompt(
  mode: AnalysisMode,
  ctx: RepoContext,
  focus: string
): string {
  switch (mode) {
    case "documentation":
      return buildDocumentationPrompt(ctx, focus);
    case "contribution":
      return buildContributionPrompt(ctx, focus);
    case "bugs":
      return buildBugHuntPrompt(ctx, focus);
  }
}
