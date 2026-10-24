---
assurance:
  id: t-8
  base: sha256:e848b2e3abb9856865bad890e85c2b901a4afb4e2166b59938ae82a1712e088c
---
# Empty RSVP name reports error without changing the event

> Submitting a selected Yes with an empty guest name reports the name error and leaves existing responses intact.

## Step 1

At {{start_url}}, on the Potluck Planner home page, create an event titled 'RSVP empty name test' dated today with host 'Test Host' and reach its event page.

## Step 2 @verifies ac-34

On that event page inspect the RSVP section, then assert Yes, No, and Maybe are offered.

## Step 3

capture baseline: guest-list entries and Yes/No/Maybe counts on the event page

## Step 4 @verifies ac-29, ac-30

On the event page's RSVP section, submit an empty guest name with Yes selected, then assert 'Name is required' appears and there is no new or changed guest-list entry or response count relative to the captured baseline.
