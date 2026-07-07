# Block 05 Reflection

## Block 2 vs Block 5 test cases — what changed?

Block 2 (DS-2) focused on one story—edit program—with 23 planned test cases and 22 automated Playwright tests, covering positive, negative, and edge flows in depth. Block 5 spans three stories (DS-3 validation, DS-4 delete, DS-5 list display) with a larger combined catalogue but only 25 automated tests, prioritising acceptance-criteria coverage over exhaustive edge expansion.

The main shift was grounding expectations in observed UI behaviour. Block 2 plans translated Jira wording ("edit icon," field "Name") into real selectors (`Edit {programName}`, `Program Name`) and recorded divergences such as duplicate renames being allowed on edit. Block 5 pushed that further: several cases now assert what the app actually does—for example, TC-DS3-009 documents duplicate-name *allowance* on create rather than the Jira-mandated rejection. Block 5 also fixed shared helpers: `deleteProgram` originally assumed a Mantine modal; live exploration showed delete uses native `window.confirm`, which blocked clicks until the handler pattern was corrected.

## What the agent discovered that Jira did not mention

Driving Playwright against `test.didaxis.studio` surfaced behaviour absent from acceptance criteria. Delete confirmation is a native browser `window.confirm`, not an in-app dialog, with a message warning that semesters and courses will be removed. Invalid or whitespace-only names disable **Create** or **Save** rather than showing inline validation errors. Duplicate program names are permitted on create despite DS-3’s AC. Uniqueness is case-sensitive. Leading and trailing whitespace is not trimmed on edit. Names longer than 255 characters are accepted. The program list renders each row as two `<p>` elements—bold name, muted description—inside a Mantine table.

## Which MCP was more useful? Why?

**Playwright was more useful for test accuracy.** The Atlassian (Jira) MCP supplied user stories, Gherkin acceptance criteria, and a channel to log findings (DS-166, DS-167), but several ACs did not match the running application. Without browser exploration, automation would have targeted confirmation modals and duplicate rejection that do not exist as specified. Jira MCP defined *what to verify*; Playwright defined *what to assert*. For QA automation against a live product, exploration MCP outweighed requirements MCP—though both were necessary for a complete pipeline.
