# Spec Contract

**A PRD goes in. Kane CLI turns it into acceptance tests. Each test set becomes the contract for one Codex agent working in its own git worktree, and an agent's work is accepted only when its Kane contract passes in a real browser. Then the branches are merged and every contract runs again.**

Built at Kane CLI Hack Day SF (Oct 24, 2026) with Codex (OpenAI) as the coding agents and Kane CLI as the verifier.

## The problem

Coding agents now build features in parallel, but nobody can prove that each feature does what the spec says, and the merges quietly break each other. Unit tests written by the same agent that wrote the code don't count as proof. You need:

1. Tests that come from the **requirements**, not from the agent.
2. An agent that **can't finish** until those tests pass in a real browser.
3. A merge that re-runs **every** feature's contract, because two green branches can still make one red app.

## How it works

```
requirements/*.md ──► Codex contract agent drives Kane assurance (ingest → extract → design)
                         answers Kane's gap questions itself · YOU approve use cases and tests
                         │
                         ▼  contracts.json: use case → Kane _test.md files
          ┌──────────────┴──────────────┐
   wt/feat-a (Codex agent A)     wt/feat-b (Codex agent B)       … one worktree per feature, in parallel
          │                              │
   Kane gate: testrun --parallel 3 (feature tests + core + already-merged features)
   failure brief from Kane's NDJSON ──► back to Codex, up to 4 attempts
          │                              │
          └──────────────┬──────────────┘
                         ▼  merge only features whose latest contract passed
   wt/integration: git merge · Kane recording conflicts resolved by rule · code conflicts → Codex resolver
                         ▼
   full suite (every contract) testrun --parallel 4 ──► Codex fixer loop ──► you merge into main
```

Everything is visible on a live dashboard that streams the orchestrator's event log.

## Run it

