# Prompt Template "Test Plan" from a Jira Ticket

## Role
You are a senior QA engineer reviewing the feature described below.

## Task
Create a detailed test plan for the Program Name Validation and Duplicate Prevention feature.

## Acceptance Criteria

**User story:** As an admin user, I want the system to prevent invalid or duplicate program names so that data integrity is maintained.

Scenario: Validation rejects whitespace-only program name
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "   "
  Then the Program Name is trimmed and treated as empty
  And the Create button is disabled
  And the program is not created

Scenario: Program name accepts special characters
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "Informatique & IA - Niveau 2"
  And I fill in Description with "Advanced informatics and artificial intelligence program"
  And I click Create
  Then the modal closes
  And the program list shows "Informatique & IA - Niveau 2"

Scenario: Validation rejects duplicate program name
  Given I am logged in as admin
  And a program "Web Development 2026" already exists
  When I navigate to the Programs page
  And I click "+ New Program"
  And I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Duplicate program attempt"
  And I click Create
  Then I see an error indicating the program name already exists
  And the program is not created
  And only one "Web Development 2026" appears in the program list

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
