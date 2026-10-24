// In-memory store. Each server process starts empty, so every Kane run is isolated.
const events = new Map();
let nextId = 1;
export const dishCategories = ["Main", "Side", "Salad", "Dessert", "Drinks"];

export function createEvent({ title, date, host }) {
  const event = { id: String(nextId++), title, date, host, claims: {} };
  events.set(event.id, event);
  return event;
}

export function getEvent(id) {
  return events.get(id);
}

export function listEvents() {
  return [...events.values()];
}

export function claimDish(event, category, guestName) {
  if (!dishCategories.includes(category)) return "Invalid dish category";
  if (event.claims[category]) return `${category} is already claimed`;
  const name = guestName.trim();
  if (!name) return "Name is required";
  event.claims[category] = name;
  return null;
}
