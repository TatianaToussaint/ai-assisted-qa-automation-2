# Test Plan: Create New Academic Program

**Feature:** Create new academic program  
**User story:** As an admin user, I want to create a new academic program so that I can begin designing its curriculum structure.  
**Reference:** Confluence — Program Setup & Management > Overview

---

## Positive Flows

### TC-DS1-001 — Navigate to program creation form

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- An admin user account exists and is active.
- At least one program may or may not exist in the system (form access is independent of list state).

**Steps:**
```gherkin
Given I am logged in as admin
When I navigate to the Programs page
And I click "+ New Program"
Then I see the program creation form with fields: Program Name, Description
And I see a "Create" button
And I see a way to cancel or close the form
```

**Expected result:**
- The program creation modal or form opens.
- Fields **Program Name** and **Description** are visible and editable.
- **Create** is present (disabled until a valid Program Name is entered per validation rules).

**AC mapping:** Navigate to program creation form

---

### TC-DS1-002 — Successfully create a program with name and description

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- I am on the Programs page.
- No program named **Web Development 2026** exists (or duplicate rules allow creation in test environment).

**Steps:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with "Web Development 2026"
And I fill in Description with "Full-stack web development program"
And I click Create
Then the modal closes
And the program list shows "Web Development 2026"
And the program list shows Description "Full-stack web development program"
```

**Expected result:**
- The creation form closes without error.
- **Web Development 2026** appears in the program list with the entered description.
- No duplicate or validation error is shown.

**AC mapping:** Successfully create a program

---

### TC-DS1-003 — Create program with name only and empty description

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- I am on the program creation form.
- No program named **Data Science Fundamentals** exists.

**Steps:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with "Data Science Fundamentals"
And I leave Description empty
And I click Create
Then the modal closes
And the program list shows "Data Science Fundamentals"
```

**Expected result:**
- **Create** is enabled when Program Name is filled and Description is empty.
- Program is created successfully; description displays as empty or with an agreed empty-state presentation (e.g., blank or em dash).

**AC mapping:** Extension — Description optional on create

---

### TC-DS1-004 — Create program with special characters in name

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- I am on the program creation form.
- No program named **Informatique & IA - Niveau 2** exists.

**Steps:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with "Informatique & IA - Niveau 2"
And I fill in Description with "Programme bilingue en informatique et intelligence artificielle"
And I click Create
Then the modal closes
And the program list shows "Informatique & IA - Niveau 2"
```

**Expected result:**
- Special characters (`&`, `-`, spaces, accented characters) are accepted and stored without corruption or encoding issues.
- Program appears in the list exactly as entered.

**AC mapping:** Extension — special characters in name

---

### TC-DS1-005 — Program list refreshes after successful create

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- The Programs page is open and shows the current program list.

**Steps:**
```gherkin
Given I am on the Programs page
When I click "+ New Program"
And I fill in Program Name with "Cloud Engineering 2026"
And I fill in Description with "AWS and Azure cloud engineering track"
And I click Create
Then the modal closes
And the program list includes "Cloud Engineering 2026" without manual page refresh
```

**Expected result:**
- The new program appears in the list immediately after create completes.
- No full page reload is required unless explicitly designed that way.

**AC mapping:** Extension — list update after create

---

## Negative Flows

### TC-DS1-006 — Create button disabled when Program Name is empty

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- I am on the program creation form.

**Steps:**
```gherkin
Given I am on the program creation form
When I leave the Program Name field empty
Then the Create button is disabled
```

**Expected result:**
- **Create** cannot be clicked while Program Name is empty.
- No program is created.

**AC mapping:** Validation prevents empty program name

---

### TC-DS1-007 — Cannot create program with duplicate name

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- A program named **Web Development 2026** already exists in the system.

**Steps:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with "Web Development 2026"
And I fill in Description with "Another description for duplicate test"
And I click Create
Then I see an error indicating the program name already exists
And the modal remains open
And no duplicate "Web Development 2026" entry is added to the program list
```

