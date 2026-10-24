// Prompts for the Codex agents. The contract is the requirement text plus the Kane tests, verbatim.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Feature } from "./features.ts";
import type { MemberResult } from "./kane.ts";

// The "## <heading>" section of a markdown file whose heading starts with `prefix`.
function section(markdown: string, prefix: string): string {
  const parts = markdown.split(/^(?=## )/m);
  return parts.find((p) => p.startsWith(`## ${prefix}`))?.trim() ?? "";
}

function requirementsFor(repoDir: string, feature: Feature): string {
  const prd = readFileSync(join(repoDir, "demo-app/requirements/potluck.md"), "utf8");
  const decisions = readFileSync(join(repoDir, "demo-app/requirements/decisions.md"), "utf8");
  const featureHeading = feature.id === "feat-a" ? "Feature A" : "Feature B";
  const decisionHeading = feature.id === "feat-a" ? "An RSVP needs a choice" : "__none__";
  return [section(prd, featureHeading), section(decisions, decisionHeading)].filter(Boolean).join("\n\n");
}

function testsBlock(repoDir: string, testFiles: string[]): string {
  return testFiles
    .map((f) => `--- ${f.split("/").pop()} ---\n${readFileSync(join(repoDir, f), "utf8").trim()}`)
    .join("\n\n");
}

export function initialPrompt(repoDir: string, feature: Feature, featureTests: string[], coreTests: string[]): string {
  return `You are implementing one feature of Potluck Planner, a small web app in ./demo-app
(Node, no dependencies: server.js routes, store.js in-memory data, views.js HTML, public/style.css).

FEATURE: ${feature.title}

REQUIREMENTS (the spec you must satisfy exactly, including the exact error texts):
${requirementsFor(repoDir, feature)}

YOUR CONTRACT: when you are done, an automated browser agent (Kane) runs the tests below against the app
in a real Chrome. The work is accepted only when every one of these tests passes, AND the existing
"create event" tests still pass. {{start_url}} is the app's base URL.

${testsBlock(repoDir, featureTests)}

EXISTING BEHAVIOUR YOU MUST NOT BREAK (create-event tests):
${coreTests.map((f) => `- ${f.split("/").pop()}`).join("\n")}

RULES
- Change only files inside ./demo-app (server.js, store.js, views.js, public/style.css, or new files there).
- Do NOT edit anything under ./demo-app/.testmuai, ./demo-app/requirements or ./demo-app/contracts.json.
- No npm dependencies. Plain HTML forms with POST + redirect are fine; keep it server-rendered.
- Put the feature on the event page (/events/:id). Use visible text and labels that match the spec wording,
  so a browser agent reading the page can find and verify them.
- Do NOT run kane-cli, Playwright or any browser yourself: the orchestrator runs the Kane contract after
  you finish (a browser can't start inside your sandbox anyway). Don't leave scratch files in the repo.
- Check your work: start the app with \`PORT=${feature.port + 800} node demo-app/server.js\` and exercise it with curl
  (create an event via POST /events with title, a future date and host, then use your feature).
  Stop the server when done.
- Finish with a short summary of what you changed.`;
}

// The integration branch carries both features: the resolver/fixer must keep both contracts.
export function integrationPrompt(
  repoDir: string,
  features: Feature[],
  contracts: Record<string, string[]>,
  coreTests: string[],
  task: string,
): string {
  const blocks = features
    .map((f) => `### ${f.title}\n\n${requirementsFor(repoDir, f)}\n\nTests:\n${testsBlock(repoDir, contracts[f.useCase])}`)
    .join("\n\n");
  return `You are the integrator for Potluck Planner, a small web app in ./demo-app
(Node, no dependencies: server.js routes, store.js in-memory data, views.js HTML, public/style.css).
Two features were built separately by two agents and have now been merged into this branch.

${task}

BOTH FEATURES MUST KEEP WORKING. Their requirements and the Kane browser tests that must pass:

${blocks}

EXISTING BEHAVIOUR YOU MUST NOT BREAK (create-event tests):
${coreTests.map((f) => `- ${f.split("/").pop()}`).join("\n")}

RULES
- Change only files inside ./demo-app (server.js, store.js, views.js, public/style.css, or new files there).
- Do NOT edit anything under ./demo-app/.testmuai, ./demo-app/requirements or ./demo-app/contracts.json.
- No npm dependencies. Keep both features on the event page (/events/:id).
- Do NOT run kane-cli, Playwright or any browser yourself: the orchestrator runs the Kane contract after
  you finish (a browser can't start inside your sandbox anyway). Don't leave scratch files in the repo.
- Check your work: start the app with \`PORT=4903 node demo-app/server.js\`, exercise both features with curl,
  and stop the server when done.
- Finish with a short summary of what you changed.`;
}

export function retryPrompt(failures: MemberResult[], attempt: number): string {
  const lines = failures.map((m) => {
    const name = m.path.split("/").pop()?.replace("_test.md", "");
    const step = m.failure?.step_index != null ? ` (step ${m.failure.step_index})` : "";
    return `- ${name}${step}: ${m.failure?.message?.trim().slice(0, 600) ?? m.status}`;
  });
  return `Kane ran the contract tests against your implementation (attempt ${attempt - 1}) and these failed:

${lines.join("\n")}

Read each failure as a report from a user driving a real browser: fix the app so these flows behave exactly as
the requirements and tests say. Keep everything that already passes working. Same rules as before.
Finish with a short summary of what you changed.`;
}
