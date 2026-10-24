// Merges every feature branch into a fresh `integration` branch (wt/integration), resolves conflicts,
// then runs the FULL contract (all use cases) and loops a Codex fixer until it passes.
// main is never touched: the last line prints the command to merge integration into main yourself.
//   node orchestrator/src/merge.ts [--attempts N] [--parallel N] [--watch]
import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { parseArgs } from "node:util";
import { startApp } from "./app.ts";
import { runCodex } from "./codex.ts";
import { APP_DIR, CORE_USE_CASE, FEATURES, INTEGRATION, loadContracts, setStartUrl } from "./features.ts";
import { commitWork, restoreProtected } from "./gate.ts";
import { EVENTS_LOG, logEvent, runSuite, type MemberResult } from "./kane.ts";
import { integrationPrompt, retryPrompt } from "./prompts.ts";
import { ensureWorktree, git, removeWorktree } from "./worktrees.ts";

const { values } = parseArgs({
  options: {
    attempts: { type: "string", default: "4" },
    parallel: { type: "string", default: "4" },
    watch: { type: "boolean", default: false },
  },
});

const tag = INTEGRATION.id;
const RECORDINGS = `${APP_DIR}/.testmuai/tests/output-`;

// A feature may only be merged if its latest contract result passed: the end of its gate, or a later
// Kane-only re-check (npm run suite -- --app wt/<feature>) after its contract was fixed.
function latestContractResult(featureId: string): string {
  if (!existsSync(EVENTS_LOG)) return "never run";
  let latest = "never run";
  for (const line of readFileSync(EVENTS_LOG, "utf8").split("\n")) {
    if (!line.includes(`"tag":"${featureId}"`)) continue;
    const e = JSON.parse(line);
    if (e.type === "gate_end" || e.type === "contract_recheck_end") latest = e.status;
  }
  return latest;
}

const unpassed = FEATURES.map((f) => ({ id: f.id, result: latestContractResult(f.id) })).filter((r) => r.result !== "passed");
if (unpassed.length) {
  logEvent(tag, { source: "merge", type: "merge_refused", features: unpassed });
  for (const r of unpassed) console.log(`⛔ ${r.id}: latest contract result is "${r.result}", not merging.`);
  console.log(`Fix it with npm run build -- ${unpassed[0].id}, or re-check with npm run suite -- --app wt/${unpassed[0].id}.`);
  process.exit(1);
}

// Fresh integration branch from main on every run.
removeWorktree(INTEGRATION.id, { deleteBranch: true, branch: INTEGRATION.branch });
const dir = ensureWorktree(INTEGRATION.id, INTEGRATION.branch, "main");
const contracts = loadContracts(dir);
const coreTests = contracts[CORE_USE_CASE];
const allTests = Object.values(contracts).flat();
logEvent(tag, { source: "orchestrator", type: "worktree_ready", dir, branch: INTEGRATION.branch, port: INTEGRATION.port });

function conflictedFiles(): string[] {
  const out = git(["diff", "--name-only", "--diff-filter=U"], dir);
  return out ? out.split("\n") : [];
}

// Files that still contain merge conflict markers (git grep exits 1 when there are none).
function filesWithMarkers(files: string[]): string {
  try {
    return git(["grep", "-l", "-E", "^(<<<<<<<|>>>>>>>)", "--", ...files], dir);
  } catch {
    return "";
  }
}

// output-<stem>/... belongs to <stem>_test.md
function testOfRecording(file: string): string {
  const stem = file.slice(RECORDINGS.length).split("/")[0];
  return `${APP_DIR}/.testmuai/tests/${stem}_test.md`;
}

let threadId: string | null = null;

