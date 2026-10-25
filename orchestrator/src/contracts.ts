// Turns requirements into Kane contracts with a Codex "contract agent" in the loop.
// Codex drives Kane's assurance commands and answers Kane's questions itself (its reasoning is logged);
// the two approvals stay with a person, and the orchestrator (not Codex) records them.
//
//   npm run contracts -- extract [files...]     Codex ingests requirement files (default: all new ones) -> proposed use cases
//   npm run contracts -- approve <uc-ref...>     you approve use cases
//   npm run contracts -- design [uc-ref...]      Codex designs tests for approved use cases that have none yet
//   npm run contracts -- approve-design          you approve the designed tests; contracts.json is rebuilt
//   npm run contracts -- status                  what is waiting for approval
import { execFileSync, spawn } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { runCodex } from "./codex.ts";
import { APP_DIR, buildContracts, type Feature, INTEGRATION, saveContracts, TESTS_DIR } from "./features.ts";
import { logEvent, ROOT } from "./kane.ts";
import { isMerged } from "./worktrees.ts";

const TAG = "contracts";
const APP = join(ROOT, APP_DIR);
const OUT = join(ROOT, ".contract", "contract-agent");
mkdirSync(OUT, { recursive: true });

type Node = { id: string; label: string; title: string; trust: string; fresh: string };

function kane(args: string[]): string {
  return execFileSync("kane-cli", args, {
    cwd: APP,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, KANE_CLI_USER_AGENT: "spec-contract" },
  });
}

function list(...flags: string[]): Node[] {
  return kane(["context", "list", "--json", ...flags])
    .split("\n")
    .filter((l) => l.startsWith("{"))
    .map((l) => JSON.parse(l));
}

const answerSchema = {
  type: "object",
  additionalProperties: false,
  required: ["question", "answer", "reasoning"],
  properties: { question: { type: "string" }, answer: { type: "string" }, reasoning: { type: "string" } },
};

function schemaFile(name: string, properties: Record<string, unknown>): string {
  const file = join(OUT, `${name}.schema.json`);
  const schema = { type: "object", additionalProperties: false, required: Object.keys(properties), properties };
  writeFileSync(file, JSON.stringify(schema, null, 2));
  return file;
}

const RULES = `HOW TO WORK
- Read ~/.agents/skills/kane-cli/SKILL.md, references/assurance.md and references/assurance-parsing.md first,
  and follow them. Prefix every kane-cli command with KANE_CLI_USER_AGENT=spec-contract and run it from ./${APP_DIR}.
- Assurance commands take --mode agent and end their stream with a "done" event. Exit code 3 means PAUSED with
  questions (session_paused), not a failure.
- You answer Kane's questions yourself, from the requirement files in ./${APP_DIR}/requirements. Prefer Kane's
  recommended option unless the requirements clearly say otherwise. Resume with the verbatim resume command plus
  --answer <id>=<option number or text>. Record every question you answered in your final report, with your reasoning.
- NEVER approve or reject anything (no "context review" with --approve, --verdicts, --skip, --allow-archive),
  never pass --allow-unreviewed or --force, never retire/revert/rebuild/delete anything in the store,
  never run browser tests (kane-cli run, testmd run, testrun run), and never edit files under ./${APP_DIR}/.context.
  Approvals belong to a person; the orchestrator asks them after you finish.
- Never run two kane-cli store commands at the same time.
- Don't edit any repository files except the logs you are told to write. Don't leave scratch files.`;

async function contractAgent(phase: string, prompt: string, schema: string) {
  logEvent(TAG, { source: "contracts", type: "contract_agent_start", phase });
  const result = await runCodex(prompt, {
    cwd: ROOT,
    tag: TAG,
    network: true,
    addDirs: [join(homedir(), ".testmuai")],
    outputSchemaFile: schema,
    timeoutMs: 30 * 60_000,
  });
  let report: any = null;
  try {
    report = JSON.parse(result.lastMessage);
  } catch {
    // keep null: shown raw below
  }
  logEvent(TAG, { source: "contracts", type: "contract_agent_end", phase, exitCode: result.exitCode, report });
  if (result.exitCode !== 0) {
    console.log(`⛔ contract agent failed (exit ${result.exitCode}). See .contract/events.jsonl (tag "contracts").`);
    process.exit(1);
  }
  return report ?? { raw: result.lastMessage };
}

function printAnswers(report: any) {
  if (!report?.answers?.length) return;
  console.log("\nKane asked, and the contract agent answered:");
  for (const a of report.answers) console.log(`  ? ${a.question}\n    → ${a.answer}\n      (${a.reasoning})`);
}

