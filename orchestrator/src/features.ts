// The features the orchestrator hands to Codex agents, and the contract (Kane tests) each must pass.
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./kane.ts";

export const APP_DIR = "demo-app";
export const TESTS_DIR = join(APP_DIR, ".testmuai", "tests");
export const VARIABLES_FILE = join(APP_DIR, ".testmuai", "variables", "assurance.json");
export const CONTRACTS_FILE = join(APP_DIR, "contracts.json");

export interface Feature {
  id: string; // worktree name and event tag
  title: string;
  useCase: string; // Kane use-case ref
  branch: string;
  port: number;
  prdSection: string; // "## <heading>" prefix in requirements/potluck.md
  decisionSections: string[]; // "## <heading>" prefixes in requirements/decisions.md
}

// Features live in demo-app/features.json: adding a feature is a config change, not a code change.
const config = JSON.parse(readFileSync(join(ROOT, APP_DIR, "features.json"), "utf8"));
export const CORE_USE_CASE: string = config.core.useCase;
export const FEATURES: Feature[] = config.features;

export const INTEGRATION = { id: "integration", branch: "integration", port: 4103 };

// use-case ref -> test files (relative to the repo root)
export type Contracts = Record<string, string[]>;

function testIdOf(file: string): string | null {
  const match = readFileSync(file, "utf8").match(/^assurance:\s*\n\s+id:\s*(\S+)/m);
  return match ? match[1] : null;
}

// The tests Kane's store currently treats as live (superseded designs drop out of this list,
// though their files stay on disk).
function liveTestIds(): Set<string> {
  const out = execFileSync("kane-cli", ["context", "list", "--json"], {
    cwd: join(ROOT, APP_DIR),
    encoding: "utf8",
    env: { ...process.env, KANE_CLI_USER_AGENT: "spec-contract" },
  });
  return new Set(
    out
      .split("\n")
      .filter((l) => l.startsWith("{"))
      .map((l) => JSON.parse(l))
      .filter((n) => n.label === "test")
      .map((n) => n.id),
  );
}

// Builds use-case -> live tests from every design run of that use case
// (.contract/design-<uc>*.ndjson: the first design plus any rework), joined to the
// _test.md files through their `assurance.id` frontmatter.
export function buildContracts(useCases: string[]): Contracts {
  const files = readdirSync(join(ROOT, TESTS_DIR)).filter((f) => f.endsWith("_test.md"));
  const byTestId = new Map<string, string>();
  for (const f of files) {
    const id = testIdOf(join(ROOT, TESTS_DIR, f));
    if (id) byTestId.set(id, join(TESTS_DIR, f));
  }
  const live = liveTestIds();
  const logs = readdirSync(join(ROOT, ".contract"));

  const contracts: Contracts = {};
  for (const uc of useCases) {
    const testIds = new Set<string>();
    for (const log of logs.filter((f) => f.startsWith(`design-${uc}.`) && f.endsWith(".ndjson"))) {
      for (const line of readFileSync(join(ROOT, ".contract", log), "utf8").split("\n")) {
        if (!line.startsWith("{")) continue;
        const event = JSON.parse(line);
        if (event.type !== "receipt" || !["tests", "rework"].includes(event.phase)) continue;
        for (const c of event.committed ?? []) if (c.logical_id?.startsWith("t-")) testIds.add(c.logical_id);
      }
    }
    contracts[uc] = [...testIds]
      .filter((id) => live.has(id))
      .map((id) => byTestId.get(id))
      .filter((f): f is string => Boolean(f))
      .sort();
  }
  return contracts;
}

export function saveContracts(contracts: Contracts) {
  writeFileSync(join(ROOT, CONTRACTS_FILE), JSON.stringify(contracts, null, 2) + "\n");
}

export function loadContracts(repoDir = ROOT): Contracts {
  return JSON.parse(readFileSync(join(repoDir, CONTRACTS_FILE), "utf8"));
}

// Points every designed test in a repo copy at that copy's app (fills `start_url`).
export function setStartUrl(repoDir: string, url: string) {
  const file = join(repoDir, VARIABLES_FILE);
  const vars = JSON.parse(readFileSync(file, "utf8"));
  vars.start_url = { ...vars.start_url, value: url };
  writeFileSync(file, JSON.stringify(vars, null, 2) + "\n");
}
