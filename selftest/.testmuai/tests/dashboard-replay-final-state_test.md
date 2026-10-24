---
mode: testing
max_steps: 30
timeout: 300
target: chrome
---

# Session: dashboard-replay-final-state

## Step 1
Go to http://localhost:4300/?replay=demo&speed=50 and wait until the footer says 'Replay finished.' (up to 60 seconds). Then verify the header shows a REPLAY badge, store the number shown under 'Merged contract' as 'merged_contract', verify the 'Feature A · RSVP' column's status pill reads 'contract passed', verify the 'Feature B · Dish claims' column's status pill reads 'contract passed' and that column shows a section titled with 'Re-check' whose Kane contract reads '10/10 passed', verify the 'Integration · merge A + B' column's status pill reads 'contract passed' and shows a merge row for feat/b with code conflicts, and verify the Merged contract value is 16/16.
