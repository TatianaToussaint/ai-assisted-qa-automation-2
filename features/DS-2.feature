Feature: Edit existing program details
  DS-2 — Admin edits an existing academic program from the Programs page

  # Happy paths

  @TC-DS2-001 @High @AC-OpenProgramForEditing
  Scenario: Edit form opens pre-populated with current program data
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Web Development 2026" exists with Description "Full-stack web development program"
    When I click the "Edit Web Development 2026" button
    Then I see the "Edit Program" modal dialog
    And the "Program Name" field shows "Web Development 2026"
    And the "Description" field shows "Full-stack web development program"
    And the "Save" button is enabled
    And the "Cancel" button is visible
    And the X close control is visible in the dialog banner

  @TC-DS2-002 @High @AC-SuccessfullyEditProgramName
  Scenario: Program name is updated and list refreshes immediately
    Given I am logged in as admin
    And I am on the "Edit Program" modal for "Web Development 2026"
    When I change "Program Name" to "Web Development 2026 - Updated"
    And I click "Save"
    Then the "Edit Program" modal closes within 10 seconds
    And the program list shows "Web Development 2026 - Updated"
    And the program list does not show "Web Development 2026"
    And the Description remains "Full-stack web development program"

  @TC-DS2-003 @High @AC-EditPreservesUnchangedFields
  Scenario: Editing Description only leaves Program Name unchanged
    Given I am logged in as admin
    And I am on the "Edit Program" modal for "Web Development 2026"
    When I leave "Program Name" as "Web Development 2026"
    And I change "Description" to "Updated full-stack web development program"
    And I click "Save"
    Then the "Edit Program" modal closes
    And the program list shows Program Name "Web Development 2026"
    And the program list shows Description "Updated full-stack web development program"

  @TC-DS2-004 @Medium
  Scenario: Both Program Name and Description update in a single save
    Given I am logged in as admin
    And I am on the "Edit Program" modal for "Data Science 2026"
    When I change "Program Name" to "Advanced Data Science 2026"
    And I change "Description" to "Advanced machine learning and analytics program"
    And I click "Save"
    Then the "Edit Program" modal closes
    And the program list shows Program Name "Advanced Data Science 2026"
    And the program list shows Description "Advanced machine learning and analytics program"
    And the program list does not show "Data Science 2026"

  @TC-DS2-005 @Medium
  Scenario: Special characters in edited Program Name are preserved
    Given I am logged in as admin
    And I am on the "Edit Program" modal for "Software Engineering Basics"
    When I change "Program Name" to "Informatique & IA - Niveau 2"
    And I click "Save"
    Then the "Edit Program" modal closes
    And the program list shows "Informatique & IA - Niveau 2" exactly as entered

  @TC-DS2-006 @Medium
  Scenario: Program list updates without manual page refresh after edit
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Cloud Engineering 2026" exists with Description "AWS and Azure cloud engineering track"
    When I click "Edit Cloud Engineering 2026"
    And I change "Description" to "Multi-cloud engineering and DevOps track"
    And I click "Save"
    Then the "Edit Program" modal closes
    And the program list shows Description "Multi-cloud engineering and DevOps track" for "Cloud Engineering 2026" without a full page reload

  # Negative

  @TC-DS2-008 @High
  Scenario: Save is blocked when Program Name is cleared
    Given I am logged in as admin
    And I am on the "Edit Program" modal for "Web Development 2026"
    When I clear the "Program Name" field completely
    Then the "Save" button is disabled
    And the program list still shows "Web Development 2026"

  @TC-DS2-009 @High
  Scenario: Non-admin user cannot edit a program
    Given I am logged in as a non-admin user
    And I am on the Programs page
    And a program "Web Development 2026" exists
    Then I do not see an "Edit Web Development 2026" button
    And I cannot open the "Edit Program" modal for "Web Development 2026"

  @TC-DS2-010 @High
  Scenario: Rename to an existing program name is allowed on edit
    Given I am logged in as admin
    And programs "Web Development 2026" and "Cybersecurity 2026" exist
    And I am on the "Edit Program" modal for "Web Development 2026"
    When I change "Program Name" to "Cybersecurity 2026"
    And I click "Save"
    Then the "Edit Program" modal closes
    And the program list no longer shows "Web Development 2026"
    And the program list shows at least two rows named "Cybersecurity 2026"

  @TC-DS2-011 @Medium
  Scenario: Cancel discards unsaved changes
    Given I am logged in as admin
    And I am on the "Edit Program" modal for "Web Development 2026"
    When I change "Program Name" to "Web Development 2026 - Updated"
    And I change "Description" to "This change should not be saved"
    And I click "Cancel"
    Then the "Edit Program" modal closes
    And the program list shows Program Name "Web Development 2026"
    And the program list shows Description "Full-stack web development program"
    And the program list does not show "Web Development 2026 - Updated"

  @TC-DS2-012 @Medium
  Scenario: Rename to a case variant of an existing name is allowed
    Given I am logged in as admin
    And programs "Web Development 2026" and "Data Science 2026" exist
    And I am on the "Edit Program" modal for "Data Science 2026"
    When I change "Program Name" to "web development 2026"
    And I click "Save"
    Then the "Edit Program" modal closes
    And the program list shows "Web Development 2026"
    And the program list shows "web development 2026"
    And the program list does not show "Data Science 2026"

  # Edge cases

  @TC-DS2-013 @Medium
  Scenario: Program Name at maximum allowed length (255 characters) is accepted on edit
    Given I am logged in as admin
    And I am on the "Edit Program" modal for "Short Name Program"
    When I change "Program Name" to a string of exactly 255 characters
    And I click "Save"
    Then the "Edit Program" modal closes
    And the program list shows the full 255-character name without truncation

  @TC-DS2-014 @Medium
  Scenario: Program Name exceeding 255 characters is accepted on edit
    Given I am logged in as admin
    And I am on the "Edit Program" modal for "Boundary Edit Test"
    When I change "Program Name" to a string of 256 characters
    And I click "Save"
    Then the "Edit Program" modal closes
    And the program list shows the full 256-character name
    And the program list does not show "Boundary Edit Test"

  @TC-DS2-015 @High
  Scenario: Whitespace-only Program Name disables Save on edit
    Given I am logged in as admin
    And I am on the "Edit Program" modal for "Web Development 2026"
    When I change "Program Name" to "   "
    Then the "Save" button is disabled
    And the program list still shows "Web Development 2026"

  @TC-DS2-016 @Medium
  Scenario: Leading and trailing whitespace in Program Name is not trimmed on save
    Given I am logged in as admin
    And I am on the "Edit Program" modal for "Web Development 2026"
    When I change "Program Name" to "  Mobile Development 2026  "
    And I click "Save"
    Then the "Edit Program" modal closes
    And the program list shows "  Mobile Development 2026  " with leading and trailing spaces preserved
    And the program list does not show "Web Development 2026"

  @TC-DS2-018 @Medium
  Scenario: No edit action exists for a non-existent program
    Given I am logged in as admin
    And I am on the Programs page
    And no program named "Deleted Program Test" exists
    When I look for an "Edit Deleted Program Test" button
    Then no such button is present
    And no table row shows "Deleted Program Test"

  @TC-DS2-021 @Low
  Scenario: Clearing Description only preserves Program Name
    Given I am logged in as admin
    And I am on the "Edit Program" modal for "Web Development 2026"
    When I leave "Program Name" as "Web Development 2026"
    And I clear the "Description" field completely
    And I click "Save"
    Then the "Edit Program" modal closes
    And the program list shows Program Name "Web Development 2026"
    And the program list shows a blank Description in the program row

  @TC-DS2-023 @Low
  Scenario: Escape key dismisses edit form without saving
    Given I am logged in as admin
    And I am on the "Edit Program" modal for "Web Development 2026"
    When I change "Program Name" to "Web Development 2026 - Updated"
    And I press the Escape key
    Then the "Edit Program" modal closes
    And the program list shows Program Name "Web Development 2026"
    And the program list does not show "Web Development 2026 - Updated"

  # Ambiguities and gaps
  # - Jira AC says "edit icon"; real app uses button "Edit {programName}" on each table row
  # - Jira AC says "Name"; real app field label is "Program Name"
  # - Non-admin access: role boundaries not defined in DS-2 ACs; TC-DS2-009 needs non-admin credentials
  # - Success feedback: no toast or banner after save — only list update is observable
  # - Duplicate rename allowed on edit but may be blocked on create (DS-3); create vs edit validation parity unclear
  # - 256+ character Program Names accepted on edit; may violate intended max-length policy — product decision needed
  # - Whitespace-only name disables Save, but leading/trailing spaces are not trimmed on save
  # - Curriculum linkage: unclear whether renaming affects linked curriculum structure or references
  # - No-change save succeeds silently with no explicit user feedback
