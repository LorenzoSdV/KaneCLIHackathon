import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createEvent, getEvent, listEvents, claimDish } from "./store.js";
import { homePage, eventPage, notFoundPage } from "./views.js";

const PORT = Number(process.env.PORT ?? 4100);
const publicDir = new URL("./public/", import.meta.url);

async function readForm(req) {
  let body = "";
  for await (const chunk of req) body += chunk;
  return Object.fromEntries(new URLSearchParams(body));
}

// Dates are compared as local YYYY-MM-DD strings, the format <input type="date"> submits.
function today() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
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
      const date = (form.date ?? "").trim();
      const host = (form.host ?? "").trim();
      const errors = {};
      if (!title) errors.title = "Title is required";
      if (!date) errors.date = "Date is required";
      else if (!isValidDate(date) || date < today()) errors.date = "Date must be today or later";
      if (!host) errors.host = "Host name is required";
      if (Object.keys(errors).length) {
        return send(res, 400, homePage({ events: listEvents(), errors, values: form }));
      }
      const event = createEvent({ title, date, host });
      return redirect(res, `/events/${event.id}`);
    }

    const claimMatch = path.match(/^\/events\/([^/]+)\/claims$/);
    if (req.method === "POST" && claimMatch) {
      const event = getEvent(claimMatch[1]);
      if (!event) return send(res, 404, notFoundPage());
      const form = await readForm(req);
      const error = claimDish(event, form.category, form.guestName ?? "");
      if (error) return send(res, 400, eventPage({ event, error }));
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
