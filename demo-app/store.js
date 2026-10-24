// In-memory store. Each server process starts empty, so every Kane run is isolated.
const events = new Map();
let nextId = 1;

export function createEvent({ title, date, host }) {
  const event = { id: String(nextId++), title, date, host };
  events.set(event.id, event);
  return event;
}

export function getEvent(id) {
  return events.get(id);
}

export function listEvents() {
  return [...events.values()];
}
