---
assurance:
  id: t-23
  base: sha256:ef3f51311900678f579b6792013e85da50dd9fa8e1071fe0a1fa1703d0a8169e
---
# Two named comments appear in posting order

> Post two distinct comments sequentially on one new event and check oldest-first display plus count.

## Step 1

At {{start_url}}, open the Potluck Planner home page.

## Step 2 @verifies ac-55, ac-56, ac-57

From the home page, create an event titled 'Comment order <unique random suffix for this run>' dated today with host 'Test Host', open its event page and reach the Comments section, then assert it offers a guest name field, a comment field and a 'Post comment' button.

## Step 3

On this event page's Comments section, post 'I can bring plates' as guest 'Avery' using 'Post comment'.

## Step 4 @verifies ac-51, ac-52, ac-53

On the same event page's Comments section, post 'I can bring cups' as guest 'Blair' using 'Post comment', then assert the displayed entries 'Avery: I can bring plates' and 'Blair: I can bring cups' appear in that oldest-first order and the count reads '2 comments' for the two independently observed entries.
