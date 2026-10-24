# Potluck Planner — Round 2 Requirements

Two more features for the event page of Potluck Planner (see potluck.md). As before there are no accounts: a guest identifies themselves by typing their name. Everything already built (creating events, RSVP, dish claims) keeps working unchanged.

## Feature C: Comments

Guests leave short comments on the event page so everyone can coordinate.

- The event page has a "Comments" section with a guest name field, a comment field and a "Post comment" button.
- Posting a comment adds it to the section as "<guest name>: <comment>", in the order comments were posted (oldest first).
- The section shows the count in the form "N comments" (for example "0 comments", "2 comments").
- Posting with an empty guest name shows the error "Name is required" and adds nothing.
- Posting with an empty comment shows the error "Comment is required" and adds nothing.

## Feature D: Dietary needs

Guests tell the host about dietary needs so the host can plan the menu.

- The event page has a "Dietary needs" section with a guest name field, four choices (Vegetarian, Vegan, Gluten-free, Nut-free) and a "Save dietary need" button.
- Saving adds the guest to the section's list as "<guest name> — <choice>".
- The section shows a count for each choice in the form "Vegetarian: N · Vegan: N · Gluten-free: N · Nut-free: N".
- If a guest with the same name (case-insensitive) saves again, their previous choice is replaced; the guest appears only once and the counts reflect only the latest choice.
- Saving with an empty guest name shows the error "Name is required" and changes nothing.
- Saving without a choice shows the error "Choose a dietary need" and changes nothing.
