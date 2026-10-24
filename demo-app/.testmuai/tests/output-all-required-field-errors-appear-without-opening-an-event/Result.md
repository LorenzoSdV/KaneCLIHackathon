---
test: ../all-required-field-errors-appear-without-opening-an-event_test.md
status: passed
started: 2026-10-24T20:42:09.127Z
duration_s: 54
session_id: 3f9fc5a1-5301-40e1-9259-fc6b8afc39c7
---

# All required-field errors appear without opening an event page — Result

## Step 1 ✓ passed (25.1s)
md5: 03caca264a5d0a717fe01b75e06b2e46
Open {{start_url}} in the browser and reach the Potluck Planner home page's Create event form, then assert it has event title, date and host name fields.

## Step 2 ✓ passed (25.7s)
md5: deb4b4e24435d837e31b979fa750ab2b
On the Potluck Planner home page, submit the Create event form with title, date and host name all empty, then assert the response remains on the Create event form with 'Title is required', 'Date is required' and 'Host name is required' shown and the browser URL has not opened a new /events/<id> event page.
