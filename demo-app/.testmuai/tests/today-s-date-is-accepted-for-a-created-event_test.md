---
assurance:
  id: t-5
  base: sha256:2ec3992850b6ef7908ef59f0ed80511d158fe75a2763b65a94703057e70bea0d
---
# Today's date is accepted for a created event

> Submit valid fields with date today to prove today is accepted at the inclusive lower boundary.

## Step 1 @verifies ac-9, ac-10, ac-11

Open {{start_url}} in the browser and reach the Potluck Planner home page's Create event form, then assert it has event title, date and host name fields.

## Step 2 @verifies ac-1, ac-2, ac-3, ac-4, ac-5, ac-6, ac-20

On the home page, submit the Create event form with title 'Assurance Today Potluck 39817', today's calendar date and host name 'Assurance Host', then assert an event was created and its event page opened showing 'Assurance Today Potluck 39817', today's valid calendar date and 'Hosted by Assurance Host'.

## Step 3 @verifies ac-7, ac-8

Return to the Potluck Planner home page and follow the listed title 'Assurance Today Potluck 39817', then assert the home page listed this created event by title and its title link opened its event page.