**Expected result:**
- Creation is rejected with a clear duplicate-name error.
- Existing program data is unchanged.
- User can correct the name without losing other field values.

**AC mapping:** Extension — duplicate program name (negative)

---

### TC-DS1-008 — Non-admin user cannot access program creation

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- A non-admin user account exists (e.g., instructor or read-only role).
- Program creation is restricted to admin users per Confluence — Program Setup & Management > Overview.

**Steps:**
```gherkin
Given I am logged in as a non-admin user
When I navigate to the Programs page
Then I do not see "+ New Program"
Or I cannot open the program creation form
Or I receive an access denied message if creation is attempted via direct URL
```

**Expected result:**
- Non-admin users cannot create programs.
- No unauthorized program records are created.

**AC mapping:** Extension — non-admin access denied

---

### TC-DS1-009 — Cancel creation discards unsaved data

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- I am on the program creation form.
- No program named **Cancelled Program Test** exists.

**Steps:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with "Cancelled Program Test"
And I fill in Description with "This should not be saved"
And I click Cancel
Or I close the modal via the X control
Then the modal closes
And the program list does not show "Cancelled Program Test"
```

**Expected result:**
- Cancel or close dismisses the form without persisting data.
- Program list remains unchanged.

**AC mapping:** Extension — cancel modal without saving

---

### TC-DS1-010 — Create blocked when Program Name is cleared after initial entry

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- I am on the program creation form.

**Steps:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with "Temporary Name"
And I clear the Program Name field completely
Then the Create button is disabled
```

**Expected result:**
- **Create** returns to disabled state when Program Name is cleared.
- User cannot submit an empty name after toggling field content.

**AC mapping:** Validation prevents empty program name (variant)

---

## Edge Cases

### TC-DS1-011 — Whitespace-only Program Name treated as empty

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- I am on the program creation form.

**Steps:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with "   "
And I fill in Description with "Description with whitespace-only name test"
Then the Create button is disabled
Or I see a validation message that Program Name is required
```

**Expected result:**
- Whitespace-only input is trimmed and treated as empty.
- No program with a blank or whitespace-only name is created.

**AC mapping:** Extension — whitespace-only name

---

### TC-DS1-012 — Program Name at maximum allowed length

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- I am on the program creation form.
- The system maximum length for Program Name is known (e.g., 255 characters) or will be discovered during execution.

**Steps:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with a string of exactly the maximum allowed length
And I fill in Description with "Boundary test for max-length program name"
And I click Create
Then the modal closes
And the program list shows the program with the full max-length name without truncation
```

**Expected result:**
- Name at exact max length is accepted and displayed correctly in the list.
- No overflow, layout break, or silent truncation occurs.

**AC mapping:** Extension — max-length name (boundary)

---

### TC-DS1-013 — Program Name exceeding maximum allowed length

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- I am on the program creation form.
- Maximum Program Name length is defined by the application.

**Steps:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with a string one character longer than the maximum allowed length
And I fill in Description with "Over-limit name test"
And I attempt to click Create
Then I see a validation error for Program Name length
Or the field prevents input beyond the maximum length
And no program is created
```

**Expected result:**
- Over-limit names are rejected or prevented at input.
- User receives clear feedback about the length constraint.

**AC mapping:** Extension — max-length name (over boundary)

---

### TC-DS1-014 — Description at maximum allowed length

| Field | Value |
|-------|-------|
| **Priority** | Low |

**Preconditions:**
- I am logged in as admin.
- I am on the program creation form.
- Maximum Description length is defined by the application.

**Steps:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with "Long Description Boundary Test"
And I fill in Description with a string of exactly the maximum allowed length
And I click Create
Then the modal closes
And the program list shows "Long Description Boundary Test"
And the full description is stored and retrievable on program detail or edit view
```

**Expected result:**
- Description at max length is accepted without error.
- Stored value matches input without truncation unless UI truncates display only.

**AC mapping:** Extension — max-length description

---

