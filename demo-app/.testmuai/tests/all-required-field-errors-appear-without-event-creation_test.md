---
assurance:
  id: t-3
  base: sha256:b494205f709198baf7355b4950a2d9abd2d33510cd675a2d809acf81b8f54dfa
---
# All required-field errors appear without event creation

> Submit with title, date and host name empty; show all three specified errors without creating an event.

## Step 1 @verifies ac-9, ac-10, ac-11

Open {{start_url}} in the browser and reach the Potluck Planner home page's Create event form, then assert it has event title, date and host name fields.

## Step 2

capture baseline: number of created events listed on the Potluck Planner home page

## Step 3 @verifies ac-15, ac-16, ac-17

On the Potluck Planner home page, submit the Create event form with title, date and host name all empty, then assert 'Title is required', 'Date is required' and 'Host name is required' are all shown.

## Step 4 @verifies ac-18

On the Potluck Planner home page, inspect the created-events listing after that rejected submission, then assert its event count changed by 0 from the captured baseline.
