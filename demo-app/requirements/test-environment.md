# Potluck Planner — Test Environment

How the Potluck Planner browser tests are run. This describes the test setup, not product behavior.

- The app under test is reached at the `start_url` variable (for example http://localhost:4100).
- Tests run in parallel against one shared running app. Other tests create events at any moment, so the home page's event list can grow while a test runs.
- Because of that, a test must never rely on the total number of events listed on the home page. To check that a submission created no event, submit a unique title (for example one that includes a random string) and verify that no event with that exact title appears in the home page's event list.
- Each test that needs an event creates its own, with a unique title, and works only on that event's page.
