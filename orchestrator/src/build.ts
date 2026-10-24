// Creates one worktree per feature and runs every feature's contract gate at the same time.
//   node orchestrator/src/build.ts [feat-a feat-b] [--attempts N] [--parallel N] [--watch]
import { parseArgs } from "node:util";
import { FEATURES, loadContracts } from "./features.ts";
import { runGate } from "./gate.ts";
import { logEvent } from "./kane.ts";
import { ensureWorktree } from "./worktrees.ts";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    attempts: { type: "string", default: "4" },
    parallel: { type: "string", default: "3" },
    watch: { type: "boolean", default: false }, // visible Chrome windows instead of headless
  },
});

const contracts = loadContracts();
const selected = FEATURES.filter((f) => !positionals.length || positionals.includes(f.id));

logEvent("build", { source: "orchestrator", type: "build_start", features: selected.map((f) => f.id) });
const results = await Promise.all(
  selected.map((feature) => {
    const dir = ensureWorktree(feature.id, feature.branch);
    logEvent(feature.id, { source: "orchestrator", type: "worktree_ready", dir, branch: feature.branch, port: feature.port });
    return runGate(feature, dir, contracts, {
      maxAttempts: Number(values.attempts),
      parallel: Number(values.parallel),
      headless: !values.watch,
      codexTimeoutMs: 20 * 60_000,
    });
  }),
);
logEvent("build", { source: "orchestrator", type: "build_end", results });

for (const r of results) console.log(`${r.status === "passed" ? "✅" : "⛔"} ${r.feature}: ${r.status} after ${r.attempts} attempt(s)`);
process.exitCode = results.every((r) => r.status === "passed") ? 0 : 1;
