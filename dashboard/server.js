// Spec Contract dashboard server (no dependencies).
//   GET /                      the dashboard page
//   GET /stream                live: every event in .contract/events.jsonl, then new ones as they are appended
//   GET /stream?replay=<name>  replay: dashboard/fixtures/<name>.jsonl, paced by its timestamps (&speed=N)
//   GET /contracts             use case -> test files (demo-app/contracts.json)
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync, openSync, readSync, closeSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const PORT = Number(process.env.PORT ?? 4300);
const LIVE_LOG = join(root, ".contract", "events.jsonl");
const MAX_GAP_MS = 1500; // replay never waits longer than this between two events (before speed)

function sse(res) {
  res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" });
  return (line) => res.write(`data: ${line}\n\n`);
}

function readLines(file) {
  return existsSync(file) ? readFileSync(file, "utf8").split("\n").filter((l) => l.startsWith("{")) : [];
}

function streamLive(req, res) {
  const send = sse(res);
  send(JSON.stringify({ type: "stream_mode", mode: "live" }));
  for (const line of readLines(LIVE_LOG)) send(line);
  send(JSON.stringify({ type: "stream_caught_up" }));

  // Tail: poll the file size and send whatever was appended.
  let offset = existsSync(LIVE_LOG) ? statSync(LIVE_LOG).size : 0;
  let partial = "";
  const timer = setInterval(() => {
    if (!existsSync(LIVE_LOG)) return;
    const size = statSync(LIVE_LOG).size;
    if (size < offset) offset = 0; // log was rewritten
    if (size === offset) return;
    const fd = openSync(LIVE_LOG, "r");
    const buf = Buffer.alloc(size - offset);
    readSync(fd, buf, 0, buf.length, offset);
    closeSync(fd);
    offset = size;
    const lines = (partial + buf.toString("utf8")).split("\n");
    partial = lines.pop() ?? "";
    for (const line of lines) if (line.startsWith("{")) send(line);
  }, 500);
  req.on("close", () => clearInterval(timer));
}

function streamReplay(req, res, name, speed) {
  const file = join(here, "fixtures", `${name.replace(/[^\w-]/g, "")}.jsonl`);
  if (!existsSync(file)) {
    res.writeHead(404, { "content-type": "text/plain" });
    return res.end(`no fixture ${name}`);
  }
  const send = sse(res);
  const lines = readLines(file);
  let closed = false;
  req.on("close", () => (closed = true));
  send(JSON.stringify({ type: "stream_mode", mode: "replay", fixture: name, speed, total: lines.length }));

  (async () => {
    let prev = null;
    for (const line of lines) {
      if (closed) return;
      const at = Date.parse(JSON.parse(line).at ?? "") || prev;
      if (prev && at) {
        const wait = Math.min(Math.max(at - prev, 0), MAX_GAP_MS) / speed;
        if (wait > 5) await new Promise((r) => setTimeout(r, wait));
      }
      prev = at;
      send(line);
    }
    if (!closed) send(JSON.stringify({ type: "stream_replay_done" }));
  })();
}

createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(readFileSync(join(here, "index.html")));
  }
  if (url.pathname === "/stream") {
    const replay = url.searchParams.get("replay");
    const speed = Math.max(0.25, Number(url.searchParams.get("speed") ?? 1) || 1);
    return replay ? streamReplay(req, res, replay, speed) : streamLive(req, res);
  }
  if (url.pathname === "/contracts") {
    const file = join(root, "demo-app", "contracts.json");
    res.writeHead(200, { "content-type": "application/json" });
    return res.end(existsSync(file) ? readFileSync(file) : "{}");
  }
  if (url.pathname === "/healthz") {
    res.writeHead(200, { "content-type": "text/plain" });
    return res.end("ok");
  }
  res.writeHead(404, { "content-type": "text/plain" });
  res.end("not found");
}).listen(PORT, () => console.log(`Spec Contract dashboard on http://localhost:${PORT}`));