async function extract(files: string[]) {
  const sources = list("--type", "source").map((s) => s.id);
  const prompt = `You are the contract agent for Potluck Planner. Turn requirement files into Kane use cases.

TASK: ingest ${files.length ? files.map((f) => `./${APP_DIR}/${f}`).join(", ") : `every file in ./${APP_DIR}/requirements whose source id is not already in Kane's store (already ingested: ${sources.join(", ") || "none"})`}
with \`kane-cli context ingest <files> --mode agent\` (run from ./${APP_DIR}, paths relative to it), handle every pause until
the stream ends with done, and stop. A file that only describes test setup should yield no use cases.

${RULES}

FINAL REPORT: the new use cases waiting for review (id like uc-4, title, one-sentence summary), every question you
answered, and anything a person should know.`;

  const report = await contractAgent("extract", prompt, schemaFile("extract", {
    use_cases: { type: "array", items: { type: "object", additionalProperties: false, required: ["id", "title", "summary"], properties: { id: { type: "string" }, title: { type: "string" }, summary: { type: "string" } } } },
    answers: { type: "array", items: answerSchema },
    notes: { type: "string" },
  }));

  printAnswers(report);
  const waiting = list("--inferred", "--type", "usecase");
  logEvent(TAG, { source: "contracts", type: "contracts_waiting", phase: "use_cases", items: waiting.map((n) => n.id) });
  console.log(`\nUse cases waiting for your approval (${waiting.length}):`);
  for (const uc of waiting) {
    const summary = report?.use_cases?.find((u: any) => u.id === uc.id)?.summary ?? "";
    console.log(`  ${uc.id}  ${uc.title}${summary ? `\n        ${summary}` : ""}`);
  }
  if (report?.notes) console.log(`\nAgent notes: ${report.notes}`);
  if (waiting.length) console.log(`\nApprove with:  npm run contracts -- approve ${waiting.map((n) => n.id).join(" ")}`);
}

function approve(refs: string[]) {
  if (!refs.length) throw new Error("name the use cases to approve, e.g. approve uc-4 uc-5");
  console.log(kane(["context", "review", "--approve", ...refs]).trim());
  logEvent(TAG, { source: "contracts", type: "contracts_approved", phase: "use_cases", items: refs, by: "human" });
  console.log(`Next:  npm run contracts -- design`);
}

async function design(useCases: string[]) {
  const targets = useCases.length ? useCases : list("--undesigned", "--type", "usecase").filter((u) => u.trust === "trusted").map((u) => u.id);
  if (!targets.length) return console.log("No approved use case is waiting for a design.");

  const prompt = `You are the contract agent for Potluck Planner. Design Kane tests for approved use cases.

TASK: for each of ${targets.join(", ")}, one after another, run
\`kane-cli design tests --use-case <uc> --mode agent --max 6\` from ./${APP_DIR}, handle every pause until the stream ends with done.
Save the COMPLETE stdout of every design command (the first run and every resume) to its own new file
../.contract/design-<uc>.agent-<n>.ndjson (relative to ./${APP_DIR}; n = 1, 2, ... so nothing is overwritten), e.g.
\`... --mode agent --max 6 < /dev/null > ../.contract/design-uc-4.agent-1.ndjson\`. The orchestrator reads these files.
Tests reach the app through the existing {{start_url}} variable; never put a value in a variables file.

${RULES}

FINAL REPORT: per use case, how many tests were designed, the gaps Kane recorded (one line each), any variables that
still need values, and which requirements section it comes from: prd_section is the exact "## " heading text in
./${APP_DIR}/requirements (e.g. "Feature C: Comments") and feature_title a 1-3 word name (e.g. "Comments").
Then every question you answered, and anything a person should know.`;

  const report = await contractAgent("design", prompt, schemaFile("design", {
    designed: { type: "array", items: { type: "object", additionalProperties: false, required: ["use_case", "tests", "gaps", "variables_needing_values", "prd_section", "feature_title"], properties: { use_case: { type: "string" }, tests: { type: "integer" }, gaps: { type: "array", items: { type: "string" } }, variables_needing_values: { type: "array", items: { type: "string" } }, prd_section: { type: "string" }, feature_title: { type: "string" } } } },
    answers: { type: "array", items: answerSchema },
    notes: { type: "string" },
  }));
  writeFileSync(join(OUT, "design-report.json"), JSON.stringify(report, null, 2));

  printAnswers(report);
  status(report);
}

