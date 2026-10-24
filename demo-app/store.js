// In-memory store. Each server process starts empty, so every Kane run is isolated.
const events = new Map();
let nextId = 1;

export function createEvent({ title, date, host }) {
  const event = { id: String(nextId++), title, date, host, guests: [] };
  events.set(event.id, event);
  return event;
}

export function getEvent(id) {
  return events.get(id);
}

export function saveRsvp(event, { name, choice }) {
  const guest = event.guests.find((guest) => guest.name.toLowerCase() === name.toLowerCase());
  if (guest) {
    guest.name = name;
    guest.choice = choice;
  } else {
    event.guests.push({ name, choice });
  }
}

export function listEvents() {
  return [...events.values()];
}