### TC-DS1-015 — Leading and trailing whitespace trimmed from Program Name on create

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- I am on the program creation form.
- No program named **Mobile Development 2026** exists.

**Steps:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with "  Mobile Development 2026  "
And I fill in Description with "Trim behavior test"
And I click Create
Then the modal closes
And the program list shows "Mobile Development 2026"
And the program list does not show "  Mobile Development 2026  "
```

**Expected result:**
- Leading and trailing whitespace is trimmed before save.
- Inner spaces within the name are preserved.

**AC mapping:** Extension — whitespace trimming

---

### TC-DS1-016 — Unicode and extended special characters in Program Name

| Field | Value |
|-------|-------|
| **Priority** | Low |

**Preconditions:**
- I am logged in as admin.
- I am on the program creation form.

**Steps:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with "プログラム — École №1 (2026)"
And I fill in Description with "Unicode and symbol boundary test"
And I click Create
Then the modal closes
And the program list shows "プログラム — École №1 (2026)" exactly as stored after any normalization rules
```

**Expected result:**
- Unicode characters (CJK, accented Latin, symbols) are handled consistently.
- Display in the list matches persisted value.

**AC mapping:** Extension — unicode/special characters beyond AC example

---

### TC-DS1-017 — Double-click Create does not create duplicate programs

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- I am on the program creation form.
- No program named **Cybersecurity 2026** exists.

**Steps:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with "Cybersecurity 2026"
And I fill in Description with "Security fundamentals program"
And I double-click the Create button rapidly
Then exactly one program named "Cybersecurity 2026" exists in the program list
```

**Expected result:**
- Idempotent submit behavior: only one program record is created.
- **Create** is disabled or request is debounced during submission.

**AC mapping:** Extension — duplicate submission guard

---

### TC-DS1-018 — Create first program when list is empty

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- No programs exist in the system (empty state on Programs page).

**Steps:**
```gherkin
Given I am on the Programs page
And the program list is empty
When I click "+ New Program"
And I fill in Program Name with "Web Development 2026"
And I fill in Description with "Full-stack web development program"
And I click Create
Then the modal closes
And the empty state is replaced by a list showing "Web Development 2026"
```

**Expected result:**
- First program creation succeeds from empty state.
- Empty-state messaging is removed after successful create.

**AC mapping:** Extension — create from empty program list

---

## Acceptance Criteria Coverage Matrix

| AC Scenario | Test Case(s) |
|-------------|--------------|
| Navigate to program creation form | TC-DS1-001 |
| Successfully create a program | TC-DS1-002 |
| Validation prevents empty program name | TC-DS1-006, TC-DS1-010 |

---

## Ambiguities / Gaps in ACs

1. **Description required or optional:** ACs do not state whether Description is mandatory. TC-DS1-003 assumes it is optional; confirm with product/Confluence spec.
2. **Maximum field lengths:** No AC defines max length for Program Name or Description. TC-DS1-012 through TC-DS1-014 depend on undocumented limits.
3. **Duplicate name rules:** Duplicate prevention is not in DS-1 ACs (covered in DS-3); behavior on create should be aligned across tickets.
4. **Whitespace handling:** ACs only cover fully empty name, not whitespace-only or trim behavior (TC-DS1-011, TC-DS1-015).
5. **Modal vs. full-page form:** ACs refer to a modal closing on success; layout type (modal vs. dedicated page) is not specified.
6. **Post-create navigation:** Unclear whether user remains on Programs list or is redirected to curriculum design for the new program (user story mentions designing curriculum structure).
7. **Success feedback:** No AC requires a toast, banner, or inline success message after create—only list visibility is specified.
8. **Role model:** "Admin" is referenced but other roles and permission boundaries are not defined in DS-1 ACs.
9. **Case sensitivity for names:** Unclear whether **web development 2026** and **Web Development 2026** are considered duplicates.
10. **Special characters:** DS-1 ACs do not mention allowed character sets; DS-3 partially covers this for a different ticket scope.