// 1. Merge each feature branch.
for (const feature of FEATURES) {
  logEvent(tag, { source: "merge", type: "merge_start", branch: feature.branch });
  try {
    git(["merge", "--no-ff", "--no-edit", "-m", `Merge ${feature.branch} (${feature.title}) into integration`, feature.branch], dir);
    logEvent(tag, { source: "merge", type: "merge_end", branch: feature.branch, conflicts: [] });
    continue;
  } catch {
    // conflicts: handled below
  }

  const conflicts = conflictedFiles();
  const owned = new Set(contracts[feature.useCase]);
  const recordingConflicts = conflicts.filter((f) => f.startsWith(RECORDINGS));
  const codeConflicts = conflicts.filter((f) => !f.startsWith(RECORDINGS));

  // Kane recordings: both sides are valid recordings. A feature's own tests take that feature's
  // (passing) recording; every other test keeps the integration side (main + earlier merges).
  for (const f of recordingConflicts) {
    git(["checkout", owned.has(testOfRecording(f)) ? "--theirs" : "--ours", "--", f], dir);
    git(["add", "--", f], dir);
  }
  logEvent(tag, { source: "merge", type: "merge_conflicts", branch: feature.branch, recordings: recordingConflicts.length, code: codeConflicts });

  if (codeConflicts.length) {
    const task = `TASK: \`git merge ${feature.branch}\` left conflict markers in: ${codeConflicts.join(", ")}.
Resolve every conflict so that BOTH features work together (keep all of both sides' behaviour; do not drop either
feature). Remove every conflict marker (<<<<<<<, =======, >>>>>>>). Do not run git commands; just edit the files.`;
    const codex = await runCodex(integrationPrompt(dir, FEATURES, contracts, coreTests, task), {
      cwd: dir,
      tag,
      resumeThreadId: threadId,
      timeoutMs: 20 * 60_000,
    });
    threadId = codex.threadId;
    const markers = filesWithMarkers(codeConflicts);
    if (codex.exitCode !== 0 || markers) {
      logEvent(tag, { source: "merge", type: "merge_blocked", branch: feature.branch, reason: codex.exitCode !== 0 ? "codex_failed" : "markers_left", markers });
      console.log(`⛔ merge of ${feature.branch} blocked: conflicts not resolved (${codeConflicts.join(", ")})`);
      process.exit(1);
    }
  }

  restoreProtected(dir, tag);
  commitWork(dir, `Merge ${feature.branch} (${feature.title}) into integration`);
  logEvent(tag, { source: "merge", type: "merge_end", branch: feature.branch, conflicts });
}

// 2. Full contract on the merged app, with a Codex fixer loop.
const maxAttempts = Number(values.attempts);
let failures: MemberResult[] = [];
let status: "passed" | "blocked" = "blocked";

for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  logEvent(tag, { source: "gate", type: "gate_attempt_start", attempt, maxAttempts });

  if (attempt > 1) {
    const task = `TASK: the merged app fails some contract tests. Fix the app so every test passes.\n\n${retryPrompt(failures, attempt)}`;
    const codex = await runCodex(integrationPrompt(dir, FEATURES, contracts, coreTests, task), {
      cwd: dir,
      tag,
      resumeThreadId: threadId,
      timeoutMs: 20 * 60_000,
    });
    threadId = codex.threadId;
    if (codex.exitCode !== 0) break;
    restoreProtected(dir, tag);
    commitWork(dir, `integration: fix after merge (attempt ${attempt})\n\n${codex.lastMessage.slice(0, 2000)}`);
  }

  const app = await startApp(dir, INTEGRATION.port);
  setStartUrl(dir, app.url);
  let suite;
  try {
    suite = await runSuite(
      allTests.map((f) => f.replace(`${APP_DIR}/`, "")),
      { cwd: join(dir, APP_DIR), tag, parallel: Number(values.parallel), headless: !values.watch, name: `integration-attempt-${attempt}` },
    );
  } finally {
    app.stop();
  }
  commitWork(dir, `integration: Kane recordings (attempt ${attempt})`);

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
  for (const m of suite.members) console.log(`  ${m.status === "passed" ? "✅" : "❌"} ${basename(m.path).replace("_test.md", "")}`);

  if (suite.status === "passed") {
    status = "passed";
    break;
  }
  if (!suite.members.length) break; // Kane refused or errored: Codex can't fix that
}

logEvent(tag, { source: "gate", type: "gate_end", status });
if (status === "passed") {
  console.log(`\n✅ integration: all ${allTests.length} contract tests pass on the merged app.`);
  console.log(`To land it on main yourself:  git merge --no-ff integration`);
} else {
  console.log(`\n⛔ integration: blocked (${failures.length} failing). Branch \`integration\` is kept for inspection.`);
  process.exitCode = 1;
}
