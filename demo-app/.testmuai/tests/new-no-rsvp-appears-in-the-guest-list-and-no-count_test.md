---
assurance:
  id: t-11
  base: sha256:108748c64859f688e8e81a53c012843879c14b5381a825224e9b1fcfc8d398f3
---
# New No RSVP appears in the guest list and No count

> Submit No for a new guest and check their list entry and No count.

## Step 1

At {{start_url}}, on the Potluck Planner home page, create an event titled 'RSVP No test' dated today with host 'Test Host' and reach its event page.

## Step 2 @verifies ac-33, ac-34

On that event page, inspect the RSVP section before answering, then assert Yes, No, and Maybe are offered with none selected.

## Step 3 @verifies ac-27, ac-28

On the event page's RSVP section, submit guest name 'Dara' with No, then assert Dara appears alongside No in the guest list and the counts read 'Yes: 0 · No: 1 · Maybe: 0'.
