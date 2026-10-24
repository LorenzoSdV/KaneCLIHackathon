// Runs Kane contract tests against a copy of the app.
//   node orchestrator/src/suite.ts [uc-1 uc-2 ...] [--headless] [--parallel N] [--port N] [--repo DIR]
// With no use cases, runs every contract. Prints one line per test and a rollup.
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { startApp } from "./app.ts";
import { APP_DIR, loadContracts, setStartUrl } from "./features.ts";
import { ROOT, runSuite } from "./kane.ts";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    headless: { type: "boolean", default: false },
    parallel: { type: "string", default: "4" },
    port: { type: "string", default: "4100" },
    repo: { type: "string", default: ROOT },
  },
});

const repo = resolve(values.repo);
const contracts = loadContracts(repo);
const useCases = positionals.length ? positionals : Object.keys(contracts);
const ownerOf = new Map<string, string>();
for (const uc of useCases) for (const f of contracts[uc] ?? []) ownerOf.set(f.replace(`${APP_DIR}/`, ""), uc);

const app = await startApp(repo, Number(values.port));
setStartUrl(repo, app.url);

try {
  const result = await runSuite([...ownerOf.keys()], {
    cwd: join(repo, APP_DIR),
    tag: "suite",
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
  process.exitCode = result.status === "passed" ? 0 : 1;
} finally {
  app.stop();
}
