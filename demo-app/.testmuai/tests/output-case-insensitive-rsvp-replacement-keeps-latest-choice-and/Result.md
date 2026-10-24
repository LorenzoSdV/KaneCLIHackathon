---
test: ../case-insensitive-rsvp-replacement-keeps-latest-choice-and_test.md
status: failed
started: 2026-10-24T20:18:08.974Z
duration_s: 74
session_id: c94a2581-fb8d-46bc-8c00-4491412bf508
---

# Case-insensitive RSVP replacement keeps latest choice and counts — Result

## Step 1 ✓ passed (29.6s)
md5: 634c1f23d10f28773a6f3509287ec47f
At {{start_url}}, on the Potluck Planner home page, create an event titled 'RSVP replacement test' dated today with host 'Test Host' and reach its event page.

## Step 2 ✗ failed (38.5s)
md5: ad83841e3a8d7ea612e22f5c5005f187
Reason: AP determined agent is stuck — no viable actions remain — bug verdict: RSVP assertion started on an event without RSVP controls [automation_bug/state_transition_bug, confidence 0.88]
On that event page, inspect the RSVP section before answering, then assert Yes, No, and Maybe are offered with none selected.

## Step 3 ⏭ skipped

## Step 4 ⏭ skipped
