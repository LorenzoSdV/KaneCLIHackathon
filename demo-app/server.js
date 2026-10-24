import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createEvent, getEvent, listEvents } from "./store.js";
import { homePage, eventPage, notFoundPage } from "./views.js";

const PORT = Number(process.env.PORT ?? 4100);
const publicDir = new URL("./public/", import.meta.url);

async function readForm(req) {
  let body = "";
  for await (const chunk of req) body += chunk;
  return Object.fromEntries(new URLSearchParams(body));
}

function send(res, status, html) {
  res.writeHead(status, { "content-type": "text/html; charset=utf-8" });
  res.end(html);
}

function redirect(res, location) {
  res.writeHead(303, { location });
  res.end();
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  try {
    if (req.method === "GET" && path === "/") {
      return send(res, 200, homePage({ events: listEvents() }));
    }

    if (req.method === "POST" && path === "/events") {
      const form = await readForm(req);
      const title = (form.title ?? "").trim();
      if (!title) {
        return send(res, 400, homePage({ events: listEvents(), error: "Title is required", values: form }));
      }
      const event = createEvent({ title, date: form.date ?? "", host: (form.host ?? "").trim() });
      return redirect(res, `/events/${event.id}`);
    }

    const eventMatch = path.match(/^\/events\/([^/]+)$/);
    if (req.method === "GET" && eventMatch) {
      const event = getEvent(eventMatch[1]);
      return event ? send(res, 200, eventPage({ event })) : send(res, 404, notFoundPage());
    }

    if (req.method === "GET" && path === "/style.css") {
      res.writeHead(200, { "content-type": "text/css" });
      return res.end(await readFile(new URL("style.css", publicDir)));
    }

    if (req.method === "GET" && path === "/healthz") {
      res.writeHead(200, { "content-type": "text/plain" });
      return res.end("ok");
    }

    send(res, 404, notFoundPage());
  } catch (err) {
    console.error(err);
    send(res, 500, "Internal error");
  }
});

server.listen(PORT, () => console.log(`Potluck Planner on http://localhost:${PORT}`));
