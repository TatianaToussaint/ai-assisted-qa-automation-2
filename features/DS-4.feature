Feature: Delete program with confirmation
  DS-4 — Admin deletes a program with a confirmation step to prevent accidental removal

  # Happy paths

  @TC-DS4-001 @High @AC-DeleteProgramWithConfirmation
  Scenario: Program is deleted after confirmation
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists with Description "Program created for deletion testing"
    When I click the "Delete Test Program" button
    Then I see a native browser confirmation dialog
    And the dialog message references "Test Program" by name
    When I confirm the deletion in the dialog
    Then the confirmation dialog closes
    And "Test Program" is no longer shown in the program list

  @TC-DS4-002 @High @AC-CancelProgramDeletion
  Scenario: Cancel deletion keeps program in the list
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists with Description "Program created for deletion testing"
    When I click the "Delete Test Program" button
    Then I see a native browser confirmation dialog
    When I cancel the deletion in the dialog
    Then the confirmation dialog closes
    And "Test Program" is still shown in the program list
    And the Description for "Test Program" is still "Program created for deletion testing"

  @TC-DS4-003 @High
  Scenario: Confirmation dialog displays correct program name and destructive warning
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists with Description "Program created for deletion testing"
    When I click the "Delete Test Program" button
    Then I see a native browser confirmation dialog
    And the dialog message references "Test Program" by name
    And the dialog message warns that the action cannot be undone
    And the dialog presents OK and Cancel actions

  @TC-DS4-004 @Medium
  Scenario: Program with special characters in name can be deleted after confirmation
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Informatique & IA - Niveau 2" exists with Description "Programme bilingue en informatique et intelligence artificielle"
    When I click the "Delete Informatique & IA - Niveau 2" button
    Then I see a native browser confirmation dialog referencing "Informatique & IA - Niveau 2"
    When I confirm the deletion in the dialog
    Then "Informatique & IA - Niveau 2" is no longer shown in the program list

  @TC-DS4-005 @Medium
  Scenario: Deleting one program leaves other programs unchanged
    Given I am logged in as admin
    And I am on the Programs page
    And the program list shows "Test Program", "Web Development 2026", and "Data Science Fundamentals"
    When I click the "Delete Test Program" button
    And I confirm the deletion in the dialog
    Then "Test Program" is no longer shown in the program list
    And "Web Development 2026" is still shown in the program list
    And "Data Science Fundamentals" is still shown in the program list

  @TC-DS4-018 @Medium
  Scenario: Program list refreshes after delete without manual page reload
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists alongside at least one other program
    When I click the "Delete Test Program" button
    And I confirm the deletion in the dialog
    Then "Test Program" is removed from the visible list immediately
    And I do not need to refresh the browser to see the updated list

  # Negative

  @TC-DS4-006 @High
  Scenario: Non-admin user cannot delete a program
    Given I am logged in as a non-admin user
    And I am on the Programs page
    And a program "Test Program" exists
    Then I do not see a "Delete Test Program" button
    And I cannot delete "Test Program" via direct URL or API

  @TC-DS4-008 @High
  Scenario: Delete is not executed when confirmation is shown but not confirmed
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists
    When I click the "Delete Test Program" button
    Then I see a native browser confirmation dialog referencing "Test Program"
    And I do not confirm the deletion
    Then "Test Program" remains shown in the program list
    And no deletion-complete message is shown

  @TC-DS4-009 @Medium
  Scenario: Attempt to delete a non-existent program is handled safely
    Given I am logged in as admin
    And no program named "Ghost Program" exists on the Programs page
    When I attempt to delete "Ghost Program" via stale bookmark, direct URL, or API
    Then I see an error indicating the program was not found
    And no program is removed from the current program list

  @TC-DS4-010 @Medium
  Scenario: Deleting an already-deleted program in a concurrent session fails safely
    Given I am logged in as admin in two browser sessions
    And a program "Test Program" exists and is visible in both sessions
    When Session A clicks "Delete Test Program" and confirms the deletion
    Then "Test Program" is no longer shown in Session A
    When Session B clicks "Delete Test Program" and confirms the deletion
    Then Session B shows an error indicating the program no longer exists or the list refreshes without "Test Program"
    And no additional program records are affected

  # Edge cases

  @TC-DS4-011 @Medium
  Scenario: Dismissing confirmation via Cancel does not delete the program
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists
    When I click the "Delete Test Program" button
    Then I see a native browser confirmation dialog referencing "Test Program"
    When I click Cancel in the confirmation dialog
    Then the confirmation dialog closes
    And "Test Program" is still shown in the program list

  @TC-DS4-012 @Medium
  Scenario: Dismissing confirmation via Escape does not delete the program
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists
    When I click the "Delete Test Program" button
    Then I see a native browser confirmation dialog referencing "Test Program"
    When I press the Escape key
    Then the confirmation dialog closes
    And "Test Program" is still shown in the program list

  @TC-DS4-013 @High
  Scenario: Deleting the last remaining program shows empty state
    Given I am logged in as admin
    And I am on the Programs page
    And "Test Program" is the only program in the system
    When I click the "Delete Test Program" button
    And I confirm the deletion in the dialog
    Then "Test Program" is no longer shown in the program list
    And I see the empty-state message prompting me to create the first program

  @TC-DS4-014 @High
  Scenario: Delete program with linked curriculum shows appropriate warning or blocking error
    Given I am logged in as admin
    And I am on the Programs page
    And "Web Development 2026" has linked curriculum data
    When I click the "Delete Web Development 2026" button
    Then I see a native browser confirmation dialog referencing "Web Development 2026"
    And the dialog message warns that semesters and courses will be removed
    When I confirm the deletion in the dialog
    Then either "Web Development 2026" and its dependent data are removed per product rules
    Or I see a blocking error explaining that linked data prevents deletion

  @TC-DS4-015 @Medium
  Scenario: Double-click confirm does not cause duplicate delete errors
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists
    When I click the "Delete Test Program" button
    And I see a native browser confirmation dialog referencing "Test Program"
    When I double-click the confirm action rapidly
    Then the confirmation dialog closes
    And "Test Program" is no longer shown in the program list
    And I do not see duplicate error messages or server errors

  @TC-DS4-016 @Low
  Scenario: Delete control is an accessible icon button on the program row
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists
    Then I see a "Delete Test Program" button on the program row
    And the button has an accessible name matching the program being deleted

  @TC-DS4-017 @Low
  Scenario: Program with long name displays correctly in confirmation dialog
    Given I am logged in as admin
    And I am on the Programs page
    And a program with a 255-character name exists in the list
    When I click the delete button for that program
    Then I see a native browser confirmation dialog
    And the dialog message references the full program name
    When I confirm the deletion in the dialog
    Then the program is no longer shown in the program list

  @TC-DS4-019 @Low
  Scenario: Deleted program name can be reused when creating a new program
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists
    When I click the "Delete Test Program" button
    And I confirm the deletion in the dialog
    Then "Test Program" is no longer shown in the program list
    When I click "+ New Program"
    And I fill in "Program Name" with "Test Program"
    And I fill in "Description" with "Recreated after deletion"
    And I click "Create"
    Then the "New Program" modal closes
    And the program list shows "Test Program"

  @TC-DS4-020 @Low
  Scenario: Delete cannot be initiated while another modal is open without predictable UI behavior
    Given I am logged in as admin
    And I am on the Programs page with the "New Program" modal open
    And a program "Test Program" exists in the list behind the modal
    When I attempt to click "Delete Test Program" from the list
    Then either delete is blocked until the modal is closed
    Or the modal closes and the delete confirmation dialog appears
    And no partial or inconsistent UI state occurs

  # Ambiguities and gaps
  # - Jira AC says "delete icon"; real app uses accessible button "Delete {programName}" on each table row
  # - Jira AC says "confirmation dialog"; observed: native browser window.confirm, not an in-app modal
  # - Native confirm uses OK/Cancel labels, not custom "Delete" / "Cancel" button copy (TC-DS4-016)
  # - Observed confirm message: 'Delete program "{name}"? All its semesters and courses will be removed. This cannot be undone.'
  # - No in-app X close control on native confirm; Cancel and Escape dismiss without deleting
  # - Linked curriculum / cascade delete: confirm warns about semesters/courses; cascade behavior needs product confirmation
  # - Last program / empty state: not in DS-4 ACs; related to DS-5 empty-state display
  # - Non-admin access: not defined in ACs; TC-DS4-006 needs non-admin credentials
  # - Soft delete vs hard delete: unclear whether deletion is permanent or recoverable; impacts name reuse (DS-3)
  # - Success feedback: ACs specify list removal only; no toast, banner, or undo window defined
  # - Concurrent delete: no AC covers stale delete after another session removed the program
  # - Audit trail: whether deletion is logged for compliance is not mentioned
  # - Keyboard and screen-reader accessibility for native confirm depends on browser implementation
