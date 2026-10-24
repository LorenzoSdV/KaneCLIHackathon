---
assurance:
  id: t-28
  base: sha256:6061141a443c750b093cdcd2e6b78232da67c013f281dc58b5d27e0f553601bb
---
# Each dietary choice adds a named guest and updates totals

> On a fresh event for each choice, save a new named dietary entry and establish the entry rendering and corresponding per-choice count.

## Step 1 @verifies ac-58

At {{start_url}}, create a Potluck Planner event with a unique title, today's date and host 'Test Host'; reach its event page and assert the Dietary needs section offers a guest name field, Vegetarian, Vegan, Gluten-free, Nut-free and Save dietary need.

## Step 2 @verifies ac-59, ac-60, ac-61

In this event's Dietary needs section, save 'Alex' with Vegetarian, then assert 'Alex — Vegetarian' is listed, totals read 'Vegetarian: 1 · Vegan: 0 · Gluten-free: 0 · Nut-free: 0', and every total matches the list entries.

## Step 3

At {{start_url}}, create another Potluck Planner event with a unique title, today's date and host 'Test Host'; reach its event page.

## Step 4 @verifies ac-59, ac-60, ac-61

In this event's Dietary needs section, save 'Alex' with Vegan, then assert 'Alex — Vegan' is listed, totals read 'Vegetarian: 0 · Vegan: 1 · Gluten-free: 0 · Nut-free: 0', and every total matches the list entries.

## Step 5

At {{start_url}}, create another Potluck Planner event with a unique title, today's date and host 'Test Host'; reach its event page.

## Step 6 @verifies ac-59, ac-60, ac-61

In this event's Dietary needs section, save 'Alex' with Gluten-free, then assert 'Alex — Gluten-free' is listed, totals read 'Vegetarian: 0 · Vegan: 0 · Gluten-free: 1 · Nut-free: 0', and every total matches the list entries.

## Step 7

At {{start_url}}, create another Potluck Planner event with a unique title, today's date and host 'Test Host'; reach its event page.

## Step 8 @verifies ac-59, ac-60, ac-61

In this event's Dietary needs section, save 'Alex' with Nut-free, then assert 'Alex — Nut-free' is listed, totals read 'Vegetarian: 0 · Vegan: 0 · Gluten-free: 0 · Nut-free: 1', and every total matches the list entries.
