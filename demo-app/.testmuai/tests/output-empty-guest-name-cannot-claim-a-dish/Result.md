---
test: ../empty-guest-name-cannot-claim-a-dish_test.md
status: failed
started: 2026-10-24T20:19:32.911Z
duration_s: 57
session_id: 9aa6f825-34fd-430c-8dea-d7cc4034530c
---

# Empty guest name cannot claim a dish — Result

## Step 1 ✗ failed (53.8s)
md5: 753391d22487f92346b33a253cea6d40
Reason: AP determined agent is stuck — no viable actions remain — bug verdict: Event workflow lacks reachable Dishes section [automation_bug/state_transition_bug, confidence 0.89]
At {{start_url}}, create a Potluck Planner event from the home page with title 'Dish empty name test', today's date, and host name 'Test Host'; reach its event page and Dishes section, then assert exactly five categories are listed as Main, Side, Salad, Dessert, and Drinks, the count reads '0 of 5 dishes claimed', and each category has a guest name field and Claim button.

## Step 2 ⏭ skipped
