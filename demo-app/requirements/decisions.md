# Potluck Planner — Product Decisions

Decisions that resolve open questions in the Potluck Planner requirements (potluck.md). Where they apply, they extend those requirements.

## Event date must be today or later (Core: Create an event)

- The event date must be a valid calendar date that is today or later.
- Submitting the form with a date in the past shows the error "Date must be today or later" and creates no event; the values already typed stay in the form.
- An empty date still shows "Date is required".

## An RSVP needs a choice (Feature A: RSVP)

- The guest must pick one of Yes, No, or Maybe; no choice is selected by default.
- Submitting an RSVP without a choice shows the error "Choose Yes, No, or Maybe" and changes nothing.
