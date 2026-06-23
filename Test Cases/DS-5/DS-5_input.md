# Prompt Template "Test Plan" from a Jira Ticket

## Role
You are a senior QA engineer reviewing the feature described below.

## Task
Create a detailed test plan for the Program List Filtering and Display feature.

## Acceptance Criteria

**User story:** As an admin user, I want to see all programs in a clear list so that I can quickly find and manage them.

Scenario: Program list displays name and description for each program
  Given I am logged in as admin
  And the following programs exist:
    | Program Name           | Description                              |
    | Web Development 2026   | Full-stack web development program     |
    | Data Science 2026      | Data analysis and machine learning track |
  When I navigate to the Programs page
  Then I see a program list
  And the list shows "Web Development 2026" with Description "Full-stack web development program"
  And the list shows "Data Science 2026" with Description "Data analysis and machine learning track"

Scenario: Empty state when no programs exist
  Given I am logged in as admin
  And no programs exist
  When I navigate to the Programs page
  Then I see an empty state message indicating no programs are available
  And I see a prompt to create the first program
  And I see the "+ New Program" action to begin creating a program

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
