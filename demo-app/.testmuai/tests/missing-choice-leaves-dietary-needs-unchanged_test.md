---
assurance:
  id: t-27
  base: sha256:5ae24de954be40e7e2b564fa8619df524fbd2cc1893dc10bb9b2c331b19fa9d9
---
# Missing choice leaves dietary needs unchanged

> On a fresh event, attempt to save a named guest without selecting a dietary choice and prove the stated error and unchanged dietary section.

## Step 1 @verifies ac-58

At {{start_url}}, create a Potluck Planner event with a unique title, today's date and host 'Test Host'; reach its event page and assert the Dietary needs section offers a guest name field, Vegetarian, Vegan, Gluten-free, Nut-free and Save dietary need.

## Step 2

capture baseline: dietary section list and per-choice counts on this event page

## Step 3 @verifies ac-60, ac-61, ac-67, ac-68

On this event page, attempt Save dietary need for guest 'Jordan' without any dietary choice selected, then assert 'Choose a dietary need' appears and the dietary list and per-choice counts remain at the captured baseline, with totals displayed in 'Vegetarian: N · Vegan: N · Gluten-free: N · Nut-free: N' order and each total matching the current list.
