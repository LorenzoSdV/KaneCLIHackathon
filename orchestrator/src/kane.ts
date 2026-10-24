// Single entry point for every kane-cli invocation the orchestrator makes.
// Spawns kane-cli, parses its NDJSON stdout line by line, mirrors every event
// into .contract/events.jsonl (the dashboard's feed), and returns typed results.
import { spawn } from "node:child_process";
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const EVENTS_LOG = join(ROOT, ".contract", "events.jsonl");

// Identifies which tool launched the run in Kane's usage analytics; no effect on behavior.
const USER_AGENT = "spec-contract";

export type KaneEvent = Record<string, any>;

export interface KaneResult {
  exitCode: number;
  events: KaneEvent[];
  stderr: string;
}

export interface StepFailure {
  step: number;
  remark: string;
}

export interface RunResult extends KaneResult {
  status: "passed" | "failed" | "error";
  oneLiner: string;
  summary: string;
  durationS: number | null;
  stepsDone: number;
  failures: StepFailure[];
  finalState: Record<string, unknown>;
  sessionDir: string | null;
}

export interface MemberResult {
  path: string;
  status: string;
  durationS: number | null;
  logPath: string | null;
  failure: { message: string; step_index?: number } | null;
}

export interface TestrunResult extends KaneResult {
  status: "passed" | "failed" | "cancelled" | "refused" | "invalid" | "error";
  members: MemberResult[];
  totals: Record<string, number> | null;
  planFailures: { path: string; failure: string }[];
  unresolved: KaneEvent[];
}

export interface KaneOptions {
  cwd?: string;
  // Label stored with every mirrored event, e.g. "feat-a" or "integration".
  tag: string;
  env?: Record<string, string>;
  timeoutMs?: number;
  onEvent?: (event: KaneEvent) => void;
}

export function logEvent(tag: string, event: KaneEvent) {
  mkdirSync(dirname(EVENTS_LOG), { recursive: true });
  appendFileSync(EVENTS_LOG, JSON.stringify({ tag, at: new Date().toISOString(), ...event }) + "\n");
}

export function kane(args: string[], opts: KaneOptions): Promise<KaneResult> {
  return new Promise((resolve, reject) => {
    // stdin is /dev/null ("ignore"): testrun only emits NDJSON when stdin is not a TTY.
    const child = spawn("kane-cli", args, {
      cwd: opts.cwd ?? ROOT,
      env: { ...process.env, KANE_CLI_USER_AGENT: USER_AGENT, ...opts.env },
      stdio: ["ignore", "pipe", "pipe"],
    });

    const events: KaneEvent[] = [];
    let stderr = "";
    let buffer = "";

    const handleLine = (line: string) => {
      const trimmed = line.trim();
      if (!trimmed.startsWith("{")) return;
      let event: KaneEvent;
      try {
        event = JSON.parse(trimmed);
      } catch {
        return;
      }
      events.push(event);
      logEvent(opts.tag, event);
      opts.onEvent?.(event);
    };

    child.stdout.on("data", (chunk) => {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      lines.forEach(handleLine);
    });
    child.stderr.on("data", (chunk) => (stderr += chunk));

    const timer = opts.timeoutMs ? setTimeout(() => child.kill("SIGTERM"), opts.timeoutMs) : null;

    child.on("error", reject);
    child.on("close", (code) => {
      if (timer) clearTimeout(timer);
      if (buffer) handleLine(buffer);
      resolve({ exitCode: code ?? 3, events, stderr });
    });
  });
}

// One-shot objective: `kane-cli run "<objective>" --agent`.
export async function runObjective(
  objective: string,
  opts: KaneOptions & { headless?: boolean; maxSteps?: number; timeoutS?: number },
): Promise<RunResult> {
  const args = ["run", objective, "--agent"];
  if (opts.headless) args.push("--headless");
  if (opts.maxSteps) args.push("--max-steps", String(opts.maxSteps));
  if (opts.timeoutS) args.push("--timeout", String(opts.timeoutS));

  const result = await kane(args, opts);
  const end = result.events.find((e) => e.type === "run_end");
  const steps = result.events.filter((e) => !e.type && typeof e.step === "number");

  return {
    ...result,
    status: end ? (end.status === "passed" ? "passed" : "failed") : "error",
    oneLiner: end?.one_liner ?? "",
    summary: end?.summary ?? "",
    durationS: typeof end?.duration === "number" ? end.duration : null,
    stepsDone: steps.filter((e) => e.status === "done" || e.status === "failed").length,
    failures: steps.filter((e) => e.status === "failed").map((e) => ({ step: e.step, remark: e.remark })),
    finalState: end?.final_state ?? {},
    sessionDir: end?.session_dir ?? null,
  };
}

// Batch of saved tests: `kane-cli testrun run <paths> --parallel N`.
export async function runSuite(
  paths: string[],
  opts: KaneOptions & { parallel?: number; headless?: boolean; dryRun?: boolean; name?: string },
): Promise<TestrunResult> {
  const args = ["testrun", "run", ...paths, "--agent", "--parallel", String(opts.parallel ?? 1)];
  if (opts.headless) args.push("--headless");
  if (opts.dryRun) args.push("--dry-run");
  if (opts.name) args.push("--name", opts.name);

  const result = await kane(args, opts);
  const plan = result.events.find((e) => e.type === "testrun_plan");
  const done = result.events.find((e) => e.type === "testrun_done");
  const summary = result.events.find((e) => e.type === "testrun_summary");
  const memberEnds = result.events.filter(
    (e) => e.type === "testrun_member_end" || e.type === "testrun_authored_member_end",
  );

  let status: TestrunResult["status"];
  if (done) status = done.overall_status;
  else if (plan && plan.valid === false) status = "invalid";
  else if (opts.dryRun && plan) status = "passed";
  else status = "error";

  return {
    ...result,
    status,
    members: memberEnds.map((e) => ({
      path: e.path,
      status: e.status,
      durationS: e.duration_s ?? null,
      logPath: e.log_path ?? null,
      failure: e.failure ?? null,
    })),
    totals: summary?.totals ?? null,
    planFailures: (plan?.members ?? [])
      .filter((m: KaneEvent) => m.failure)
      .map((m: KaneEvent) => ({ path: m.path, failure: m.failure })),
    unresolved: result.events.filter((e) => e.type === "warning" && e.code === "unresolved_variables"),
  };
}
