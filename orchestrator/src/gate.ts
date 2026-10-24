// The contract loop for one feature: Codex implements -> commit -> Kane runs the contract ->
// failures go back to Codex, until every test passes or the attempt budget runs out.
import { join } from "node:path";
import { startApp } from "./app.ts";
import { runCodex } from "./codex.ts";
import { APP_DIR, CORE_USE_CASE, type Contracts, type Feature, setStartUrl } from "./features.ts";
import { logEvent, runSuite, type MemberResult } from "./kane.ts";
import { initialPrompt, retryPrompt } from "./prompts.ts";
import { git } from "./worktrees.ts";

export interface GateResult {
  feature: string;
  status: "passed" | "blocked";
  attempts: number;
}

export interface GateOptions {
  maxAttempts?: number;
  parallel?: number;
  headless?: boolean;
  codexTimeoutMs?: number;
}

// The agent may not edit its own contract: undo any change to tests, requirements or the mapping.
const PROTECTED = [`${APP_DIR}/.testmuai/tests`, `${APP_DIR}/requirements`, `${APP_DIR}/contracts.json`];
// start_url differs per worktree, so it is never committed (it would conflict at merge).
const VARIABLES = `${APP_DIR}/.testmuai/variables`;

// Compares against the index, not HEAD: during a merge the resolved recordings are staged
// and must survive; only the agent's unstaged edits and new files are undone.
export function restoreProtected(dir: string, tag: string) {
  const edited = git(["diff", "--name-only", "--", ...PROTECTED], dir);
  const added = git(["ls-files", "--others", "--exclude-standard", "--", ...PROTECTED], dir);
  const touched = [edited, added].filter(Boolean).join("\n");
  if (!touched) return;
  logEvent(tag, { source: "gate", type: "contract_tamper_reverted", files: touched.split("\n") });
  if (edited) git(["checkout", "--", ...edited.split("\n")], dir);
  if (added) git(["clean", "-fdq", "--", ...added.split("\n")], dir);
}

// Stages only the app folder, so stray files an agent leaves elsewhere in the worktree are never committed.
export function commitWork(dir: string, message: string): boolean {
  git(["add", "-A", "--", APP_DIR, `:!${VARIABLES}`], dir);
  if (!git(["diff", "--cached", "--name-only"], dir)) return false;
  git(["commit", "-m", message], dir);
  return true;
}

export async function runGate(
  feature: Feature,
  dir: string,
  contracts: Contracts,
  opts: GateOptions = {},
): Promise<GateResult> {
  const maxAttempts = opts.maxAttempts ?? 4;
  const featureTests = contracts[feature.useCase];
  const coreTests = contracts[CORE_USE_CASE];
  const tag = feature.id;
  let threadId: string | null = null;
  let failures: MemberResult[] = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    logEvent(tag, { source: "gate", type: "gate_attempt_start", attempt, maxAttempts });

    const prompt = attempt === 1 ? initialPrompt(dir, feature, featureTests, coreTests) : retryPrompt(failures, attempt);
    const codex = await runCodex(prompt, { cwd: dir, tag, resumeThreadId: threadId, timeoutMs: opts.codexTimeoutMs });
    threadId = codex.threadId;
    if (codex.exitCode !== 0) {
      logEvent(tag, { source: "gate", type: "gate_end", status: "blocked", attempts: attempt, reason: "codex_failed" });
      return { feature: feature.id, status: "blocked", attempts: attempt };
    }

    restoreProtected(dir, tag);
    commitWork(dir, `${feature.id}: ${feature.title} (attempt ${attempt})\n\n${codex.lastMessage.slice(0, 2000)}`);

    const app = await startApp(dir, feature.port);
    setStartUrl(dir, app.url);
    let suite;
    try {
      suite = await runSuite(
        [...coreTests, ...featureTests].map((f) => f.replace(`${APP_DIR}/`, "")),
        { cwd: join(dir, APP_DIR), tag, parallel: opts.parallel ?? 3, headless: opts.headless ?? true, name: `${feature.id}-attempt-${attempt}` },
      );
    } finally {
      app.stop();
    }

    // Kane may write recordings for newly authored tests; they belong to the branch.
    commitWork(dir, `${feature.id}: Kane recordings (attempt ${attempt})`);

    failures = suite.members.filter((m) => m.status !== "passed");
    logEvent(tag, {
      source: "gate",
      type: "gate_attempt_end",
      attempt,
      status: suite.status,
      passed: suite.members.length - failures.length,
      total: suite.members.length,
      failed: failures.map((m) => ({ path: m.path, message: m.failure?.message ?? m.status })),
    });

    if (suite.status === "passed") {
      logEvent(tag, { source: "gate", type: "gate_end", status: "passed", attempts: attempt });
      return { feature: feature.id, status: "passed", attempts: attempt };
    }
    if (!suite.members.length) {
      // Nothing ran (plan refused or Kane error): retrying Codex would not help.
      logEvent(tag, { source: "gate", type: "gate_end", status: "blocked", attempts: attempt, reason: `kane_${suite.status}` });
      return { feature: feature.id, status: "blocked", attempts: attempt };
    }
  }

  logEvent(tag, { source: "gate", type: "gate_end", status: "blocked", attempts: maxAttempts, reason: "attempts_exhausted" });
  return { feature: feature.id, status: "blocked", attempts: maxAttempts };
}
