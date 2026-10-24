---
assurance:
  id: t-2
  base: sha256:25ca61fe1daa2bde4ac320a87490b3e98811acc41a84899ea78ba6c810853e67
---
# Past event date is rejected without losing entered values

> Submit otherwise valid event with a date one calendar day before today; see specified past-date error, no created event and retained entries.

## Step 1 @verifies ac-9, ac-10, ac-11

Open {{start_url}} in the browser and reach the Potluck Planner home page's Create event form, then assert it has event title, date and host name fields.

## Step 2 @verifies ac-12, ac-14

On the home page, submit the Create event form with title 'Assurance Past Potluck 39817', yesterday's calendar date and host name 'Assurance Host', then assert the error reads 'Date must be today or later' and all three entered values remain in their form fields.

## Step 3 @verifies ac-13

On the Potluck Planner home page, inspect the created-events listing after the rejected submission, then assert no event with title 'Assurance Past Potluck 39817' was created.
