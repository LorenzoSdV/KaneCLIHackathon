import { dishCategories } from "./store.js";

export function escape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function layout(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(title)} · Potluck Planner</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <header><a href="/" class="brand">🥘 Potluck Planner</a></header>
  <main>${body}</main>
</body>
</html>`;
}

function field(label, name, type, values, errors, autofocus) {
  const error = errors[name];
  const attrs = error ? ` class="invalid" aria-invalid="true"${autofocus ? " autofocus" : ""}` : "";
  return `<label>${label} <input name="${name}" type="${type}" value="${escape(values[name])}"${attrs}></label>`;
}

export function homePage({ events, errors = {}, values = {} }) {
  const messages = Object.values(errors);
  const firstInvalid = ["title", "date", "host"].find((name) => errors[name]);
  const list = events.length
    ? `<ul class="events">${events
        .map((e) => `<li><a href="/events/${e.id}">${escape(e.title)}</a> <span class="muted">${escape(e.date)}</span></li>`)
        .join("")}</ul>`
    : `<p class="muted">No events yet.</p>`;

  return layout(
    "Home",
    `<section class="card">
  <h1>Create event</h1>
  ${
    messages.length
      ? `<div class="error" role="alert">${messages.map((m) => `<p>${escape(m)}</p>`).join("")}</div>`
      : ""
  }
  <form method="post" action="/events">
    ${field("Event title", "title", "text", values, errors, firstInvalid === "title")}
    ${field("Date", "date", "date", values, errors, firstInvalid === "date")}
    ${field("Host name", "host", "text", values, errors, firstInvalid === "host")}
    <button type="submit">Create event</button>
  </form>
</section>
<section class="card">
  <h2>Events</h2>
  ${list}
</section>`
  );
}

export function eventPage({ event, error }) {
  const dishes = dishCategories.map((category) => {
    const claimant = event.claims[category];
    return `<li class="dish">
    <h3>${escape(category)}${claimant ? ` — claimed by ${escape(claimant)}` : ""}</h3>
    ${claimant ? "" : `<form method="post" action="/events/${event.id}/claims" aria-label="Claim ${category}">
      <input type="hidden" name="category" value="${category}">
      <label>Guest name <input type="text" name="guestName" aria-label="Guest name for ${category}"></label>
      <button type="submit">Claim</button>
    </form>`}
  </li>`;
  }).join("");
  return layout(
    event.title,
    `<section class="card">
  <h1>${escape(event.title)}</h1>
  <p class="date">${escape(event.date)}</p>
  <p class="host">Hosted by ${escape(event.host)}</p>
  <p><a href="/events/${event.id}" target="_blank" rel="noopener">Open event in another tab</a></p>
</section>
<section class="card" aria-labelledby="dishes-heading">
  <h2 id="dishes-heading">Dishes</h2>
  <p>${Object.keys(event.claims).length} of 5 dishes claimed</p>
  ${error ? `<div class="error" role="alert">${escape(error)}</div>` : ""}
  <ul class="dishes">${dishes}</ul>
</section>`
  );
}

export function notFoundPage() {
  return layout("Not found", `<section class="card"><h1>Event not found</h1><p><a href="/">Back home</a></p></section>`);
}
