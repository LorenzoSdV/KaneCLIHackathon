---
assurance:
  id: t-1
  base: sha256:16e0447b98c4f7d238bc990a3cff4ce8306d3fcc500441d8670a3363d931701a
---
# Create future event and open it again from home

> Submit a complete form with a valid future date; see the new event details, return home and follow its listed title to its event page.

## Step 1 @verifies ac-9, ac-10, ac-11

Open {{start_url}} in the browser and reach the Potluck Planner home page's Create event form, then assert it has event title, date and host name fields.

## Step 2 @verifies ac-1, ac-2, ac-3, ac-4, ac-5, ac-6

On the home page, submit the Create event form with title 'Assurance Future Potluck 39817', tomorrow's calendar date, and host name 'Assurance Host', then assert an event was created and its event page opened showing 'Assurance Future Potluck 39817', tomorrow's date and 'Hosted by Assurance Host', with a valid date no earlier than today.

## Step 3 @verifies ac-7, ac-8

Return to the Potluck Planner home page and follow the listed title 'Assurance Future Potluck 39817', then assert the home page listed the created event by that title and the title link opened that event's page.
