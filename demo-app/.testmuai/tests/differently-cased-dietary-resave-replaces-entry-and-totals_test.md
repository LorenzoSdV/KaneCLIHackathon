---
assurance:
  id: t-25
  base: sha256:bec6c85fc9e4f71a38d9e52501cc8183aa7f4d2598e53a9212258dc12eefc139
---
# Differently cased dietary resave replaces entry and totals

> On one fresh event, save a choice for a named guest then save another choice using the same name with different case; retain one guest entry with the new choice and count only the latest choice.

## Step 1 @verifies ac-58

At {{start_url}}, create a Potluck Planner event with a unique title, today's date and host 'Test Host'; reach its event page and assert the Dietary needs section offers a guest name field, Vegetarian, Vegan, Gluten-free, Nut-free and Save dietary need.

## Step 2 @verifies ac-59

In this event's Dietary needs section, save the guest name 'Alex' with Vegetarian, then assert the list displays 'Alex — Vegetarian'.

## Step 3 @verifies ac-59, ac-60, ac-61, ac-62, ac-63, ac-64

In the same event's Dietary needs section, save the guest name 'aLEX' with Vegan, then assert the list has exactly one entry for Alex irrespective of case, that entry shows the saved name with ' — Vegan', the totals read 'Vegetarian: 0 · Vegan: 1 · Gluten-free: 0 · Nut-free: 0', and every total matches the current list entries.
