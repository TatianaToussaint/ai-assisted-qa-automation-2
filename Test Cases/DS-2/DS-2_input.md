# Prompt Template "Test Plan" from a Jira Ticket

## Role
You are a senior QA engineer reviewing the feature described below.

## Task
Create a detailed test plan for the Edit Existing Program Details feature.

## Acceptance Criteria

**User story:** As an admin user, I want to edit an existing program's details so that I can correct or update program information after creation.

Scenario: Open edit form with pre-populated fields
  Given I am logged in as admin
  And a program "Web Development 2026" exists with Description "Full-stack web development program"
  When I navigate to the Programs page
  And I open the edit form for "Web Development 2026"
  Then I see the edit form with Program Name pre-filled as "Web Development 2026"
  And I see Description pre-filled as "Full-stack web development program"

Scenario: Successfully rename a program
  Given I am on the edit form for "Web Development 2026"
  When I change Program Name to "Web Development 2026 - Updated"
  And I click Save
  Then the modal closes
  And the program list shows "Web Development 2026 - Updated"
  And the program list does not show "Web Development 2026"

Scenario: Edit Description only preserves Program Name
  Given I am on the edit form for "Web Development 2026"
  When I leave Program Name as "Web Development 2026"
  And I change Description to "Updated full-stack web development program"
  And I click Save
  Then the modal closes
  And the program list shows Program Name "Web Development 2026"
  And the program list shows Description "Updated full-stack web development program"

## Requirements for the test plan
- All test cases must be in Gherkin
- Cover every AC with at least one test case
- Add edge cases the ACs don't mention (boundary values, empty inputs, special characters, duplicates, max-length)
- Add negative test cases (what should NOT happen)
- Structure each test case as: ID, Title, Preconditions, Steps, Expected result, Priority (High/Medium/Low)
- Group by: Positive flows, Negative flows, Edge cases

## Output
- Structured test plan in Markdown
- Use real field names and values, not placeholders
- At the end: list any ambiguities or gaps in the ACs
