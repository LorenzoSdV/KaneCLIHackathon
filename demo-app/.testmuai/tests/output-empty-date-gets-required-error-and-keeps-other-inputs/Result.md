---
test: ../empty-date-gets-required-error-and-keeps-other-inputs_test.md
status: passed
started: 2026-10-24T20:18:10.531Z
duration_s: 88
session_id: 16b7f841-cc46-42d4-b7bc-440851cb6c30
---

# Empty date gets required error and keeps other inputs — Result

## Step 1 ✓ passed (23.4s)
md5: 03caca264a5d0a717fe01b75e06b2e46
Open {{start_url}} in the browser and reach the Potluck Planner home page's Create event form, then assert it has event title, date and host name fields.

## Step 2 ✓ passed (30.8s)
md5: 068b8fa3bd1e1e4c2e4617d2cfb6e44f
On the home page, submit the Create event form with title 'Assurance Missing Date Potluck 39817', an empty date and host name 'Assurance Host', then assert 'Date is required' is shown and the entered title and host name remain in their fields.

## Step 3 ✓ passed (29.7s)
md5: 0b820f672f4b185f39cd59b8b00766db
On the Potluck Planner home page, inspect the created-events listing after the empty-date rejection, then assert no event with title 'Assurance Missing Date Potluck 39817' was created.
