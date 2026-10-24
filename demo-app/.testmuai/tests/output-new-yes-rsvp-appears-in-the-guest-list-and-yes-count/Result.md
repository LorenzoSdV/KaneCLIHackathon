---
test: ../new-yes-rsvp-appears-in-the-guest-list-and-yes-count_test.md
status: failed
started: 2026-10-24T20:22:04.997Z
duration_s: 67
session_id: d0a8f2e8-8899-4576-aa9c-5002d2e25716
---

# New Yes RSVP appears in the guest list and Yes count — Result

## Step 1 ✓ passed (36.3s)
md5: 4d8393f316841bbc6921145bbc9598bb
At {{start_url}}, on the Potluck Planner home page, create an event titled 'RSVP Yes test' dated today with host 'Test Host' and reach its event page.

## Step 2 ✗ failed (27.9s)
md5: ad83841e3a8d7ea612e22f5c5005f187
Reason: AP determined agent is stuck — no viable actions remain — bug verdict: Event detail page omits RSVP choices [application_issue/ui_state_mismatch, confidence 0.97]
On that event page, inspect the RSVP section before answering, then assert Yes, No, and Maybe are offered with none selected.

## Step 3 ⏭ skipped
