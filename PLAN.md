# Spec Contract: two Codex agents, gated by Kane tests, then merged

## Context
Kane CLI Hack Day, Oct 24, SF. Submissions lock at 5 PM. The repo is empty.
**The problem:** when several coding agents build features in parallel, nobody can prove each feature meets the spec, and the merges break each other.
**The product:** a PRD goes in, and Kane turns it into acceptance-criteria tests. Each feature's tests become the *contract* for one **Codex** agent (it runs on the OpenAI credits) working in its own git worktree. An agent's work isn't accepted until its Kane tests pass. Then the two branches are merged and the full suite runs in parallel to catch the features breaking each other, and a Codex fixer repairs any break. A live dashboard shows requirement → agent → Kane status → coverage.
**Scope for the day:** **2 agents, 2 features, 1 merge.** Scaling to N agents is just a config value afterwards.

## Architecture
```
PRD.md ──► kane-cli context ingest / design tests (--mode agent)
              │  feature A tests, feature B tests (_test.md)
              ▼
   orchestrator ─┬─ wt/feat-a (PORT 4101) ── codex exec ⇄ Kane gate (A tests)
                 └─ wt/feat-b (PORT 4102) ── codex exec ⇄ Kane gate (B tests)
                       (both run at the same time; each gate: testrun --parallel 2)
              ▼
   merge feat-a + feat-b ─► integration branch ─► full suite: testrun --parallel 4
              │   regression ─► failing tests mapped to feature ─► codex fixer
              ▼
   kane-cli cover ─► dashboard (SSE stream of .contract/events.jsonl)
```

## Repo layout (TypeScript, Node 20)
- `requirements/potluck.md`: the demo PRD. **Potluck Planner** has a shared core (create an event) and two features:
  - **Feature A: RSVP.** Guests RSVP yes/no/maybe and the event page shows the counts.
  - **Feature B: Dish claims.** Guests claim a dish category, a category can't be claimed twice, and the host sees the list.
  Both features touch the same event model and event page, so a real merge conflict or regression is likely, which is good for the demo.
- `demo-app/`: a skeleton that exists before the agents start (Express + plain HTML, or Vite). It contains the event model and the create-event page only, and takes its port from `PORT`.
- `orchestrator/src/`
  - `cli.ts`: commands `init <prd>`, `build`, `merge`, `cover`, `demo` (all of them in order).
  - `kane.ts`: one place that runs `kane-cli` (`KANE_CLI_USER_AGENT=spec-contract`, `< /dev/null` for testrun, `--mode agent` for assurance commands). It parses NDJSON line by line, ignores unknown types, and returns typed results (`testrun_done`, failing members, failing step remarks, evidence paths). Every event is also appended to `.contract/events.jsonl`.
  - `assurance.ts`: ingest → use-case checkpoint → design tests, then maps the tests to feature A or B. The checkpoint event formats come from the skill's `references/assurance.md` and `assurance-parsing.md`, read during implementation.
  - `worktrees.ts`: `git worktree add wt/feat-a -b feat/a` (and the same for B), a fixed port for each, and a variables file per worktree (`base_url=http://localhost:<port>`) so the same tests run against any copy.
  - `codex.ts`: runs `codex exec` non-interactively inside the worktree (full-auto, so it can write files there). The prompt contains the PRD section, that feature's acceptance criteria, its `_test.md` files, and "you are done only when these Kane flows pass". Retry prompts add the latest failure brief.
  - `gate.ts`: the contract loop. Start the worktree's app, run that feature's tests, and if they're red, build a short failure brief (failing step, Kane's remark, screenshot path) and run `codex exec` again. Stop after K=4 tries and mark the feature blocked. The two gates run at the same time with `Promise.all`.
  - `merge.ts`: merge `feat/a`, then `feat/b`, into `integration`. If git reports a conflict, a Codex resolver gets both features' contracts. Then start the merged app and run the **full** suite (`--parallel 4`). Any failing test is mapped back to its feature, and the Codex fixer gets the brief plus both contracts. Run again until it passes or K tries.
- `dashboard/`: Vite + React, plus a small Node SSE server that reads `events.jsonl`. It has two feature columns and an integration column, each showing agent state, the try count, live Kane step tiles, pass/fail and a failure screenshot. The header shows coverage % from `kane-cli cover`.
- `tests/`: the designed `_test.md` files, committed after `init`. Also a `dashboard_test.md` so Kane checks the dashboard itself.

## Kane at two levels: inside the product, and testing the product
Kane does two separate jobs here, and each has its own assurance store (`.context/` lives in each folder) so they never mix:

| Level | What Kane checks | Where it lives | Who runs it |
|---|---|---|---|
| **Inside the product** | Potluck features A and B (the contracts the Codex agents must pass) | `demo-app/requirements/`, `demo-app/.context/`, `demo-app/tests/` | the orchestrator (gates and merge) |
| **Testing the product** | Spec Contract itself: dashboard, orchestration flow, failure handling | `selftest/requirements/spec-contract.md`, `selftest/.context/`, `selftest/tests/` | us during development, and judges at demo time |

