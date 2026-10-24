---
test: ../new-maybe-rsvp-appears-in-the-guest-list-and-maybe-count_test.md
status: failed
started: 2026-10-24T20:21:21.973Z
duration_s: 76
session_id: e0dc4100-1e53-40dd-a040-144900d3f2a4
---

# New Maybe RSVP appears in the guest list and Maybe count — Result

## Step 1 ✓ passed (25.1s)
md5: ba89469ffadd0d4f581f771b438054af
At {{start_url}}, on the Potluck Planner home page, create an event titled 'RSVP Maybe test' dated today with host 'Test Host' and reach its event page.

## Step 2 ✗ failed (47.9s)
md5: ad83841e3a8d7ea612e22f5c5005f187
Reason: Final verification failed: "Yes, No, and Maybe are offered with none selected." — bug verdict: RSVP assertion made without verifying the RSVP controls [automation_bug/agent_misstep, confidence 0.95]
On that event page, inspect the RSVP section before answering, then assert Yes, No, and Maybe are offered with none selected.

## Step 3 ⏭ skipped
