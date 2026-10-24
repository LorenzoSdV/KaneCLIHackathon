---
test: ../today-s-date-is-accepted-for-a-created-event_test.md
status: passed
started: 2026-10-24T20:39:53.520Z
duration_s: 125
session_id: 5e788807-9884-4022-8320-2a79ac1dbd08
---

# Today's date is accepted for a created event — Result

## Step 1 ✓ passed (0.94s)
md5: 03caca264a5d0a717fe01b75e06b2e46
Open {{start_url}} in the browser and reach the Potluck Planner home page's Create event form, then assert it has event title, date and host name fields.

## Step 2 ✓ passed (42.8s)
md5: 79533edbc3f6661ee94ba633d07fa46a
On the home page, submit the Create event form with title 'Assurance Today Potluck 39817', today's calendar date and host name 'Assurance Host', then assert an event was created and its event page opened showing 'Assurance Today Potluck 39817', today's valid calendar date and 'Hosted by Assurance Host'.

## Step 3 ✓ passed (59.6s)
md5: ed15ec6176b2a46ef8016a28ca85ebfe
Return to the Potluck Planner home page and follow the listed title 'Assurance Today Potluck 39817', then assert the home page listed this created event by title and its title link opened its event page.
