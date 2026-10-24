---
assurance:
  id: t-12
  base: sha256:aa9f8e36da470379d3c616221fa2ef9eec0989f258e971553dde5e8fa2bf8b30
---
# New Maybe RSVP appears in the guest list and Maybe count

> Submit Maybe for a new guest and check their list entry and Maybe count.

## Step 1

At {{start_url}}, on the Potluck Planner home page, create an event titled 'RSVP Maybe test' dated today with host 'Test Host' and reach its event page.

## Step 2 @verifies ac-33, ac-34

On that event page, inspect the RSVP section before answering, then assert Yes, No, and Maybe are offered with none selected.

## Step 3 @verifies ac-27, ac-28

On the event page's RSVP section, submit guest name 'Eli' with Maybe, then assert Eli appears alongside Maybe in the guest list and the counts read 'Yes: 0 · No: 0 · Maybe: 1'.
