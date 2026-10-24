---
assurance:
  id: t-10
  base: sha256:486ed43a225a6962be81b973440613a44b9d0a6cfef7e1d4acda811631e79e98
---
# New Yes RSVP appears in the guest list and Yes count

> Submit Yes for a new guest and check their list entry and Yes count.

## Step 1

At {{start_url}}, on the Potluck Planner home page, create an event titled 'RSVP Yes test' dated today with host 'Test Host' and reach its event page.

## Step 2 @verifies ac-33, ac-34

On that event page, inspect the RSVP section before answering, then assert Yes, No, and Maybe are offered with none selected.

## Step 3 @verifies ac-27, ac-28

On the event page's RSVP section, submit guest name 'Cora' with Yes, then assert Cora appears alongside Yes in the guest list and the counts read 'Yes: 1 · No: 0 · Maybe: 0'.
