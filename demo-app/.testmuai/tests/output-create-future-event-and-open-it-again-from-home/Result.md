---
test: ../create-future-event-and-open-it-again-from-home_test.md
status: passed
started: 2026-10-24T20:39:51.634Z
duration_s: 73
session_id: a10b6d1f-2d4e-44a2-a0df-0d7dacbd8fa2
---

# Create future event and open it again from home — Result

## Step 1 ✓ passed (1.44s)
md5: 03caca264a5d0a717fe01b75e06b2e46
Open {{start_url}} in the browser and reach the Potluck Planner home page's Create event form, then assert it has event title, date and host name fields.

## Step 2 ✓ passed (3.85s)
md5: d63b01a2879ec2dfc44bd06f6c58cae6
On the home page, submit the Create event form with title 'Assurance Future Potluck 39817', tomorrow's calendar date, and host name 'Assurance Host', then assert an event was created and its event page opened showing 'Assurance Future Potluck 39817', tomorrow's date and 'Hosted by Assurance Host', with a valid date no earlier than today.

## Step 3 ✓ passed (48.1s)
md5: cecd4bfeccf2660c73d6a13a4f9da00f
Return to the Potluck Planner home page and follow the listed title 'Assurance Future Potluck 39817', then assert the home page listed the created event by that title and the title link opened that event's page.
