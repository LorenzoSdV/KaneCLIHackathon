---
assurance:
  id: t-20
  base: sha256:3df44993d2391af55cab7d6a46bcfa605be258fb48b9a8178d5703780043a624
---
# Stale dish claim leaves the original claimant intact

> Submit from an event page kept open before a second guest claimed the category; reject the stale attempt without replacing the original claimant.

## Step 1 @verifies ac-35, ac-36, ac-37, ac-38, ac-39

At {{start_url}}, create a Potluck Planner event from the home page with a title unique to this run (for example, 'Dish stale test' followed by a fresh random suffix), today's date, and host name 'Test Host'; reach that newly created event's page and Dishes section, then assert that exactly five categories are listed as Main, Side, Salad, Dessert, and Drinks, the count reads '0 of 5 dishes claimed', and each category has a guest name field and Claim button.

## Step 2

On the newly created event's page, store the current page URL as event_url; open a new browser tab, go to the stored event_url value in that tab, leave its Dishes section open before any claim is made, then switch back to the first tab without reloading the second tab.

## Step 3 @verifies ac-37, ac-40

In the first tab's Dishes section, claim Main as Alex, then assert the count reads '1 of 5 dishes claimed' and Main has no Claim button.

## Step 4 @verifies ac-41

Switch to the second tab without reloading it; in its still-stale Dishes section use the Claim button still shown for Main to submit a claim as Blair, then assert 'Main is already claimed' is shown.

## Step 5 @verifies ac-42, ac-37, ac-40

Switch back to the first tab without reloading the second tab and revisit its Dishes section after the rejected submission, then assert 'Main — claimed by Alex' remains, the count reads '1 of 5 dishes claimed', and Main has no Claim button.
