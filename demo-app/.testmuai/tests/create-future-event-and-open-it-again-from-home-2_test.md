---
assurance:
  id: t-19
  base: sha256:163b9c2db46564997d89270ff6ebe21860973a2c2419057e55f0adb9ace14cee
---
# Create future event and open it again from home

> Submit a complete form with a valid future date; see the new event details, return home and follow its listed title to its event page.

## Step 1 @verifies ac-9, ac-10, ac-11

Open {{start_url}} in the browser and reach the Potluck Planner home page's Create event form, then assert it has event title, date and host name fields.

## Step 2 @verifies ac-1, ac-2, ac-3, ac-4, ac-5, ac-6

On the home page, submit the Create event form with title 'Assurance Future Potluck 39817', tomorrow's calendar date, and host name 'Assurance Host', then assert an event was created and its event page opened showing 'Assurance Future Potluck 39817', tomorrow's date and 'Hosted by Assurance Host', with a valid date no earlier than today.

## Step 3 @verifies ac-7

Return to the Potluck Planner home page and locate the created event in its event list, then assert the exact title 'Assurance Future Potluck 39817' is listed there.

## Step 4 @verifies ac-8

On the Potluck Planner home page, open the listed event title 'Assurance Future Potluck 39817', then assert the page now on screen is that event's page showing 'Assurance Future Potluck 39817' as its title.
