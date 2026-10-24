---
test: ../missing-rsvp-choice-reports-error-without-changing-the-event_test.md
status: failed
started: 2026-10-24T20:20:59.446Z
duration_s: 56
session_id: 180bc564-8d53-4c33-bf83-fe727c94aa50
---

# Missing RSVP choice reports error without changing the event — Result

## Step 1 ✓ passed (25s)
md5: 47d34840e86b427a95d850e3b04cc264
At {{start_url}}, on the Potluck Planner home page, create an event titled 'RSVP missing choice test' dated today with host 'Test Host' and reach its event page.

## Step 2 ✗ failed (28.5s)
md5: ad83841e3a8d7ea612e22f5c5005f187
Reason: AP determined agent is stuck — no viable actions remain — bug verdict: Event page omits RSVP response choices [application_issue/ui_data_defect, confidence 0.94]
On that event page, inspect the RSVP section before answering, then assert Yes, No, and Maybe are offered with none selected.

## Step 3 ⏭ skipped

## Step 4 ⏭ skipped
