# Prompt Template "Test Plan" from a Jira Ticket

## Role
You are a senior QA engineer reviewing the feature described below.

## Task
Create a detailed test plan for the Delete Program with Confirmation feature.

## Acceptance Criteria

**User story:** As an admin user, I want to delete a program I no longer need, with a confirmation step to prevent accidental deletion.

Scenario: Delete program after confirmation
  Given I am logged in as admin
  And a program "Test Program" exists with Description "Program created for deletion testing"
  When I navigate to the Programs page
  And I initiate delete for "Test Program"
  Then I see a confirmation dialog asking me to confirm deletion of "Test Program"
  When I confirm the deletion
  Then the confirmation dialog closes
  And "Test Program" is no longer shown in the program list

Scenario: Cancel deletion keeps program in list
  Given I am logged in as admin
  And a program "Test Program" exists with Description "Program created for deletion testing"
  When I navigate to the Programs page
  And I initiate delete for "Test Program"
  Then I see a confirmation dialog asking me to confirm deletion of "Test Program"
  When I cancel the deletion
  Then the confirmation dialog closes
  And "Test Program" is still shown in the program list

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
