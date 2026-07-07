# Prompt Template "Test Plan" from a Jira Ticket

## Role
You are a senior QA engineer reviewing the feature described below.

## Task
Create a detailed test plan for the Edit Existing Program Details feature.

## Target App
Didaxis at `DIDAXIS_URL` (e.g. `https://test.didaxis.studio`). Admin login via Email/Password.

## App UI Reference (Jira label → real app)

| Jira wording | Real Didaxis UI |
|--------------|-----------------|
| "edit icon" on a program | Button `Edit {programName}` on the Programs table row |
| "Name" field | Textbox labeled **Program Name** inside dialog **Edit Program** |
| Edit form | Modal dialog titled **Edit Program** with **Save**, **Cancel**, and X in banner |
| Programs page | Nav button **Programs** → heading **Programs** (h2) |

## Acceptance Criteria

**User story:** As an admin user, I want to edit an existing program's details so that I can correct or update program information after creation.

**Jira ticket:** [DS-2](https://legionqaschool.atlassian.net/browse/DS-2)

Scenario: Open program for editing
  Given I am on the Programs page
  And a program "Web Development 2026" exists
  When I click the edit icon on "Web Development 2026"
  Then I see the edit form pre-populated with the program's current data

Scenario: Successfully edit a program name
  Given I am editing "Web Development 2026"
  When I change the Name to "Web Development 2026 - Updated"
  And I click Save
  Then the modal closes
  And the program list immediately shows "Web Development 2026 - Updated"

Scenario: Edit preserves unchanged fields
  Given I am editing a program
  When I only change the Description
  And I click Save
  Then the Name and other fields remain unchanged

## Requirements for the test plan
- All test cases must be in Gherkin
- Cover every AC with at least one test case
- Add edge cases the ACs don't mention (boundary values, empty inputs, special characters, duplicates, max-length)
- Add negative test cases (what should NOT happen)
- Structure each test case as: ID, Title, Preconditions, Steps, Expected result, Priority (High/Medium/Low)
- Group by: Positive flows, Negative flows, Edge cases
- Cross-reference acceptance criteria against the real app; fix assumptions and add UI specifics

## Output
- Structured test plan in Markdown
- Use real field names and values, not placeholders
- At the end: list resolved observations and remaining ambiguities/gaps in the ACs
