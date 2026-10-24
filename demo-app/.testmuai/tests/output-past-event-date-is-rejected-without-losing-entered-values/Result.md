---
test: ../past-event-date-is-rejected-without-losing-entered-values_test.md
status: passed
started: 2026-10-24T20:22:41.336Z
duration_s: 84
session_id: 0d28855a-9f7f-4987-b6f7-3d6fee8b345e
---

# Past event date is rejected without losing entered values — Result

## Step 1 ✓ passed (23.3s)
md5: 03caca264a5d0a717fe01b75e06b2e46
Open {{start_url}} in the browser and reach the Potluck Planner home page's Create event form, then assert it has event title, date and host name fields.

## Step 2 ✓ passed (35s)
md5: 7fd916fa28d840a24c788e67bed4e6fa
On the home page, submit the Create event form with title 'Assurance Past Potluck 39817', yesterday's calendar date and host name 'Assurance Host', then assert the error reads 'Date must be today or later' and all three entered values remain in their form fields.

## Step 3 ✓ passed (22.9s)
md5: d2d15576d74d5df1402fb4a5a4047092
On the Potluck Planner home page, inspect the created-events listing after the rejected submission, then assert no event with title 'Assurance Past Potluck 39817' was created.
