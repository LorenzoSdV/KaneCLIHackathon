---
assurance:
  id: t-7
  base: sha256:a9cb1276ec2744b3a8ede0661687a80449aa620398cf7a1cf2ac59f65e8e9e9c
---
# Case-insensitive RSVP replacement keeps latest choice and counts

> A returning guest changes Yes to No under a differently cased version of their name, leaving one entry and only the latest response counted.

## Step 1

At {{start_url}}, on the Potluck Planner home page, create an event titled 'RSVP replacement test' dated today with host 'Test Host' and reach its event page.

## Step 2 @verifies ac-33, ac-34

On that event page, inspect the RSVP section before answering, then assert Yes, No, and Maybe are offered with none selected.

## Step 3 @verifies ac-27, ac-28

On the event page's RSVP section, submit guest name 'Alice' with Yes, then assert Alice appears alongside Yes in the guest list and the event counts read 'Yes: 1 · No: 0 · Maybe: 0'.

## Step 4 @verifies ac-24, ac-25, ac-26, ac-27, ac-28

On the same event page's RSVP section, submit guest name 'ALICE' with No, then assert the guest list has exactly one case-insensitively matching Alice entry showing the latest choice No, and counts read 'Yes: 0 · No: 1 · Maybe: 0' with no stale Yes counted for Alice.
