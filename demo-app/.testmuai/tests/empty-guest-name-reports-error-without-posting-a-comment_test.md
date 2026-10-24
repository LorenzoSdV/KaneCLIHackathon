---
assurance:
  id: t-21
  base: sha256:2cbc64a3c9c1e5eb44f79a9ae0708d51d0b63b8c27fc721408ddd497bc04dfe3
---
# Empty guest name reports error without posting a comment

> With comment text entered but no guest name, display Name is required without adding a comment to this event.

## Step 1

At {{start_url}}, open the Potluck Planner home page.

## Step 2 @verifies ac-55, ac-56, ac-57

From the home page, create an event titled 'Comment name validation <unique random suffix for this run>' dated today with host 'Test Host', open its event page and reach the Comments section, then assert it offers a guest name field, a comment field and a 'Post comment' button.

## Step 3

capture baseline: event comment count on this newly created event page's Comments section

## Step 4 @verifies ac-47, ac-48, ac-53

On this event page's Comments section, leave the guest name empty, enter 'I can bring fruit' in the comment field and submit with 'Post comment', then assert the exact error 'Name is required', the event comment count changed by 0 from the captured baseline, and '0 comments' matches the zero comments displayed for this event.
