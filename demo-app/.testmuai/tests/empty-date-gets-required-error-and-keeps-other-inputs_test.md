---
assurance:
  id: t-6
  base: sha256:6dfb3884b07ec84ca1cc2dc3a73f21bd0cde4818f48fa00624009e43f79e59de
---
# Empty date gets required error and keeps other inputs

> Submit valid title and host name but empty date; show the empty-date error instead of the past-date error, retain typed values and create no event.

## Step 1 @verifies ac-9, ac-10, ac-11

Open {{start_url}} in the browser and reach the Potluck Planner home page's Create event form, then assert it has event title, date and host name fields.

## Step 2 @verifies ac-21, ac-23

On the home page, submit the Create event form with title 'Assurance Missing Date Potluck 39817', an empty date and host name 'Assurance Host', then assert 'Date is required' is shown and the entered title and host name remain in their fields.

## Step 3 @verifies ac-22

On the Potluck Planner home page, inspect the created-events listing after the empty-date rejection, then assert no event with title 'Assurance Missing Date Potluck 39817' was created.
