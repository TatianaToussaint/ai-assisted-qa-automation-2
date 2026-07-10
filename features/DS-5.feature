Feature: Program list filtering and display
  DS-5 — Admin sees all programs in a clear list to find and manage them quickly

  # Happy paths

  @TC-DS5-001 @High @AC-DisplayProgramListWithKeyDetails
  Scenario: Program list displays name and description for each program
    Given I am logged in as admin
    And the following programs exist:
      | Program Name         | Description                              |
      | Web Development 2026 | Full-stack web development program       |
      | Data Science 2026    | Data analysis and machine learning track |
    When I navigate to the Programs page
    Then I see a program list in a table
    And the list shows "Web Development 2026" with Description "Full-stack web development program"
    And the list shows "Data Science 2026" with Description "Data analysis and machine learning track"
    And each row shows "Edit {programName}" and "Delete {programName}" actions

  @TC-DS5-002 @High @AC-EmptyStateWhenNoProgramsExist
  Scenario: Empty state when no programs exist
    Given I am logged in as admin
    And no programs exist in the system
    When I navigate to the Programs page
    Then I see an empty state message indicating no programs are available
    And I see a prompt to create the first program
    And I see the "+ New Program" button

  @TC-DS5-003 @High
  Scenario: Empty state CTA opens the program creation form
    Given I am logged in as admin
    And I am on the Programs page with no programs
    And I see an empty state message indicating no programs are available
    When I click "+ New Program"
    Then I see the "New Program" modal dialog
    And the "Program Name" field is visible and editable
    And the "Description" field is visible and editable
    And the "Create" button is present

  @TC-DS5-004 @Medium
  Scenario: List displays a single program correctly
    Given I am logged in as admin
    And only one program "Web Development 2026" exists with Description "Full-stack web development program"
    When I navigate to the Programs page
    Then I see a program list with one entry
    And the list shows "Web Development 2026" with Description "Full-stack web development program"
    And I do not see an empty state message
    And I see the "+ New Program" button

  @TC-DS5-005 @High
  Scenario: List refreshes after creating a new program without manual reload
    Given I am logged in as admin
    And I am on the Programs page
    And the program list shows "Web Development 2026"
    When I click "+ New Program"
    And I fill in "Program Name" with "Data Science 2026"
    And I fill in "Description" with "Data analysis and machine learning track"
    And I click "Create"
    Then the "New Program" modal closes
    And the program list shows "Web Development 2026"
    And the program list shows "Data Science 2026" with Description "Data analysis and machine learning track"

  @TC-DS5-006 @Medium
  Scenario: List refreshes after editing program details
    Given I am logged in as admin
    And I am on the Programs page
    And the program list shows "Web Development 2026" with Description "Full-stack web development program"
    When I click "Edit Web Development 2026"
    And I change "Description" to "Updated full-stack curriculum for 2026"
    And I click "Save"
    Then the program list shows "Web Development 2026" with Description "Updated full-stack curriculum for 2026"

  @TC-DS5-007 @Medium
  Scenario: List refreshes after deleting a program
    Given I am logged in as admin
    And I am on the Programs page
    And the program list shows "Test Program" and "Web Development 2026"
    When I click "Delete Test Program"
    And I confirm the deletion in the native browser dialog
    Then "Test Program" is no longer shown in the program list
    And "Web Development 2026" is still shown in the program list

  @TC-DS5-008 @Medium
  Scenario: Program with special characters displays correctly in the list
    Given I am logged in as admin
    And a program "Informatique & IA - Niveau 2" exists with Description "Programme bilingue — informatique & intelligence artificielle"
    When I navigate to the Programs page
    Then the list shows "Informatique & IA - Niveau 2"
    And the list shows Description "Programme bilingue — informatique & intelligence artificielle"
    And special characters are rendered correctly without HTML encoding artifacts

  @TC-DS5-009 @Medium
  Scenario: Program with empty description displays appropriately in the list
    Given I am logged in as admin
    And a program "Data Science Fundamentals" exists with an empty Description
    When I navigate to the Programs page
    Then the list shows "Data Science Fundamentals"
    And the Description area for "Data Science Fundamentals" is blank
    And the row layout remains aligned with programs that have descriptions

  @TC-DS5-010 @Low
  Scenario: Programs page shows heading, subtitle, and list structure
    Given I am logged in as admin
    And multiple programs exist in the system
    When I navigate to the Programs page
    Then I see the page heading "Programs"
    And I see the subtitle "Manage academic programs and semesters"
    And each program entry visually associates its name with its description
    And I see the "+ New Program" button in a consistent location

  # Negative

  @TC-DS5-011 @High
  Scenario: Non-admin user cannot access the program list
    Given I am logged in as a non-admin user
    When I attempt to navigate to the Programs page
    Then I am denied access or redirected away from the program list
    And I do not see program names or descriptions from the admin list

  @TC-DS5-012 @High
  Scenario: Unauthenticated user cannot view the program list
    Given I am not logged in
    When I attempt to navigate to the Programs page directly via URL
    Then I am redirected to login or receive an access denied response
    And I do not see the program list or empty state content

  @TC-DS5-013 @Medium
  Scenario: Empty state does not show stale or phantom program rows
    Given I am logged in as admin
    And no programs exist in the system
    When I navigate to the Programs page
    Then I see the empty state message
    And I do not see any program rows with names or descriptions
    And I do not see cached data from a previous session's program list

  @TC-DS5-015 @Medium
  Scenario: Failed list load shows error, not misleading empty state
    Given I am logged in as admin
    And programs exist but the program list API returns an error
    When I navigate to the Programs page
    Then I do not see the empty state message prompting me to create the first program
    And I see an error message or retry option indicating the list failed to load

  # Edge cases

  @TC-DS5-016 @Medium
  Scenario: Long program name is truncated or wrapped readably in the list
    Given I am logged in as admin
    And a program with a 255-character name exists in the system
    When I navigate to the Programs page
    Then the list shows the program entry for that long name
    And the full name is readable via wrap, tooltip, or expand without breaking list layout
    And adjacent program rows remain aligned

  @TC-DS5-017 @Medium
  Scenario: Long description is truncated or expandable in the list
    Given I am logged in as admin
    And "Web Development 2026" has a very long Description
    When I navigate to the Programs page
    Then the list shows "Web Development 2026"
    And the Description is truncated with ellipsis, clamped lines, or expandable detail
    And expanding or hovering reveals the full description text if truncated

  @TC-DS5-018 @Medium
  Scenario: Many programs remain accessible via scroll or pagination
    Given I am logged in as admin
    And many programs exist in the system
    When I navigate to the Programs page
    Then I see the program list
    And I can access all programs via scroll, pagination, or virtualized list behavior
    And each visible entry shows Program Name and Description

  @TC-DS5-021 @Low
  Scenario: Unicode and emoji in description display correctly in the list
    Given I am logged in as admin
    And "Global Studies 2026" exists with Description "Multilingual track: 日本語, العربية, 🎓 emoji test"
    When I navigate to the Programs page
    Then the list shows "Global Studies 2026"
    And the Description displays unicode and emoji characters correctly

  @TC-DS5-022 @High
  Scenario: HTML or script in name and description is rendered safely in the list
    Given I am logged in as admin
    And a program with HTML-like name and description exists in the system
    When I navigate to the Programs page
    Then the list shows the name and description as plain text
    And no script executes
    And no HTML is interpreted as active markup in the list

  @TC-DS5-023 @Medium
  Scenario: Deleting the last program transitions the list to empty state
    Given I am logged in as admin
    And I am on the Programs page
    And only "Test Program" exists in the list
    When I click "Delete Test Program"
    And I confirm the deletion in the native browser dialog
    Then I see an empty state message indicating no programs are available
    And I see a prompt to create the first program
    And I see the "+ New Program" button
    And I do not see "Test Program" in the list

  @TC-DS5-024 @Medium
  Scenario: Filter or search by program name narrows the visible list
    Given I am logged in as admin
    And I am on the Programs page
    And the full list shows "Web Development 2026", "Data Science 2026", and "Mobile Development 2026"
    When I enter "Web" in the program filter or search field
    Then the list shows "Web Development 2026"
    And the list does not show "Data Science 2026"
    And the list does not show "Mobile Development 2026"
    When I clear the filter
    Then all three programs are visible again

  @TC-DS5-025 @Low
  Scenario: Filter with no matches shows appropriate empty results state
    Given I am logged in as admin
    And I am on the Programs page with programs in the list
    When I enter "NonexistentProgramXYZ" in the filter or search field
    Then no program rows match the filter
    And I see a message indicating no programs match the search
    And I do not see the global empty state prompting creation of the first program
    When I clear the filter
    Then previously existing programs reappear in the list

  @TC-DS5-026 @Low
  Scenario: List remains usable on a narrow viewport
    Given I am logged in as admin
    And programs "Web Development 2026" and "Data Science 2026" exist
    When I navigate to the Programs page at a narrow viewport width of 375px
    Then I see the program list with name and description for each program
    And the "+ New Program" button remains accessible
    And horizontal overflow does not hide critical content without scroll

  # Ambiguities and gaps
  # - Feature title includes "filtering" but ACs only cover listing and empty state; no filter/search observed on live app (TC-DS5-024/025)
  # - Observed list layout: Mantine table; each row has bold program name and muted description in separate <p> elements
  # - Empty state exact copy not defined in ACs; full empty-state test needs isolated tenant with zero programs
  # - Empty description presentation: observed as blank second paragraph, not em dash or "No description"
  # - Sort order: no AC defines default ordering (alphabetical, created date, or manual)
  # - Pagination / virtualization: not specified for large program counts
  # - Truncation rules for long names and descriptions not specified in ACs
  # - Non-admin and unauthenticated access not defined in DS-5 ACs
  # - List refresh after create/edit/delete not required by ACs but expected in practice (DS-1/DS-2/DS-4)
  # - Failed API load vs genuinely zero programs not distinguished in ACs
  # - Duplicate names in list: DS-3 duplicate prevention not enforced on live app; case-variant names may coexist
  # - Accessibility: screen reader structure and keyboard navigation through rows not specified
  # - Cross-session staleness: whether list auto-refreshes on revisit is unspecified
