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

export function homePage({ events, error = "", values = {} }) {
  const list = events.length
    ? `<ul class="events">${events
        .map((e) => `<li><a href="/events/${e.id}">${escape(e.title)}</a> <span class="muted">${escape(e.date)}</span></li>`)
        .join("")}</ul>`
    : `<p class="muted">No events yet.</p>`;

  return layout(
    "Home",
    `<section class="card">
  <h1>Create event</h1>
  ${error ? `<p class="error" role="alert">${escape(error)}</p>` : ""}
  <form method="post" action="/events">
    <label>Event title <input name="title" value="${escape(values.title)}"${
      error ? ' class="invalid" aria-invalid="true" autofocus' : ""
    }></label>
    <label>Date <input name="date" type="date" value="${escape(values.date)}"></label>
    <label>Host name <input name="host" value="${escape(values.host)}"></label>
    <button type="submit">Create event</button>
  </form>
</section>
<section class="card">
  <h2>Events</h2>
  ${list}
</section>`
  );
}

export function eventPage({ event }) {
  return layout(
    event.title,
    `<section class="card">
  <h1>${escape(event.title)}</h1>
  <p class="date">${escape(event.date)}</p>
  <p class="host">Hosted by ${escape(event.host)}</p>
</section>`
  );
}

export function notFoundPage() {
  return layout("Not found", `<section class="card"><h1>Event not found</h1><p><a href="/">Back home</a></p></section>`);
}
