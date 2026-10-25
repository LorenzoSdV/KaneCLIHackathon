// Runs a Codex agent (`codex exec`) inside one worktree. The sandbox limits writes to that worktree,
// and every JSONL event is mirrored into .contract/events.jsonl under the feature's tag.
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { logEvent, ROOT } from "./kane.ts";

export interface CodexResult {
  exitCode: number;
  threadId: string | null;
  lastMessage: string;
}

export interface CodexOptions {
  cwd: string; // the worktree
  tag: string;
  resumeThreadId?: string | null; // continue the same conversation on retries
  timeoutMs?: number;
  model?: string;
  // Only the contract agent gets these: Kane's design commands need the network and Kane's own folder.
  network?: boolean;
  addDirs?: string[];
  outputSchemaFile?: string; // JSON Schema for the final message
}

// Sandboxed to the worktree, never asks for approval (nobody is there to answer).
const SAFETY = ["-c", 'sandbox_mode="workspace-write"', "-c", 'approval_policy="never"'];

export function runCodex(prompt: string, opts: CodexOptions): Promise<CodexResult> {
  const outDir = join(ROOT, ".contract", "codex");
  mkdirSync(outDir, { recursive: true });
  const lastMessageFile = join(outDir, `${opts.tag}-${Date.now()}.txt`);

  const common = [...SAFETY, "--json", "--skip-git-repo-check", "-o", lastMessageFile];
  if (opts.model) common.push("-m", opts.model);
  if (opts.network) common.push("-c", "sandbox_workspace_write.network_access=true");
  for (const dir of opts.addDirs ?? []) common.push("--add-dir", dir);
  if (opts.outputSchemaFile) common.push("--output-schema", opts.outputSchemaFile);
  const args = opts.resumeThreadId
    ? ["exec", "resume", ...common, opts.resumeThreadId, prompt]
    : ["exec", ...common, "-C", opts.cwd, prompt];

  return new Promise((resolve, reject) => {
    const child = spawn("codex", args, { cwd: opts.cwd, stdio: ["ignore", "pipe", "pipe"] });
    let threadId = opts.resumeThreadId ?? null;
    let buffer = "";
    let stderr = "";

    const handleLine = (line: string) => {
      if (!line.trim().startsWith("{")) return;
      try {
        const event = JSON.parse(line);
        if (event.type === "thread.started" && event.thread_id) threadId = event.thread_id;
        logEvent(opts.tag, { source: "codex", ...event });
      } catch {
        // not JSON
      }
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
      if (code !== 0) logEvent(opts.tag, { source: "codex", type: "codex_exit", code, stderr: stderr.slice(-2000) });
      resolve({
        exitCode: code ?? 1,
        threadId,
        lastMessage: existsSync(lastMessageFile) ? readFileSync(lastMessageFile, "utf8") : "",
      });
    });
  });
}