Requires Node 23.6+ (runs TypeScript directly, no build), [kane-cli](https://www.npmjs.com/package/@testmuai/kane-cli) signed in (`kane-cli login`), and [Codex CLI](https://github.com/openai/codex) signed in (`codex login --with-api-key`).

```bash
npm install                      # only TypeScript types; the app and orchestrator have no runtime deps

npm run dashboard                # http://localhost:4300 (live) · /?replay=demo&speed=8 replays today's real run
npm run app                      # the Potluck Planner app on http://localhost:4100

npm run suite                    # every Kane contract against the app, 4 tests in parallel
npm run suite -- uc-1 --headless # just the core contract, no browser windows

npm run round                    # a whole round in YOUR terminal: Codex designs contracts with Kane, you approve,
                                 # Codex agents build the features in parallel behind Kane gates, then merge
```

The pieces, if you want to drive them separately:

```bash
npm run contracts -- extract requirements/round-2.md   # Codex contract agent: requirements → Kane use cases
npm run contracts -- approve uc-4 uc-5                  # you approve
npm run contracts -- design                             # Codex contract agent: use cases → Kane tests
npm run contracts -- approve-design                     # you approve; features are registered in features.json
npm run build -- feat-c feat-d --watch                  # Codex agents in parallel, each behind its Kane gate
npm run merge -- --watch                                # merge + full contract + Codex fixer loop
npm run suite -- uc-1 uc-3 --app wt/feat-b              # Kane-only re-check of a branch against main's contract
```

## Where Kane is used

| Kane CLI capability | Where |
|---|---|
| `context ingest` / `context extract` (assurance) | PRD → use cases, with Kane pausing on real gaps in the spec ([contracts.ts](orchestrator/src/contracts.ts)) |
| `context review` (human checkpoints) | use cases and designed tests are approved by a person, never by an agent |
| `design tests` | use case → acceptance criteria → scenarios → runnable `_test.md` ([demo-app/.testmuai/tests](demo-app/.testmuai/tests)) |
| `maintain evolve` | redesigning tests that were flaky or wrong, with the reason recorded (t-1→t-19, t-3→t-17, t-13→t-20) |
| `testrun run --parallel N` | every gate and the merge; NDJSON parsed live ([kane.ts](orchestrator/src/kane.ts)) |
| replays + adaptive healing | recordings are committed, so gates replay in seconds without AI |
| `run --agent` / `testmd run` | smoke test; dashboard self-test ([selftest/](selftest/)) |
| evidence packs | one sealed pack per run, key ones in [evidence/](evidence/) |
| `cover` | coverage measured against the acceptance criteria |

**Agent ↔ Kane loops**

- **Gate loop** ([gate.ts](orchestrator/src/gate.ts)): Kane's failing test name, step and remark go back to the same Codex conversation as the next prompt.
- **Contract agent** ([contracts.ts](orchestrator/src/contracts.ts)): Codex drives Kane's assurance commands itself (using the kane-cli skill), answers Kane's questions, and reports the questions and its reasoning.
- **Contract enforcement**: a feature agent may not edit its own tests. Any change to tests, requirements or `contracts.json` is reverted before Kane runs.
- **Merge gate** ([merge.ts](orchestrator/src/merge.ts)): a feature is merged only if its latest contract result (gate or re-check) is a pass.

## What actually happened today

All of this is in the git history and in `.contract/events.jsonl`, which is what the dashboard replays.

**Contracts.** Kane read the PRD and paused three times on real gaps: what about a blank date or host name, an RSVP with no choice, past dates? The answers went into [decisions.md](demo-app/requirements/decisions.md). Kane designed 16 tests across 3 use cases and 46 acceptance criteria, all approved by a person.

**Kane caught our own bad tests, three times:**

- **t-3 counted all events on the page.** Parallel tests share one app, so another test's events changed the count. Kane's log showed 0 → 2 events, and the test was redesigned to look for a unique title (t-17/t-18).
- **t-1 checked two pages after the click had already left the first one.** It passed or failed at random. Redesigned as t-19.
- **t-13, the stale dish claim, never said how the second tab reached the event.** Its recording saved a fixed `/events/4` URL. Redesigned as t-20: store the URL, open it in a new tab, switch tabs without reloading.

**Feature A, RSVP:** Codex passed 12/12 on its **first attempt**. To prove the retry path, we planted a bug on the branch (case-sensitive name matching). Kane caught it (10/12, [`a50ffeb`](../../commit/a50ffeb)). Codex got the failure brief and restored the case-insensitive match (`ffa933b`), and the next run was green.

**Feature B, dish claims:** blocked after 4 attempts at 9/10. The cause was the bad test t-13, not the code. Codex's own conclusion: *"No app changes were warranted: restoring a Claim button on a claimed category would violate the spec … Test files remain untouched."* After t-13 became t-20, B's unchanged code passed a Kane-only re-check, 10/10.

**Merge:** 4 code conflicts (`server.js`, `store.js`, `views.js`, `style.css`), resolved by a Codex resolver given both contracts, plus 46 Kane recording conflicts resolved by rule. The full contract passed **16/16 on the first try**, with all 16 tests replayed and none re-recorded.

**Round 2: comments (C) and dietary needs (D), run end to end with `npm run round`.** No hand edits anywhere in this round. The Codex contract agent turned [round-2.md](demo-app/requirements/round-2.md) into 2 use cases and 8 tests. A person approved both checkpoints in the terminal, the orchestrator registered `feat-c` and `feat-d` in [features.json](demo-app/features.json) by itself, and two Codex agents built them in parallel. Their gates also ran the core, RSVP and dish contracts (20–24 tests per gate). It didn't go green, and both reasons are real findings:

- **Kane found a timezone bug at midnight UTC.** The core test "past date is rejected" had passed all day. From **00:15 UTC (17:15 local)** it failed on every run: *"no event with title 'Assurance Past Potluck 39817' was created"* could not be verified. Kane's agent works out "yesterday" in UTC, where it was already Oct 25, so "yesterday" was Oct 24. That is *today* for the app, which compares dates in local time and correctly accepts today. The test's idea of "today" and the app's disagree for 7 hours a day. **Feature C was blocked at 19/20 on all 4 attempts by this core test, not by its own code**, and Codex correctly didn't change the date rule to make it pass.
- **Kane exposed a bug in our orchestrator.** The gate runs "already merged" features' tests, but `isMerged` treated a **freshly created branch with no commits** as merged. So D's gate also demanded C's comment tests, and **Codex D implemented comments as well** to satisfy them. D passed 24/24 on attempt 4, but outside its scope. Fixed: a feature now counts as merged only if its tip is a parent of a merge commit on main ([worktrees.ts](orchestrator/src/worktrees.ts)).

Neither C nor D was merged: C's latest contract result is blocked, and the merge gate refuses unpassed features.

## Scope

- **Kane's assurance approvals are human by design.** Agents never approve; `npm run round` asks you in the terminal.
- **The orchestrator is local.** It drives local worktrees, local Chrome and the local Kane/Codex CLIs. With two gates of 3 Chromes each, a few runs failed to start a browser (`connect_over_cdp`). The next step is `testrun --remote --parallel N` on Kane's HyperExecute grid: one VM per test, about 15 s of setup instead of queueing behind local Chromes. That needs the remote-execution plugin, a grid plan, and the app on a URL the grid can reach (a tunnel or a preview deploy) instead of `localhost`.
- **Round 2 is not merged.** Next steps: make the past-date test and the app agree on a timezone (pin both to the event's local date), re-check feat-c with `npm run suite -- --app wt/feat-c`, and re-run feat-d with the `isMerged` fix so it builds only dietary needs.
- **AI-driven browser tests are not deterministic.** We hit and fixed three bad or flaky tests. We chose to fix tests at the source with `maintain evolve`, rather than add automatic re-runs that could hide real intermittent bugs.
- **Tests run in parallel against one shared in-memory app**, so tests must not depend on global state. That rule is written down in [test-environment.md](demo-app/requirements/test-environment.md).
- **The dashboard's own Kane test** ([selftest/](selftest/)) covers the replayed final state, not the live mode.
- **Codex runs sandboxed.** Feature agents can only write their own worktree and have no network. Only the contract agent gets network access plus `~/.testmuai`, which Kane's commands need.

## Repo map

| Path | What |
|---|---|
| [demo-app/](demo-app/) | Potluck Planner, the app the agents build (no dependencies) |
| [demo-app/requirements/](demo-app/requirements/) | PRD, decisions, round-2 requirements, test-environment notes |
| [demo-app/.testmuai/tests/](demo-app/.testmuai/tests/) | Kane-designed contracts (`_test.md`) and their replay recordings |
| [demo-app/contracts.json](demo-app/contracts.json) · [features.json](demo-app/features.json) | use case → tests · feature → use case, branch, port |
| [orchestrator/src/](orchestrator/src/) | `kane.ts` (NDJSON), `gate.ts`, `merge.ts`, `contracts.ts`, `codex.ts`, `build.ts`, `suite.ts` |
| [dashboard/](dashboard/) | live and replay dashboard; [fixtures/demo.jsonl](dashboard/fixtures/demo.jsonl) is today's real run |
| [selftest/](selftest/) | Kane tests of Spec Contract itself |
| [evidence/](evidence/) | key Kane evidence packs (`kane-cli evidence serve <pack>` to view) |
| [PLAN.md](PLAN.md) | the plan we started from at 10 AM |

## Built with

Kane CLI (TestMu AI) · Codex CLI and OpenAI API · Node 24 · Claude Code.
