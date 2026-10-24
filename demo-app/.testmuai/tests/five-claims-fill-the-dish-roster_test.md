---
assurance:
  id: t-16
  base: sha256:1aea5d8def55d74c49d7925d33d538a4d25b1b299181163af11243e2d377d595
---
# Five claims fill the dish roster

> Claim all five category slots on one event and display the complete 5 of 5 count with no remaining Claim button.

## Step 1 @verifies ac-35, ac-36, ac-37, ac-38, ac-39

At {{start_url}}, create a Potluck Planner event from the home page with title 'Dish full roster test', today's date, and host name 'Test Host'; reach its event page and Dishes section, then assert exactly five categories are listed as Main, Side, Salad, Dessert, and Drinks, the count reads '0 of 5 dishes claimed', and each category has a guest name field and Claim button.

## Step 2 @verifies ac-37, ac-38, ac-39, ac-40

On that event page's Dishes section, claim Main for Alex, then assert 'Main — claimed by Alex', '1 of 5 dishes claimed', no Claim button on Main, and guest name fields and Claim buttons on the four unclaimed categories.

## Step 3 @verifies ac-37, ac-38, ac-39, ac-40

On the same event page's Dishes section, claim Side for Blair, then assert 'Side — claimed by Blair', '2 of 5 dishes claimed', no Claim button on either claimed category, and guest name fields and Claim buttons on the three unclaimed categories.

## Step 4 @verifies ac-37, ac-38, ac-39, ac-40

On the same event page's Dishes section, claim Salad for Casey, then assert 'Salad — claimed by Casey', '3 of 5 dishes claimed', no Claim button on any claimed category, and guest name fields and Claim buttons on the two unclaimed categories.

## Step 5 @verifies ac-37, ac-38, ac-39, ac-40

On the same event page's Dishes section, claim Dessert for Dana, then assert 'Dessert — claimed by Dana', '4 of 5 dishes claimed', no Claim button on any claimed category, and a guest name field and Claim button on Drinks.

## Step 6 @verifies ac-37, ac-40

On the same event page's Dishes section, claim Drinks for Ellis, then assert 'Drinks — claimed by Ellis', '5 of 5 dishes claimed', and no claimed category has a Claim button.
