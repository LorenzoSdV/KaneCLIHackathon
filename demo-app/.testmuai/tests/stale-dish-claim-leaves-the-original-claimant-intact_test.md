---
assurance:
  id: t-13
  base: sha256:f094dd3e3a27a0884e861b6cbf62673f674ee09910e4909d11345c5425741062
---
# Stale dish claim leaves the original claimant intact

> Submit from an event page kept open before a second guest claimed the category; reject the stale attempt without replacing the original claimant.

## Step 1 @verifies ac-35, ac-36, ac-37, ac-38, ac-39

At {{start_url}}, create a Potluck Planner event from the home page with title 'Dish stale test', today's date, and host name 'Test Host'; reach its event page and Dishes section, then assert that exactly five categories are listed as Main, Side, Salad, Dessert, and Drinks, the count reads '0 of 5 dishes claimed', and each category has a guest name field and Claim button.

## Step 2

On that event page, leave a second browser tab open on the same event page before any dish claim is submitted.

## Step 3 @verifies ac-37, ac-40

In the first tab's Dishes section, claim Main as Alex, then assert the count reads '1 of 5 dishes claimed' and Main has no Claim button.

## Step 4 @verifies ac-41

In the still-open second tab's Dishes section, submit its stale claim for Main as Blair, then assert 'Main is already claimed' is shown.

## Step 5 @verifies ac-42, ac-37, ac-40

Return to the first tab's event page and revisit its Dishes section after the rejected submission, then assert 'Main — claimed by Alex' remains, the count reads '1 of 5 dishes claimed', and Main has no Claim button.
