Feature: Create new academic program
  DS-1 — Admin creates a new academic program from the Programs page

  # Happy paths

  @TC-DS1-001 @High @AC-NavigateToProgramCreationForm
  Scenario: Program creation form opens with required fields
    Given I am logged in as admin
    When I navigate to the Programs page
    And I click "+ New Program"
    Then I see the "New Program" modal dialog
    And the "Program Name" field is visible and editable
    And the "Description" field is visible and editable
    And the "Create" button is present and disabled
    And the "Cancel" button is visible
    And the X close control is visible in the dialog banner

  @TC-DS1-002 @High @AC-SuccessfullyCreateProgram
  Scenario: Program is created successfully with valid name and description
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "Web Development 2026"
    And I fill in "Description" with "Full-stack web development program"
    And I click "Create"
    Then the "New Program" modal closes
    And the program list shows "Web Development 2026"
    And the program list shows Description "Full-stack web development program"

  @TC-DS1-003 @Medium
  Scenario: Program is created with name only and empty description
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "Data Science Fundamentals"
    And I leave "Description" empty
    And I click "Create"
    Then the "New Program" modal closes
    And the program list shows "Data Science Fundamentals"

  @TC-DS1-004 @Medium
  Scenario: Special characters in Program Name are accepted and preserved
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "Informatique & IA - Niveau 2"
    And I fill in "Description" with "Programme bilingue en informatique et intelligence artificielle"
    And I click "Create"
    Then the "New Program" modal closes
    And the program list shows "Informatique & IA - Niveau 2" exactly as entered

  @TC-DS1-005 @Medium
  Scenario: Program list refreshes after successful create without manual reload
    Given I am logged in as admin
    And I am on the Programs page
    When I click "+ New Program"
    And I fill in "Program Name" with "Cloud Engineering 2026"
    And I fill in "Description" with "AWS and Azure cloud engineering track"
    And I click "Create"
    Then the "New Program" modal closes
    And the program list includes "Cloud Engineering 2026" without a full page reload

  # Negative

  @TC-DS1-006 @High @AC-ValidationPreventsEmptyProgramName
  Scenario: Create button is disabled when Program Name is empty
    Given I am logged in as admin
    And I am on the program creation form
    When I leave "Program Name" empty
    Then the "Create" button is disabled
    And no program is created

  @TC-DS1-007 @High
  Scenario: Duplicate Program Name is rejected with an error
    Given I am logged in as admin
    And the program "Web Development 2026" already exists in the program list
    And I am on the program creation form
    When I fill in "Program Name" with "Web Development 2026"
    And I fill in "Description" with "Another description for duplicate test"
    And I click "Create"
    Then creation is blocked with a clear duplicate-name error
    And the "New Program" modal remains open
    And exactly one program with that name remains in the list

  @TC-DS1-008 @High
  Scenario: Non-admin user cannot access program creation
    Given I am logged in as a non-admin user
    When I navigate to the Programs page
    Then I do not see "+ New Program"
    And I cannot open the program creation form

  @TC-DS1-009 @Medium
  Scenario: Cancel discards unsaved program data
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "Cancelled Program Test"
    And I fill in "Description" with "This should not be saved"
    And I click "Cancel"
    Then the "New Program" modal closes
    And the program list does not show "Cancelled Program Test"

  @TC-DS1-010 @Medium
  Scenario: Create button is disabled after Program Name is cleared
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "Temporary Name"
    And I clear the "Program Name" field completely
    Then the "Create" button is disabled

  # Edge cases

  @TC-DS1-011 @High
  Scenario: Whitespace-only Program Name does not create a program
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "   "
    And I fill in "Description" with "Description with whitespace-only name test"
    Then the "Create" button remains disabled
    And no program is created

  @TC-DS1-012 @Medium
  Scenario: Program Name at maximum allowed length (255 characters) is accepted
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with a string of exactly 255 characters
    And I fill in "Description" with "Boundary test for max-length program name"
    And I click "Create"
    Then the "New Program" modal closes
    And the program list shows the full 255-character name without truncation

  @TC-DS1-013 @Medium
  Scenario: Program Name exceeding maximum allowed length is rejected
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with a string of 256 characters
    And I fill in "Description" with "Over-limit name test"
    And I attempt to click "Create"
    Then I see a validation error for Program Name length
    Or the field prevents input beyond the maximum length
    And no program is created

  @TC-DS1-015 @Medium
  Scenario: Leading and trailing whitespace is trimmed from Program Name on create
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "  Mobile Development 2026  "
    And I fill in "Description" with "Trim behavior test"
    And I click "Create"
    Then the "New Program" modal closes
    And the program list shows "Mobile Development 2026"
    And the program list does not show "  Mobile Development 2026  "

  @TC-DS1-016 @Low
  Scenario: Unicode and extended special characters in Program Name are handled correctly
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "プログラム — École №1 (2026)"
    And I fill in "Description" with "Unicode and symbol boundary test"
    And I click "Create"
    Then the "New Program" modal closes
    And the program list shows "プログラム — École №1 (2026)" exactly as stored

  @TC-DS1-017 @Medium
  Scenario: Double-click Create does not create duplicate programs
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "Cybersecurity 2026"
    And I fill in "Description" with "Security fundamentals program"
    And I double-click the "Create" button rapidly
    Then exactly one program named "Cybersecurity 2026" exists in the program list

  @TC-DS1-018 @Medium
  Scenario: First program is created successfully when the list is empty
    Given I am logged in as admin
    And I am on the Programs page
    And the program list is empty
    When I click "+ New Program"
    And I fill in "Program Name" with "Web Development 2026"
    And I fill in "Description" with "Full-stack web development program"
    And I click "Create"
    Then the "New Program" modal closes
    And the program list shows "Web Development 2026"

  # Ambiguities and gaps
  # - Description required or optional: not stated in DS-1 ACs; TC-DS1-003 assumes optional
  # - Maximum field lengths: not defined in ACs; 255-char boundary used per live app observation
  # - Duplicate name rules: not in DS-1 ACs (see DS-3); TC-DS1-007 states ideal rejection behavior
  # - Observed on live app: duplicate names ARE allowed on create (diverges from TC-DS1-007)
  # - Observed on live app: 256+ character names ARE accepted (diverges from TC-DS1-013)
  # - Observed on live app: leading/trailing whitespace is NOT trimmed (diverges from TC-DS1-015)
  # - Observed on live app: double-click Create may create two programs (diverges from TC-DS1-017)
  # - Non-admin access: role boundaries not defined in DS-1 ACs; TC-DS1-008 needs non-admin credentials
  # - Post-create navigation: unclear whether user stays on Programs list or goes to curriculum design
  # - Success feedback: no toast or banner required — only list visibility is specified in ACs
  # - Case sensitivity: unclear whether "web development 2026" and "Web Development 2026" are duplicates
  # - API failure UX: error message content and modal state on failure not specified in ticket
