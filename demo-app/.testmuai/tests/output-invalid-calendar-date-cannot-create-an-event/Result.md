---
test: ../invalid-calendar-date-cannot-create-an-event_test.md
status: passed
started: 2026-10-24T20:20:39.038Z
duration_s: 114
session_id: d9753afc-6a54-49a7-a4cf-7182f3ec28f2
---

# Invalid calendar date cannot create an event — Result

## Step 1 ✓ passed (27.1s)
md5: 03caca264a5d0a717fe01b75e06b2e46
Open {{start_url}} in the browser and reach the Potluck Planner home page's Create event form, then assert it has event title, date and host name fields.

## Step 2 ✓ passed (58.8s)
md5: ebabe6944dce9a43a7ebf8b2f51f95ae
On the Potluck Planner home page, attempt to submit the Create event form with title 'Assurance Invalid Date Potluck 39817', host name 'Assurance Host', and the impossible calendar date February 30 in the next calendar year, using the date field if it permits entry; a browser date control that blocks that date also prevents submission.

## Step 3 ✓ passed (25.4s)
md5: 0976b637ee414301d4e925c2a76dd61c
On the Potluck Planner home page, inspect the created-events listing after the invalid-date attempt, then assert there is no event with title 'Assurance Invalid Date Potluck 39817'.
