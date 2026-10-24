---
test: ../empty-date-gets-required-error-and-keeps-other-inputs-2_test.md
status: passed
started: 2026-10-24T20:42:09.498Z
duration_s: 86
session_id: 51ab0d47-c00e-4fe6-95df-ed48902ef7aa
---

# Empty date gets required error and keeps other inputs — Result

## Step 1 ✓ passed (21s)
md5: 03caca264a5d0a717fe01b75e06b2e46
Open {{start_url}} in the browser and reach the Potluck Planner home page's Create event form, then assert it has event title, date and host name fields.

## Step 2 ✓ passed (40.1s)
md5: 3744dd4f476120ce1a81d0243da5435f
On the home page, submit the Create event form with a freshly generated title consisting of 'Assurance Missing Date Potluck ' followed by a random string unique to this test run, an empty date and host name 'Assurance Host', then assert 'Date is required' is shown and the exact entered title and host name remain in their fields.

## Step 3 ✓ passed (21.8s)
md5: 7a8c6e750dd7f0eb6cad3588173345db
On the Potluck Planner home page after that empty-date rejection, inspect the created-events listing for the exact run-unique title submitted in the preceding step, then assert no event with that exact title is listed.