**How we test Spec Contract itself with Kane:**
- `selftest/requirements/spec-contract.md` is a short PRD for *our* product. For example: the dashboard shows one column per feature plus integration; a red gate shows the failing step and its screenshot; retries count up; a blocked feature is shown as blocked; integration goes green only after the full suite passes; coverage % is shown and matches `kane-cli cover`. Kane's assurance commands ingest it and design the tests. We don't write them by hand.
- **Repeatable tests from replayed logs:** the dashboard has a `?replay=<fixture>` mode that plays a saved `events.jsonl`. Fixtures in `selftest/fixtures/` cover these cases: everything passes, A fails once and then passes, B is blocked, and a merge regression gets fixed. Each fixture is a Kane test that runs in seconds and costs no Codex calls. They run together with `testrun run selftest/tests --parallel 4`.
- **One live end-to-end test:** the dashboard has a "Run demo" button that starts the real pipeline. One self-test clicks it, waits, and checks that both feature columns and then integration turn green. Kane drives Kane, through our UI.
- **Dev loop:** while we build the orchestrator and dashboard, a Claude Code hook in this repo (PostToolUse on edits under `dashboard/`, plus a manual `npm run selftest`) runs the replay self-tests headless, and we fix things until they pass. This is the judges' "Kane on every save" pattern, used on our own tool.
- Coverage of our own PRD comes from `kane-cli cover` in `selftest/` and is shown as a second badge on the dashboard: "Spec Contract self-coverage".

## Current status (step 1) and blocker
Done: `demo-app/` (PRD, a create-event app with no dependencies, checked with curl), `orchestrator/src/kane.ts` (spawns kane-cli, parses NDJSON, mirrors events to `.contract/events.jsonl`, `runObjective` / `runSuite`), `orchestrator/src/app.ts` (`startApp`), `orchestrator/src/smoke.ts`, root `package.json`, `.gitignore`. Kane is signed in with 111k credits.

**Blocker:** the first smoke run exited 2. Kane's runner failed with `BlockingIOError: [Errno 35]` because the user account is at its process limit (2,649 of 2,666 processes). 2,202 of those are zombies left by `/Applications/Pioneer/FwUpdateManager/.../FwUpdateManagerd` (pid 3969). Fix, needs the user's OK:
1. `kill 3969` (Pioneer's firmware update daemon). Its zombies are cleaned up when it exits. Check with `ps -u $(id -u) | wc -l`.
2. Optional, to stop it coming back: `launchctl list | grep -i pioneer`, then unload or disable that agent, or quit it from its menu bar app.
3. Apply the pending edit to `smoke.ts` (add `stderr` to the output when the status is `error`), then run `npm run smoke` again and show the result card.
4. Copy this plan file to `PLAN.md` in the project again, so the project copy stays current.

## Build order (timeboxed)
1. **10:00–10:45**: install kane-cli, run the preflight, sign in. Check that `codex exec` works with the API key. Write the PRD and the demo-app skeleton. Write `kane.ts` and smoke-test it with one `kane-cli run` against the skeleton.
2. **10:45–11:45**: `assurance.ts`. Get ingest and design working on the PRD, check the tests split cleanly into A and B, and commit them. Write `worktrees.ts`.
3. **11:45–13:15**: `codex.ts` and `gate.ts`. Get feature A from red to green end to end, then run A and B at the same time.
4. **13:15–14:15**: `merge.ts`. The merge, the full parallel suite, and the fixer loop.
5. **14:15–15:30**: the dashboard with live SSE, replay mode, the "Run demo" button and the coverage badges. Write the self-test PRD and fixtures in parallel with this.
6. **15:30–16:30**: ingest and design for `selftest/`, add the save hook, and run the self-test suite in parallel until it's green. Run the full demo from start to finish and **record a backup run**.
7. **16:30–17:00**: freeze. README with the architecture, what existed at 10 AM, and the Playwright export as a bonus.

## Risks and how we handle them
- **Run time and credits:** about 1 minute per Kane run. Gates use `--headless`, and only the final integration run shows the browser on stage.
- **Assurance checkpoints in agent mode:** handle the checkpoint events explicitly. As a fallback, keep the designed tests committed so `init` can be skipped.
- **Codex runaway or slow runs:** cap the tries at K, add a timeout per `codex exec`, and show "blocked" honestly on the dashboard.
- **Port and Chrome conflicts:** a fixed port per worktree, and testrun gives each worker its own Chrome.
- **Demo failure:** a recorded run, plus `demo --replay events.jsonl`, which drives the dashboard from a saved log.

## Verification
- `kane-cli testrun run tests/ --dry-run --agent < /dev/null` returns a valid plan with no unresolved variables.
- Feature A on its own: the gate goes red, Codex fixes it, and the gate goes green (`testrun_done`, all members pass).
- A and B at the same time: both worktrees reach green or blocked, and the dashboard updates live.
- Merge: the full suite with `--parallel 4` passes on `integration`. Any regression is mapped to the right feature and fixed by the Codex fixer.
- `kane-cli cover` reports coverage against the PRD's acceptance criteria, and the dashboard shows it.
- Self-tests: `kane-cli testrun run selftest/tests --parallel 4 < /dev/null` passes every replay fixture, and the live "Run demo" test passes.
- `kane-cli cover` in `selftest/` reports coverage of the Spec Contract PRD.
