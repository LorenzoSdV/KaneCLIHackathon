---
test: ../all-required-field-errors-appear-without-event-creation_test.md
status: failed
started: 2026-10-24T20:18:08.151Z
duration_s: 116
session_id: 7ddbe900-7711-4262-ba0f-32c5b98be9ac
---

# All required-field errors appear without event creation — Result

## Step 1 ✓ passed (23.9s)
md5: 03caca264a5d0a717fe01b75e06b2e46
Open {{start_url}} in the browser and reach the Potluck Planner home page's Create event form, then assert it has event title, date and host name fields.

## Step 2 ✓ passed (22.2s)
md5: 2c22a70755e480b29da764b5b3432f36
capture baseline: number of created events listed on the Potluck Planner home page

## Step 3 ✓ passed (22.2s)
md5: dd11ec2dacd19c28a600113b6c11b2eb
On the Potluck Planner home page, submit the Create event form with title, date and host name all empty, then assert 'Title is required', 'Date is required' and 'Host name is required' are all shown.

## Step 4 ✗ failed (40.7s)
md5: 2125abe5c63a0a60343398c3f8712382
Reason: Final verification failed: "{{current_created_event_count}} changed by 0 from {{created_event_count}}." — bug verdict: Created-event count baseline is stale [automation_bug/test_data_issue, confidence 0.80]
On the Potluck Planner home page, inspect the created-events listing after that rejected submission, then assert its event count changed by 0 from the captured baseline.
