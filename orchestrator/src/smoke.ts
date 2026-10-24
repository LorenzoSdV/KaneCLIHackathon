// Step-1 smoke test: start the demo app and have Kane create an event end to end.
import { startApp } from "./app.ts";
import { ROOT, runObjective } from "./kane.ts";

const headless = process.argv.includes("--headless");
const app = await startApp(ROOT, 4100);

try {
  const result = await runObjective(
    `Go to ${app.url}, create an event titled "Smoke Potluck" with date 2026-11-14 and host name "Lorenzo", ` +
      `then verify the event page shows the title "Smoke Potluck" and the text "Hosted by Lorenzo"`,
    { tag: "smoke", headless, maxSteps: 20, timeoutS: 180 },
  );
  console.log(
    JSON.stringify(
      {
        status: result.status,
        exitCode: result.exitCode,
        oneLiner: result.oneLiner,
        summary: result.summary,
        durationS: result.durationS,
        stepsDone: result.stepsDone,
        failures: result.failures,
        credits: result.events.find((e) => e.type === "run_end")?.credits_consumed ?? null,
        testUrl: result.events.find((e) => e.type === "run_end")?.test_url ?? null,
        stderr: result.status === "error" ? result.stderr.slice(-2000) : undefined,
      },
      null,
      2,
    ),
  );
  process.exitCode = result.status === "passed" ? 0 : 1;
} finally {
  app.stop();
}
