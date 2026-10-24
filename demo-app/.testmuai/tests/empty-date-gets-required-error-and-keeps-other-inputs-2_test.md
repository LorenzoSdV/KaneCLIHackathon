---
assurance:
  id: t-18
  base: sha256:1a127f60578ad56d1801e5fbf86ff931ea38c8fc0955ce837d661b98738675de
---
# Empty date gets required error and keeps other inputs

> Submit valid title and host name but empty date; show the empty-date error instead of the past-date error, retain typed values and create no event.

## Step 1 @verifies ac-9, ac-10, ac-11

Open {{start_url}} in the browser and reach the Potluck Planner home page's Create event form, then assert it has event title, date and host name fields.

## Step 2 @verifies ac-21, ac-23

On the home page, submit the Create event form with a freshly generated title consisting of 'Assurance Missing Date Potluck ' followed by a random string unique to this test run, an empty date and host name 'Assurance Host', then assert 'Date is required' is shown and the exact entered title and host name remain in their fields.

## Step 3 @verifies ac-22

On the Potluck Planner home page after that empty-date rejection, inspect the created-events listing for the exact run-unique title submitted in the preceding step, then assert no event with that exact title is listed.
