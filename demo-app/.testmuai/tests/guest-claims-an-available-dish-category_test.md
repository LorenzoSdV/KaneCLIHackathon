---
assurance:
  id: t-15
  base: sha256:d5e04b119a3454e639b906aa529f7813e25bd80ca6779a030d4b8fe4d556dead
---
# Guest claims an available dish category

> A guest claims an available category and the event page displays the claimant, updated count and absence of its Claim button.

## Step 1 @verifies ac-35, ac-36, ac-37, ac-38, ac-39

At {{start_url}}, create a Potluck Planner event from the home page with title 'Dish available test', today's date, and host name 'Test Host'; reach its event page and Dishes section, then assert exactly five categories are listed as Main, Side, Salad, Dessert, and Drinks, the count reads '0 of 5 dishes claimed', and each category has a guest name field and Claim button.

## Step 2 @verifies ac-45, ac-37, ac-40, ac-38, ac-39

On that event page's Dishes section, claim Main with guest name Alex, then assert 'Main — claimed by Alex' appears, the count reads '1 of 5 dishes claimed', Main has no Claim button, and each other unclaimed category still has a guest name field and Claim button.
