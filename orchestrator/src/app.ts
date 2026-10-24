// Starts and stops a copy of the demo app (the base repo or any worktree) on a fixed port.
import { spawn, type ChildProcess } from "node:child_process";
import { join } from "node:path";

export interface RunningApp {
  url: string;
  stop: () => void;
}

export async function startApp(repoDir: string, port: number, timeoutMs = 10_000): Promise<RunningApp> {
  const child: ChildProcess = spawn("node", ["server.js"], {
    cwd: join(repoDir, "demo-app"),
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "ignore", "inherit"],
  });
  const url = `http://localhost:${port}`;
  const stop = () => child.kill("SIGTERM");

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`demo app in ${repoDir} exited with code ${child.exitCode}`);
    try {
      const res = await fetch(`${url}/healthz`);
      if (res.ok) return { url, stop };
    } catch {
      // not listening yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  stop();
  throw new Error(`demo app in ${repoDir} did not answer on ${url} within ${timeoutMs}ms`);
}
