---
assurance:
  id: t-24
  base: sha256:a0b1c9a701c4344605ac611cd523b680db13188c379c43c369c251924f1e0dd5
---
# First named comment changes fresh event count from zero to one

> Observe the empty event's zero count, then post a named comment and check its displayed content and count.

## Step 1

At {{start_url}}, open the Potluck Planner home page.

## Step 2 @verifies ac-55, ac-56, ac-57, ac-54

From the home page, create an event titled 'First comment <unique random suffix for this run>' dated today with host 'Test Host', open its event page and reach the Comments section, then assert it offers a guest name field, a comment field, a 'Post comment' button and the exact count '0 comments' before any post.

## Step 3 @verifies ac-51, ac-53

On this new event page's Comments section, enter 'Casey' as guest name and 'I will bring napkins' as comment, then post with 'Post comment' and assert 'Casey: I will bring napkins' appears and the count reads '1 comments' for the one independently observed entry.