function status(report?: any) {
  const waiting = list("--inferred").filter((n) => n.label !== "gap");
  const tests = waiting.filter((n) => n.label === "test");
  logEvent(TAG, { source: "contracts", type: "contracts_waiting", phase: "design", items: tests.map((t) => t.id) });
  for (const d of report?.designed ?? []) {
    console.log(`\n${d.use_case}: ${d.tests} tests designed${d.gaps.length ? `\n  gaps: ${d.gaps.join("; ")}` : ""}${d.variables_needing_values.length ? `\n  needs values: ${d.variables_needing_values.join(", ")}` : ""}`);
  }
  const usecases = list("--inferred", "--type", "usecase");
  if (usecases.length) console.log(`\nUse cases waiting for approval: ${usecases.map((u) => `${u.id} (${u.title})`).join(", ")}`);
  console.log(`\nTests waiting for your approval (${tests.length}), with ${waiting.length - tests.length} criteria/scenarios:`);
  for (const t of tests) console.log(`  ${t.id}  ${t.title}`);
  if (tests.length) console.log(`\nRead them in ${TESTS_DIR}/, then approve with:  npm run contracts -- approve-design`);
}

function approveDesign() {
  const waiting = list("--inferred").filter((n) => !["gap", "usecase"].includes(n.label));
  if (!waiting.length) return console.log("Nothing designed is waiting for approval.");
  const verdicts = join(OUT, "design-verdicts.json");
  writeFileSync(verdicts, JSON.stringify(waiting.map((n) => ({ ref: n.id, resolution: "approved", reason: "Approved by a person via npm run contracts -- approve-design" }))));
  kane(["context", "review", "--verdicts", verdicts, "--json"]);
  logEvent(TAG, { source: "contracts", type: "contracts_approved", phase: "design", items: waiting.map((n) => n.id), by: "human" });

  // Every approved use case that has tests becomes a contract.
  const useCases = list("--type", "usecase").filter((u) => u.trust === "trusted").map((u) => u.id);
  const contracts = buildContracts(useCases);
  saveContracts(contracts);
  console.log(`Approved ${waiting.length} items. Contracts (${APP_DIR}/contracts.json):`);
  for (const [uc, files] of Object.entries(contracts)) console.log(`  ${uc}: ${files.length} tests`);
  const empty = Object.entries(contracts).filter(([, f]) => !f.length).map(([uc]) => uc);
  if (empty.length) console.log(`  (no design logs found for ${empty.join(", ")}: check .contract/design-<uc>.*.ndjson)`);
  registerFeatures(contracts);
}

