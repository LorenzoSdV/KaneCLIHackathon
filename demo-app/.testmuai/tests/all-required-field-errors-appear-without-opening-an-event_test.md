---
assurance:
  id: t-17
  base: sha256:6fd2073ffbe67058e627ac27f6b053b5812840111ee83886fe4655e3cb3c9638
---
# All required-field errors appear without opening an event page

> Submit with title, date and host name empty; show all three specified errors without creating an event.

## Step 1 @verifies ac-9, ac-10, ac-11

Open {{start_url}} in the browser and reach the Potluck Planner home page's Create event form, then assert it has event title, date and host name fields.

## Step 2 @verifies ac-15, ac-16, ac-17, ac-46

On the Potluck Planner home page, submit the Create event form with title, date and host name all empty, then assert the response remains on the Create event form with 'Title is required', 'Date is required' and 'Host name is required' shown and the browser URL has not opened a new /events/<id> event page.
