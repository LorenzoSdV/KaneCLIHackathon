---
assurance:
  id: t-26
  base: sha256:77ef13d0242ace181cabddd5e3ece88c1723df9f59869ad64b4ca4ac65b1545d
---
# Empty guest name leaves dietary needs unchanged

> On a fresh event, attempt to save Vegetarian with an empty name and prove the stated error and unchanged dietary section.

## Step 1 @verifies ac-58

At {{start_url}}, create a Potluck Planner event with a unique title, today's date and host 'Test Host'; reach its event page and assert the Dietary needs section offers a guest name field, Vegetarian, Vegan, Gluten-free, Nut-free and Save dietary need.

## Step 2

capture baseline: dietary section list and per-choice counts on this event page

## Step 3 @verifies ac-60, ac-61, ac-65, ac-66

On this event page, attempt Save dietary need with an empty guest name and Vegetarian selected, then assert 'Name is required' appears and the dietary list and per-choice counts remain at the captured baseline, with the totals displayed in 'Vegetarian: N · Vegan: N · Gluten-free: N · Nut-free: N' order and each total matching the current list.
