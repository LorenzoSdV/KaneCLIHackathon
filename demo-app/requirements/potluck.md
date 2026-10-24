# Potluck Planner — Product Requirements

Potluck Planner is a small web app that lets a host create a potluck event and share one page with guests. Guests use that page to say whether they are coming and what they will bring.

The app runs locally at a single base URL. There are no accounts: a guest identifies themselves by typing their name.

## Core: Create an event (already built)

A host creates a potluck from the home page.

- The home page has a "Create event" form with three fields: event title, date, and host name.
- Submitting the form creates the event and opens its event page.
- The event page shows the event title, the date, and "Hosted by <host name>".
- The home page lists every created event by title, and each title links to its event page.
- Submitting the form with an empty title shows the error "Title is required" and creates no event.

## Feature A: RSVP

Guests tell the host whether they are coming.

- The event page has an "RSVP" section with a guest name field and three choices: Yes, No, Maybe.
- Submitting an RSVP adds the guest to the event's guest list with their choice.
- The event page shows the counts in the form "Yes: N · No: N · Maybe: N", updated after each RSVP.
- The event page lists each guest who answered, with their choice next to their name.
- If a guest with the same name (case-insensitive) RSVPs again, their previous choice is replaced; the guest appears only once and the counts reflect only the latest choice.
- Submitting an RSVP with an empty guest name shows the error "Name is required" and changes nothing.

## Feature B: Dish claims

Guests claim what they will bring so the potluck has no duplicates.

- The event page has a "Dishes" section listing five categories: Main, Side, Salad, Dessert, Drinks.
- Each unclaimed category shows a guest name field and a "Claim" button.
- Claiming a category with a guest name marks it as claimed and shows "<Category> — claimed by <guest name>".
- A claimed category no longer shows the "Claim" button, so it cannot be claimed twice.
- If a claim for an already-claimed category is submitted anyway (for example, from a stale page), it is rejected with the error "<Category> is already claimed" and the original claim is kept.
- The section shows "N of 5 dishes claimed".
- Claiming with an empty guest name shows the error "Name is required" and claims nothing.