// Every newly contracted use case becomes a feature in demo-app/features.json (branch, port, PRD section),
// from the contract agent's design report: no one edits the config by hand.
function registerFeatures(contracts: Record<string, string[]>) {
  const reportFile = join(OUT, "design-report.json");
  if (!existsSync(reportFile)) return;
  const report = JSON.parse(readFileSync(reportFile, "utf8"));
  const configFile = join(APP, "features.json");
  const config = JSON.parse(readFileSync(configFile, "utf8"));
  const known = new Set([config.core.useCase, ...config.features.map((f: Feature) => f.useCase)]);
  const added: Feature[] = [];

  for (const d of report.designed ?? []) {
    if (known.has(d.use_case) || !contracts[d.use_case]?.length) continue;
    const heading: string = d.prd_section.replace(/^#+\s*/, "");
    const prdSection = heading.split(":")[0].trim(); // "Feature C: Comments" -> "Feature C"
    const used = new Set(config.features.map((f: Feature) => f.id));
    const letter = /^Feature\s+([A-Za-z])$/i.exec(prdSection)?.[1].toLowerCase()
      ?? "abcdefghijklmnopqrstuvwxyz".split("").find((l) => !used.has(`feat-${l}`))!;
    const port = Math.max(INTEGRATION.port, ...config.features.map((f: Feature) => f.port)) + 1; // never the integration port
    const feature: Feature = { id: `feat-${letter}`, title: d.feature_title, useCase: d.use_case, branch: `feat/${letter}`, port, prdSection, decisionSections: [] };
    config.features.push(feature);
    added.push(feature);
    known.add(d.use_case);
  }
  if (!added.length) return;
  writeFileSync(configFile, JSON.stringify(config, null, 2) + "\n");
  logEvent(TAG, { source: "contracts", type: "features_registered", features: added.map((f) => ({ id: f.id, title: f.title, useCase: f.useCase })) });
  console.log(`\nRegistered in ${APP_DIR}/features.json:`);
  for (const f of added) console.log(`  ${f.id}  ${f.title} (${f.useCase}) · branch ${f.branch} · port ${f.port}`);
  console.log(`\nNext:  npm run build -- ${added.map((f) => f.id).join(" ")}`);
}

// The whole round in your own terminal: Codex does the work, and you are asked directly at every checkpoint.
async function round(files: string[]) {
  if (!process.stdin.isTTY) {
    console.log("npm run round asks you questions at each checkpoint: run it in your own terminal.");
    process.exit(1);
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = async (q: string) => /^y(es)?$/i.test((await rl.question(`\n${q} [y/N] `)).trim());
  const run = (args: string[]) =>
    new Promise<number>((done) => spawn("npm", ["run", "--silent", ...args], { cwd: ROOT, stdio: "inherit" }).on("close", (c) => done(c ?? 1)));

  try {
    let waiting = list("--inferred", "--type", "usecase");
    if (!waiting.length) {
      console.log("Step 1/4 · Codex contract agent: requirements → Kane use cases");
      await extract(files);
      waiting = list("--inferred", "--type", "usecase");
    }
    if (waiting.length) {
      console.log("\nUse cases proposed by the contract agent:");
      for (const uc of waiting) console.log(`  ${uc.id}  ${uc.title}`);
      if (!(await ask(`Approve ${waiting.map((u) => u.id).join(", ")}?`))) return console.log("Stopped. Nothing approved.");
      approve(waiting.map((u) => u.id));
    }

    console.log("\nStep 2/4 · Codex contract agent: approved use cases → Kane tests");
    await design([]);
    const tests = list("--inferred", "--type", "test");
    if (tests.length) {
      if (!(await ask(`Approve these ${tests.length} tests as the new contracts? (read them in ${TESTS_DIR}/)`))) return console.log("Stopped. Tests not approved.");
      approveDesign();
    }

    const pending = loadFeatures().filter((f) => !isMerged(f.branch)).map((f) => f.id);
    if (!pending.length) return console.log("\nNo new features to build.");

    // The agents' worktrees branch from committed main, so the new contracts must be committed first.
    const contractFiles = [`${APP_DIR}/requirements`, `${APP_DIR}/.testmuai/tests`, `${APP_DIR}/contracts.json`, `${APP_DIR}/features.json`];
    const dirty = execFileSync("git", ["status", "--porcelain", "--", ...contractFiles], { cwd: ROOT, encoding: "utf8" }).trim();
    if (dirty) {
      console.log(`\nThe new contracts aren't committed yet (${dirty.split("\n").length} files), and the agents' branches start from main.`);
      if (!(await ask("Commit the requirements, tests, contracts.json and features.json to main now?"))) return console.log("Stopped. Commit them, then: npm run build -- " + pending.join(" "));
      execFileSync("git", ["add", "--", ...contractFiles], { cwd: ROOT });
      execFileSync("git", ["commit", "-m", `Add Kane contracts for ${pending.join(", ")}`, "-m", "Designed by the Codex contract agent from the requirements and approved in npm run round."], { cwd: ROOT, stdio: "inherit" });
    }
    if (!(await ask(`Step 3/4 · Start the Codex feature agents for ${pending.join(", ")} now (in parallel, gated by Kane)?`))) return console.log(`Later: npm run build -- ${pending.join(" ")} --watch`);
    const built = await run(["build", "--", ...pending, "--watch"]);
    if (built !== 0) return console.log("\nA feature is blocked. Look at the dashboard, then rerun or re-check before merging.");

    if (!(await ask("Step 4/4 · All new features passed their contracts. Merge them and run the full suite?"))) return console.log("Later: npm run merge -- --watch");
    await run(["merge", "--", "--watch"]);
  } finally {
    rl.close();
  }
}

// Read fresh: approveDesign() may just have registered new features.
function loadFeatures(): Feature[] {
  return JSON.parse(readFileSync(join(APP, "features.json"), "utf8")).features;
}

const [command, ...args] = process.argv.slice(2);
switch (command) {
  case "round": await round(args); break;
  case "extract": await extract(args); break;
  case "approve": approve(args); break;
  case "design": await design(args); break;
  case "approve-design": approveDesign(); break;
  case "status": status(); break;
  default:
    console.log("usage: npm run contracts -- extract [files...] | approve <uc...> | design [uc...] | approve-design | status");
    process.exitCode = 1;
}
