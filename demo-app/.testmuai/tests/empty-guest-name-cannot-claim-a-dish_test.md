---
assurance:
  id: t-14
  base: sha256:0a4a3b59f82d3b664cae1dbed8bc02d58caf8eb3bc53c4eea69b1bbebcdd8ac2
---
# Empty guest name cannot claim a dish

> Submit an available category with no guest name and show the specified error without making a claim.

## Step 1 @verifies ac-35, ac-36, ac-37, ac-38, ac-39

At {{start_url}}, create a Potluck Planner event from the home page with title 'Dish empty name test', today's date, and host name 'Test Host'; reach its event page and Dishes section, then assert exactly five categories are listed as Main, Side, Salad, Dessert, and Drinks, the count reads '0 of 5 dishes claimed', and each category has a guest name field and Claim button.

## Step 2 @verifies ac-43, ac-44, ac-37, ac-38, ac-39

On that event page's Dishes section, submit the Claim control for Main without a guest name, then assert 'Name is required' appears, no category is claimed, '0 of 5 dishes claimed' remains, and all five categories still have guest name fields and Claim buttons.
