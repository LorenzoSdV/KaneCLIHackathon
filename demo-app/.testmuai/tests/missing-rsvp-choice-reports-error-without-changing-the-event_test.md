---
assurance:
  id: t-9
  base: sha256:d167f784800e882cf31f014ba6de2c889ca07d7e675efcd77de383b4e188c6e1
---
# Missing RSVP choice reports error without changing the event

> With no RSVP choice preselected, entering a name but no choice reports the choice error without modifying existing responses.

## Step 1

At {{start_url}}, on the Potluck Planner home page, create an event titled 'RSVP missing choice test' dated today with host 'Test Host' and reach its event page.

## Step 2 @verifies ac-33, ac-34

On that event page, inspect the RSVP section before answering, then assert Yes, No, and Maybe are offered with none selected.

## Step 3

capture baseline: guest-list entries and Yes/No/Maybe counts on the event page

## Step 4 @verifies ac-31, ac-32

On the event page's RSVP section, submit guest name 'Bob' without selecting a response, then assert 'Choose Yes, No, or Maybe' appears and there is no new or changed guest-list entry or response count relative to the captured baseline.
