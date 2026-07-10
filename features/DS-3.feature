Feature: Program name validation and duplicate prevention
  DS-3 — Admin program names are validated for emptiness, format, and uniqueness on create and edit

  # Happy paths

  @TC-DS3-001 @High @AC-AcceptProgramNameWithSpecialCharacters
  Scenario: Program name with special characters is accepted on create
    Given I am logged in as admin
    And I am on the program creation form
    And no program named "Informatique & IA - Niveau 2" exists
    When I fill in "Program Name" with "Informatique & IA - Niveau 2"
    And I fill in "Description" with "Advanced informatics and artificial intelligence program"
    And I click "Create"
    Then the "New Program" modal closes
    And the program list shows "Informatique & IA - Niveau 2" exactly as entered

  @TC-DS3-002 @Medium
  Scenario: Valid Program Name with inner spaces is accepted on create
    Given I am logged in as admin
    And I am on the program creation form
    And no program named "Web Development 2026" exists
    When I fill in "Program Name" with "Web Development 2026"
    And I fill in "Description" with "Full-stack web development program"
    And I click "Create"
    Then the "New Program" modal closes
    And the program list shows "Web Development 2026"

  @TC-DS3-003 @High
  Scenario: Leading and trailing whitespace is trimmed from valid Program Name on create
    Given I am logged in as admin
    And I am on the program creation form
    And no program named "Mobile Development 2026" exists
    When I fill in "Program Name" with "  Mobile Development 2026  "
    And I fill in "Description" with "Trim behavior validation test"
    And I click "Create"
    Then the "New Program" modal closes
    And the program list shows "Mobile Development 2026"
    And the program list does not show "  Mobile Development 2026  "

  @TC-DS3-004 @Medium
  Scenario: Saving unchanged Program Name on edit does not trigger duplicate error
    Given I am logged in as admin
    And a program "Web Development 2026" exists with Description "Full-stack web development program"
    And I am on the "Edit Program" modal for "Web Development 2026"
    When I leave "Program Name" as "Web Development 2026"
    And I change "Description" to "Updated description only"
    And I click "Save"
    Then the "Edit Program" modal closes
    And I do not see a duplicate-name error
    And the program list shows "Web Development 2026"

  @TC-DS3-005 @Medium
  Scenario: Rename to a unique name succeeds on edit
    Given I am logged in as admin
    And a program "Data Science 2026" exists with Description "Introductory data science track"
    And no program named "Advanced Data Science 2026" exists
    And I am on the "Edit Program" modal for "Data Science 2026"
    When I change "Program Name" to "Advanced Data Science 2026"
    And I click "Save"
    Then the "Edit Program" modal closes
    And the program list shows "Advanced Data Science 2026"
    And the program list does not show "Data Science 2026"

  @TC-DS3-006 @Medium
  Scenario: Program Name at maximum allowed length (255 characters) is accepted
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with a string of exactly 255 characters
    And I fill in "Description" with "Boundary test for max-length program name"
    And I click "Create"
    Then the "New Program" modal closes
    And the program list shows the full 255-character name without truncation

  @TC-DS3-018 @Low
  Scenario: Unicode and extended special characters in Program Name are accepted
    Given I am logged in as admin
    And I am on the program creation form
    And no program named "プログラム — École №1 (2026)" exists
    When I fill in "Program Name" with "プログラム — École №1 (2026)"
    And I fill in "Description" with "Unicode and symbol validation test"
    And I click "Create"
    Then the "New Program" modal closes
    And the program list shows "プログラム — École №1 (2026)" exactly as stored

  # Negative

  @TC-DS3-007 @High @AC-RejectProgramNameWithOnlyWhitespace
  Scenario: Whitespace-only Program Name is rejected on create
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "   "
    Then the "Program Name" is trimmed and treated as empty
    And the "Create" button is disabled
    And no program is created

  @TC-DS3-008 @High
  Scenario: Empty Program Name is rejected on create
    Given I am logged in as admin
    And I am on the program creation form
    When I leave "Program Name" empty
    Then the "Create" button is disabled
    And no program is created

  @TC-DS3-009 @High @AC-RejectDuplicateProgramName
  Scenario: Duplicate Program Name is rejected on create
    Given I am logged in as admin
    And a program "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in "Program Name" with "Web Development 2026"
    And I fill in "Description" with "Duplicate program attempt"
    And I click "Create"
    Then I see an error indicating the program name already exists
    And the "New Program" modal remains open
    And only one "Web Development 2026" appears in the program list

  @TC-DS3-010 @High
  Scenario: Duplicate Program Name is rejected on edit
    Given I am logged in as admin
    And programs "Web Development 2026" and "Cybersecurity 2026" exist
    And I am on the "Edit Program" modal for "Web Development 2026"
    When I change "Program Name" to "Cybersecurity 2026"
    And I click "Save"
    Then I see an error indicating the program name already exists
    And the "Edit Program" modal remains open
    And the program list still shows "Web Development 2026"
    And the program list still shows "Cybersecurity 2026" unchanged

  @TC-DS3-011 @High
  Scenario: Whitespace-only Program Name is rejected on edit
    Given I am logged in as admin
    And a program "Web Development 2026" exists with Description "Full-stack web development program"
    And I am on the "Edit Program" modal for "Web Development 2026"
    When I change "Program Name" to "   "
    Then the "Program Name" is trimmed and treated as empty
    And the "Save" button is disabled
    And the program list still shows "Web Development 2026"

  @TC-DS3-012 @High
  Scenario: Duplicate is detected after trimming leading and trailing whitespace on create
    Given I am logged in as admin
    And a program "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in "Program Name" with "  Web Development 2026  "
    And I fill in "Description" with "Duplicate attempt with padded whitespace"
    And I click "Create"
    Then I see an error indicating the program name already exists
    And no program is created
    And only one "Web Development 2026" appears in the program list

  @TC-DS3-013 @Medium
  Scenario: Program Name exceeding maximum allowed length is rejected
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with a string of 256 characters
    And I fill in "Description" with "Over-limit name validation test"
    And I attempt to click "Create"
    Then I see a validation error for Program Name length
    Or the field prevents input beyond the maximum length
    And no program is created

  @TC-DS3-024 @High
  Scenario: Duplicate name is rejected even when Description differs
    Given I am logged in as admin
    And a program "Web Development 2026" exists with Description "Full-stack web development program"
    And I am on the program creation form
    When I fill in "Program Name" with "Web Development 2026"
    And I fill in "Description" with "Completely different description from existing program"
    And I click "Create"
    Then I see an error indicating the program name already exists
    And no program is created

  # Edge cases

  @TC-DS3-015 @Medium
  Scenario: Case variant of existing name is rejected on create when policy is case-insensitive
    Given I am logged in as admin
    And a program "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in "Program Name" with "web development 2026"
    And I fill in "Description" with "Case variant duplicate test"
    And I click "Create"
    Then I see an error indicating the program name already exists
    And no program is created

  @TC-DS3-016 @Medium
  Scenario: Case variant of existing name is rejected on edit when policy is case-insensitive
    Given I am logged in as admin
    And programs "Web Development 2026" and "Data Science 2026" exist
    And I am on the "Edit Program" modal for "Data Science 2026"
    When I change "Program Name" to "WEB DEVELOPMENT 2026"
    And I click "Save"
    Then I see an error indicating the program name already exists
    And the program list still shows "Data Science 2026"

  @TC-DS3-017 @Medium
  Scenario: Duplicate error highlights Program Name and preserves other input
    Given I am logged in as admin
    And a program "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in "Program Name" with "Web Development 2026"
    And I fill in "Description" with "Duplicate program attempt with long description text"
    And I click "Create"
    Then I see an error indicating the program name already exists
    And the "Program Name" field is visually highlighted or marked invalid
    And the "Description" field still contains "Duplicate program attempt with long description text"
    And the "New Program" modal remains open

  @TC-DS3-020 @Medium
  Scenario: Duplicate check applies trim and case normalization before compare
    Given I am logged in as admin
    And a program "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in "Program Name" with "  WEB DEVELOPMENT 2026  "
    And I fill in "Description" with "Combined trim and case duplicate test"
    And I click "Create"
    Then I see an error indicating the program name already exists
    And no program is created

  @TC-DS3-021 @Medium
  Scenario: Create button is disabled after Program Name is cleared following valid entry
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "Temporary Valid Name"
    And I clear the "Program Name" field completely
    Then the "Create" button is disabled
    And the "Program Name" is treated as empty

  @TC-DS3-022 @Medium
  Scenario: Double-click Create does not bypass duplicate validation
    Given I am logged in as admin
    And a program "Web Development 2026" already exists
    And I am on the program creation form
    And I have filled in "Program Name" with "Web Development 2026"
    When I double-click the "Create" button rapidly
    Then I see an error indicating the program name already exists
    And only one "Web Development 2026" appears in the program list

  @TC-DS3-023 @Low
  Scenario: HTML or script-like characters in Program Name are stored and displayed safely
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "<script>alert('xss')</script>"
    And I fill in "Description" with "XSS boundary test"
    And I click "Create"
    Then the program is either created with the name displayed as plain text
    Or I see a validation error for disallowed characters
    And no script execution occurs in the program list or form

  # Ambiguities and gaps
  # - Case sensitivity: ACs do not specify case-insensitive duplicates; TC-DS3-015/016 assume policy must be defined
  # - Observed on live app: duplicate names ARE allowed on create (diverges from TC-DS3-009)
  # - Observed on live app: duplicate rename IS allowed on edit (diverges from TC-DS3-010; see DS-2)
  # - Observed on live app: names are case-sensitive — "web development 2026" ≠ "Web Development 2026"
  # - Observed on live app: leading/trailing whitespace may NOT be trimmed on create or edit
  # - Observed on live app: 256+ character names ARE accepted (diverges from TC-DS3-013)
  # - Maximum field length not defined in DS-3 ACs; 255-char boundary used per live app observation
  # - Duplicate on edit not explicit in ACs; TC-DS3-010 assumes create and edit rules match
  # - Error presentation: ACs require an error message but not inline vs toast, exact copy, or field highlight
  # - Trim scope: whitespace-only rejection specified; trim-on-save and duplicate-compare normalization not explicit
  # - Server-side enforcement: ACs describe UI only; API validation and authorization not specified
  # - Soft-deleted programs: unclear whether a deleted program's name can be reused
  # - Concurrent create with same name: no AC defines behavior for simultaneous submissions
