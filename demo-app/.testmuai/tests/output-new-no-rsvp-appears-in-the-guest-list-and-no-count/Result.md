---
test: ../new-no-rsvp-appears-in-the-guest-list-and-no-count_test.md
status: failed
started: 2026-10-24T20:21:27.837Z
duration_s: 70
session_id: fc9cbc2d-d4d6-4658-bf7f-9d52fbf2209a
---

# New No RSVP appears in the guest list and No count — Result

## Step 1 ✓ passed (25.9s)
md5: 6a5c2ff91dff1713cb69abcdae1a0450
At {{start_url}}, on the Potluck Planner home page, create an event titled 'RSVP No test' dated today with host 'Test Host' and reach its event page.

## Step 2 ✗ failed (41.3s)
md5: ad83841e3a8d7ea612e22f5c5005f187
Reason: AP determined agent is stuck — no viable actions remain — bug verdict: Event RSVP choices are missing [application_issue/functional_defect, confidence 0.94]
On that event page, inspect the RSVP section before answering, then assert Yes, No, and Maybe are offered with none selected.

## Step 3 ⏭ skipped
