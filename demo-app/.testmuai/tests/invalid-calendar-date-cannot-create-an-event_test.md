---
assurance:
  id: t-4
  base: sha256:e4a1e244a3e7b6473aae79aa73d144b95f69ed213870f9d7b9f651d88b245f7c
---
# Invalid calendar date cannot create an event

> Attempt to submit an impossible calendar date and ensure no event is created; exact error wording is unspecified.

## Step 1 @verifies ac-9, ac-10, ac-11

Open {{start_url}} in the browser and reach the Potluck Planner home page's Create event form, then assert it has event title, date and host name fields.

## Step 2

On the Potluck Planner home page, attempt to submit the Create event form with title 'Assurance Invalid Date Potluck 39817', host name 'Assurance Host', and the impossible calendar date February 30 in the next calendar year, using the date field if it permits entry; a browser date control that blocks that date also prevents submission.

## Step 3 @verifies ac-19

On the Potluck Planner home page, inspect the created-events listing after the invalid-date attempt, then assert there is no event with title 'Assurance Invalid Date Potluck 39817'.
