---
assurance:
  id: t-22
  base: sha256:6e0bbb12f3f42833c1d58c27e4f8bf87eabb45d4a7a528d6a9e1c420d274e44a
---
# Empty comment reports error without posting a comment

> With a guest name entered but no comment text, display Comment is required without adding a comment to this event.

## Step 1

At {{start_url}}, open the Potluck Planner home page.

## Step 2 @verifies ac-55, ac-56, ac-57

From the home page, create an event titled 'Comment text validation <unique random suffix for this run>' dated today with host 'Test Host', open its event page and reach the Comments section, then assert it offers a guest name field, a comment field and a 'Post comment' button.

## Step 3

capture baseline: event comment count on this newly created event page's Comments section

## Step 4 @verifies ac-49, ac-50, ac-53

On this event page's Comments section, enter 'Morgan' as guest name, leave the comment field empty and submit with 'Post comment', then assert the exact error 'Comment is required', the event comment count changed by 0 from the captured baseline, and '0 comments' matches the zero comments displayed for this event.
