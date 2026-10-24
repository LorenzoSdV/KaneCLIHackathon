// Runs Kane contract tests against a copy of the app.
//   node orchestrator/src/suite.ts [uc-1 uc-2 ...] [--headless] [--parallel N] [--port N] [--repo DIR] [--app DIR]
// With no use cases, runs every contract. Prints one line per test and a rollup.
// --repo is where the tests come from; --app is the copy of the app they run against (default: --repo),
// e.g. --app wt/feat-b checks a feature branch's code against main's latest contract.
// When --app is a feature's worktree, the run is that feature's contract re-check: it is logged under the
// feature's tag (so the dashboard shows it) and its result counts as the feature's latest contract result.
import { basename, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { startApp } from "./app.ts";
import { APP_DIR, FEATURES, loadContracts, setStartUrl } from "./features.ts";
import { logEvent, ROOT, runSuite } from "./kane.ts";
import { WORKTREES_DIR } from "./worktrees.ts";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    headless: { type: "boolean", default: false },
    parallel: { type: "string", default: "4" },
    port: { type: "string", default: "4100" },
    repo: { type: "string", default: ROOT },
    app: { type: "string" },
  },
});

const repo = resolve(values.repo);
const appRepo = resolve(values.app ?? values.repo);
const contracts = loadContracts(repo);
const useCases = positionals.length ? positionals : Object.keys(contracts);
const ownerOf = new Map<string, string>();
for (const uc of useCases) for (const f of contracts[uc] ?? []) ownerOf.set(f.replace(`${APP_DIR}/`, ""), uc);

const feature = resolve(appRepo, "..") === WORKTREES_DIR ? FEATURES.find((f) => f.id === basename(appRepo)) : undefined;
const tag = feature?.id ?? "suite";

const app = await startApp(appRepo, Number(values.port));
setStartUrl(repo, app.url);
if (feature) logEvent(tag, { source: "gate", type: "contract_recheck_start", useCases, tests: ownerOf.size });

try {
  const result = await runSuite([...ownerOf.keys()], {
    cwd: join(repo, APP_DIR),
    tag,
    parallel: Number(values.parallel),
    headless: values.headless,
    name: `contracts-${useCases.join("-")}`,
  });

  for (const m of result.members) {
    const file = [...ownerOf.keys()].find((f) => m.path.endsWith(f.split("/").pop()!)) ?? m.path;
    const name = file.split("/").pop()!.replace("_test.md", "");
    const why = m.failure ? ` — ${m.failure.message.split("\n")[0].slice(0, 160)}` : "";
    console.log(`${m.status === "passed" ? "✅" : "❌"} [${ownerOf.get(file) ?? "?"}] ${name}${why}`);
  }
  const t = result.totals;
  console.log(
    `\n${result.status.toUpperCase()} · ${t ? `${t.passed}/${t.tests} passed, ${t.failed} failed, ${t.authored} authored` : "no totals"}` +
      (result.planFailures.length ? ` · plan failures: ${JSON.stringify(result.planFailures)}` : "") +
      (result.status === "error" ? `\n${result.stderr.slice(-1500)}` : ""),
  );
  if (feature) {
    const failed = result.members.filter((m) => m.status !== "passed");
    logEvent(tag, {
      source: "gate",
      type: "contract_recheck_end",
      status: result.status === "passed" ? "passed" : "failed",
      passed: result.members.length - failed.length,
      total: result.members.length,
      failed: failed.map((m) => ({ path: m.path, message: m.failure?.message ?? m.status })),
    });
  }
  process.exitCode = result.status === "passed" ? 0 : 1;
} finally {
  app.stop();
}
