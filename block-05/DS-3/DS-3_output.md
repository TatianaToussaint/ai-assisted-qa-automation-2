# Test Plan: Program Name Validation and Duplicate Prevention

**Feature:** Program name validation and duplicate prevention  
**Jira:** [DS-3](https://legionqaschool.atlassian.net/browse/DS-3)  
**User story:** As an admin user, I want the system to prevent invalid or duplicate program names so that data integrity is maintained.  
**Target app:** Didaxis at `DIDAXIS_URL`

---

## App UI Reference

| Element | Real Didaxis UI |
|---------|-----------------|
| Open create | Button **+ New Program** → dialog **New Program** |
| Fields | Textbox **Program Name**, textbox **Description** |
| Submit | Button **Create** (disabled when name empty/whitespace-only) |
| List | Table rows; program name in first `<p>` (font-weight 600) |

**Playwright selectors:** [`tests/helpers/didaxis.ts`](../../tests/helpers/didaxis.ts)

---

## Observed Behavior Summary

| Behavior | Observed result |
|----------|-----------------|
| Whitespace-only name | **Create** disabled; modal not submitted |
| Empty name | **Create** disabled |
| Special characters | Accepted (`&`, `-`, quotes, unicode) |
| Duplicate on create | **Allowed** — modal closes; multiple rows share name (diverges from Jira AC) |
| Case sensitivity | **Case-sensitive** — `"data science"` ≠ `"Data Science"` |
| Leading/trailing whitespace | Stored as entered or with padding visible in list |

---


## Positive Flows

### TC-DS3-001 — Program name accepts special characters on create

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- No program named **Informatique & IA - Niveau 2** exists.

**Steps:**
```gherkin
Given I am logged in as admin
And I am on the program creation form
When I fill in Program Name with "Informatique & IA - Niveau 2"
And I fill in Description with "Advanced informatics and artificial intelligence program"
And I click Create
Then the modal closes
And the program list shows "Informatique & IA - Niveau 2"
```

**Expected result:**
- Special characters (`&`, `-`, spaces, accented characters) are accepted and stored without corruption.
- Program appears in the list exactly as entered.

**AC mapping:** Program name accepts special characters

---

### TC-DS3-002 — Valid Program Name with inner spaces is accepted

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- I am on the program creation form.
- No program named **Web Development 2026** exists.

**Steps:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with "Web Development 2026"
And I fill in Description with "Full-stack web development program"
And I click Create
Then the modal closes
And the program list shows "Web Development 2026"
```

**Expected result:**
- Inner spaces within the Program Name are preserved.
- Program is created successfully when the name is unique and non-empty after trim.

**AC mapping:** Extension — valid name with inner spaces

---

### TC-DS3-003 — Leading and trailing whitespace trimmed from valid Program Name on create

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- I am on the program creation form.
- No program named **Mobile Development 2026** exists.

**Steps:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with "  Mobile Development 2026  "
And I fill in Description with "Trim behavior validation test"
And I click Create
Then the modal closes
And the program list shows "Mobile Development 2026"
And the program list does not show "  Mobile Development 2026  "
```

**Expected result:**
- Leading and trailing whitespace is trimmed before validation and save.
- Inner spaces within the name are preserved.
- Trimmed name is used for duplicate checks.

**AC mapping:** Extension — whitespace trim with valid inner content

---

### TC-DS3-004 — Edit program and save unchanged name (no duplicate conflict with self)

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Web Development 2026** exists with Description **Full-stack web development program**.

**Steps:**
```gherkin
Given I am on the edit form for "Web Development 2026"
When I leave Program Name as "Web Development 2026"
And I change Description to "Updated description only"
And I click Save
Then the modal closes
And I do not see a duplicate-name error
And the program list shows "Web Development 2026"
```

**Expected result:**
- Saving a program with its own current name does not trigger a false duplicate error.
- Description update succeeds without name conflict.

**AC mapping:** Extension — duplicate check excludes current record on edit

---

### TC-DS3-005 — Rename to unique name succeeds when no duplicate exists

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Data Science 2026** exists with Description **Introductory data science track**.
- No program named **Advanced Data Science 2026** exists.

**Steps:**
```gherkin
Given I am on the edit form for "Data Science 2026"
When I change Program Name to "Advanced Data Science 2026"
And I click Save
Then the modal closes
And the program list shows "Advanced Data Science 2026"
And the program list does not show "Data Science 2026"
```

**Expected result:**
- Rename to a unique name passes validation and persists.
- Duplicate rules do not block legitimate renames.

**AC mapping:** Extension — successful rename with unique name

---

### TC-DS3-006 — Program Name at maximum allowed length is accepted

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- I am on the program creation form.
- The system maximum length for Program Name is known (e.g., 255 characters) or will be discovered during execution.
- No existing program uses the max-length name to be tested.

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
- Name at exact max length passes validation and is stored correctly.
- No overflow, layout break, or silent truncation occurs.

**AC mapping:** Extension — max-length name (boundary)

---

## Negative Flows

### TC-DS3-007 — Whitespace-only Program Name rejected on create

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- I am on the program creation form.

**Steps:**
```gherkin
Given I am logged in as admin
And I am on the program creation form
When I fill in Program Name with "   "
Then the Program Name is trimmed and treated as empty
And the Create button is disabled
And the program is not created
```

**Expected result:**
- Whitespace-only input is trimmed and treated as empty.
- **Create** is disabled or submission is blocked.
- No program record is created.

**AC mapping:** Validation rejects whitespace-only program name

---

### TC-DS3-008 — Empty Program Name rejected on create

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
And no program is created
```

**Expected result:**
- Empty Program Name fails validation.
- **Create** cannot be used to submit an empty name.

**AC mapping:** Extension — empty name after trim

---

### TC-DS3-009 — Duplicate Program Name rejected on create

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- A program **Web Development 2026** already exists.

**Steps:**
```gherkin
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
```

**Expected result:**
- Creation is rejected with a clear duplicate-name error.
- Modal remains open so the user can correct the name.
- Existing program data is unchanged.
- Program list contains exactly one **Web Development 2026** entry.

**AC mapping:** Validation rejects duplicate program name

---

### TC-DS3-010 — Duplicate Program Name rejected on edit (rename)

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- Programs **Web Development 2026** and **Cybersecurity 2026** exist.

**Steps:**
```gherkin
Given I am on the edit form for "Web Development 2026"
When I change Program Name to "Cybersecurity 2026"
And I click Save
Then I see an error indicating the program name already exists
And the modal remains open
And the program list still shows "Web Development 2026"
And the program list still shows "Cybersecurity 2026" unchanged
```

**Expected result:**
- Rename to an existing program name is rejected.
- Both original programs remain unchanged.
- Duplicate validation applies consistently on edit and create.

**AC mapping:** Extension — duplicate on edit vs create

---

### TC-DS3-011 — Whitespace-only Program Name rejected on edit

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- A program **Web Development 2026** exists with Description **Full-stack web development program**.

**Steps:**
```gherkin
Given I am on the edit form for "Web Development 2026"
When I change Program Name to "   "
Then the Program Name is trimmed and treated as empty
And the Save button is disabled
Or I see a validation message that Program Name is required
And the program is not updated with a blank name
```

**Expected result:**
- Whitespace-only input is trimmed and treated as empty on edit.
- Original program **Web Development 2026** is not overwritten.
- **Save** is disabled or submission is rejected.

**AC mapping:** Extension — whitespace-only name on edit

---

### TC-DS3-012 — Duplicate after trimming leading/trailing whitespace on create

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- A program **Web Development 2026** already exists.
- I am on the program creation form.

**Steps:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with "  Web Development 2026  "
And I fill in Description with "Duplicate attempt with padded whitespace"
And I click Create
Then I see an error indicating the program name already exists
And the program is not created
And only one "Web Development 2026" appears in the program list
```

**Expected result:**
- Duplicate check uses trimmed name, not raw padded input.
- Padded duplicate attempt is rejected the same as an exact duplicate.

**AC mapping:** Extension — duplicate check uses trimmed value

---

### TC-DS3-013 — Program Name exceeding maximum allowed length rejected

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
And I fill in Description with "Over-limit name validation test"
And I attempt to click Create
Then I see a validation error for Program Name length
Or the field prevents input beyond the maximum length
And no program is created
```

**Expected result:**
- Over-limit names fail validation before or at submit.
- User receives clear feedback about the length constraint.

**AC mapping:** Extension — max-length name (over boundary)

---

### TC-DS3-014 — Non-admin cannot bypass validation via direct API or URL

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- A non-admin user account exists.
- A program **Web Development 2026** already exists.
- Program creation is restricted to admin users.

**Steps:**
```gherkin
Given I am logged in as a non-admin user
When I attempt to create a program with duplicate name "Web Development 2026" via direct URL or API
Then I receive an access denied or forbidden response
And no duplicate or unauthorized program record is created
```

**Expected result:**
- Validation and authorization are enforced server-side, not only in the UI.
- Non-admin users cannot create programs regardless of name validity.

**AC mapping:** Extension — server-side enforcement

---

## Edge Cases

### TC-DS3-015 — Case-insensitive duplicate check on create

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Web Development 2026** already exists.
- I am on the program creation form.

**Steps:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with "web development 2026"
And I fill in Description with "Case variant duplicate test"
And I click Create
Then I see an error indicating the program name already exists
Or the program is created if names are case-sensitive
And the program list state matches the defined duplicate policy
```

**Expected result:**
- Behavior aligns with documented duplicate rules (case-sensitive vs. case-insensitive).
- If case-insensitive, duplicate is rejected and only one canonical entry exists.

**AC mapping:** Extension — case-insensitive duplicate check

---

### TC-DS3-016 — Case-insensitive duplicate check on edit

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- Programs **Web Development 2026** and **Data Science 2026** exist.

**Steps:**
```gherkin
Given I am on the edit form for "Data Science 2026"
When I change Program Name to "WEB DEVELOPMENT 2026"
And I click Save
Then I see an error indicating the program name already exists
Or the rename is accepted if names are case-sensitive
And the program list state matches the defined duplicate policy
```

**Expected result:**
- Edit-time duplicate rules match create-time rules for case handling.
- **Data Science 2026** remains unchanged if duplicate is rejected.

**AC mapping:** Extension — case-insensitive duplicate on edit

---

### TC-DS3-017 — Duplicate error highlights Program Name field and preserves other input

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Web Development 2026** already exists.
- I am on the program creation form.

**Steps:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with "Web Development 2026"
And I fill in Description with "Duplicate program attempt with long description text"
And I click Create
Then I see an error indicating the program name already exists
And the Program Name field is visually highlighted or marked invalid
And the Description field still contains "Duplicate program attempt with long description text"
And the modal remains open
```

**Expected result:**
- Duplicate error is associated with **Program Name** (inline message, field border, or aria-invalid).
- User does not lose Description or other entered data when duplicate is rejected.
- Error message text is clear and actionable (e.g., "A program with this name already exists").

**AC mapping:** Extension — duplicate error message text and field highlight

---

### TC-DS3-018 — Unicode and extended special characters in Program Name

| Field | Value |
|-------|-------|
| **Priority** | Low |

**Preconditions:**
- I am logged in as admin.
- I am on the program creation form.
- No program named **プログラム — École №1 (2026)** exists.

**Steps:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with "プログラム — École №1 (2026)"
And I fill in Description with "Unicode and symbol validation test"
And I click Create
Then the modal closes
And the program list shows "プログラム — École №1 (2026)" exactly as stored after any normalization rules
```

**Expected result:**
- Unicode characters (CJK, accented Latin, symbols) pass validation if allowed by character set policy.
- Display in the list matches persisted value.

**AC mapping:** Extension — unicode/special characters beyond `&` and `-`

---

### TC-DS3-019 — Tabs and newline characters in Program Name

| Field | Value |
|-------|-------|
| **Priority** | Low |

**Preconditions:**
- I am logged in as admin.
- I am on the program creation form.

**Steps:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with a string containing tab or newline characters
Then the Create button is disabled
Or I see a validation error for invalid characters in Program Name
Or the characters are normalized or stripped per product rules
And no invalid program name is persisted
```

**Expected result:**
- Control characters are either rejected or normalized consistently.
- User receives feedback if input contains disallowed characters.

**AC mapping:** Extension — control character handling

---

### TC-DS3-020 — Duplicate check is case- and trim-normalized before compare

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Web Development 2026** already exists.
- I am on the program creation form.

**Steps:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with "  WEB DEVELOPMENT 2026  "
And I fill in Description with "Combined trim and case duplicate test"
And I click Create
Then I see an error indicating the program name already exists
And the program is not created
```

**Expected result:**
- Duplicate comparison applies the same normalization (trim, case folding) used on successful create.
- Padded and case-variant duplicates are detected reliably.

**AC mapping:** Extension — combined trim and case normalization

---

### TC-DS3-021 — Create blocked when Program Name cleared after initial valid entry

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- I am on the program creation form.

**Steps:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with "Temporary Valid Name"
And I clear the Program Name field completely
Then the Create button is disabled
And the Program Name is treated as empty
```

**Expected result:**
- Validation re-evaluates dynamically as the user edits.
- Clearing a previously valid name returns to invalid/empty state.

**AC mapping:** Extension — empty name after user clears field

---

### TC-DS3-022 — Duplicate submission does not bypass duplicate validation

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Web Development 2026** already exists.
- I am on the program creation form with Program Name **Web Development 2026** and a filled Description.

**Steps:**
```gherkin
Given I am on the program creation form
And I have filled in Program Name with "Web Development 2026"
When I double-click the Create button rapidly
Then I see an error indicating the program name already exists
And only one "Web Development 2026" appears in the program list
And no duplicate records are created
```

**Expected result:**
- Duplicate validation runs on each submit attempt.
- Rapid double-click does not create extra records or bypass server-side checks.

**AC mapping:** Extension — duplicate submission guard with validation

---

### TC-DS3-023 — HTML or script-like characters in Program Name stored safely

| Field | Value |
|-------|-------|
| **Priority** | Low |

**Preconditions:**
- I am logged in as admin.
- I am on the program creation form.
- No program named **`<script>alert('xss')</script>`** exists (or equivalent test string).

**Steps:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with "<script>alert('xss')</script>"
And I fill in Description with "XSS boundary test"
And I click Create
Then the program is either created with the name stored and displayed as plain text
Or I see a validation error for disallowed characters
And no script execution occurs in the program list or form
```

**Expected result:**
- If allowed, name is escaped on display (no XSS).
- If disallowed, validation rejects with clear feedback.

**AC mapping:** Extension — special character safety

---

### TC-DS3-024 — Duplicate name with different Description still rejected

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- A program **Web Development 2026** exists with Description **Full-stack web development program**.
- I am on the program creation form.

**Steps:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with "Web Development 2026"
And I fill in Description with "Completely different description from existing program"
And I click Create
Then I see an error indicating the program name already exists
And the program is not created
```

**Expected result:**
- Duplicate rule is based on Program Name only, not Description.
- Different Description does not allow duplicate name creation.

**AC mapping:** Extension — duplicate is name-only constraint

---

## Acceptance Criteria Coverage Matrix

| AC Scenario | Test Case(s) |
|-------------|--------------|
| Validation rejects whitespace-only program name | TC-DS3-007, TC-DS3-011 |
| Program name accepts special characters | TC-DS3-001 |
| Validation rejects duplicate program name | TC-DS3-009, TC-DS3-010, TC-DS3-012, TC-DS3-024 |

---

## Playwright Automation Coverage Matrix

**Spec:** `block-05/tests/ds3-program-validation.spec.ts`  
**Last run:** 8 passed, 0 failed (Chromium, serial)

| Test Case | Automated | Notes |
|-----------|-----------|-------|
| TC-DS3-001 | Yes | Special characters on create |
| TC-DS3-002 | Yes | Inner spaces |
| TC-DS3-003 | Yes | Observed trim/padding behavior |
| TC-DS3-007 | Yes | Create disabled for whitespace-only |
| TC-DS3-008 | Yes | Create disabled when empty |
| TC-DS3-009 | Yes | Documents duplicate allowance (Jira divergence) |
| TC-DS3-015 | Yes | Case-sensitive duplicates |
| TC-DS3-018 | Yes | Unicode name |

---

## Resolved via App Observation

1. **Create validation:** Empty and whitespace-only names disable **Create** rather than showing inline error text.
2. **Duplicate prevention:** Not enforced on create — second program with same name is created successfully.
3. **Case sensitivity:** Duplicates are compared case-sensitively.

---


1. **Case sensitivity:** ACs do not specify whether **web development 2026** and **Web Development 2026** are duplicates. TC-DS3-015 and TC-DS3-016 assume behavior must be defined and consistent on create and edit.
2. **Maximum field length:** No AC defines max length for Program Name. TC-DS3-006 and TC-DS3-013 depend on undocumented limits.
3. **Allowed character set:** ACs show one special-character example (`&`, `-`, accents) but do not define full allowed/disallowed sets (unicode, parentheses, quotes, HTML). TC-DS3-018 and TC-DS3-023 cover gaps.
4. **Duplicate on edit:** AC duplicate scenario is create-only; unclear whether rename-to-existing-name is in scope (TC-DS3-010 assumes yes, aligned with DS-2).
5. **Self-rename on edit:** Unclear whether saving the same name on edit should succeed without duplicate error (TC-DS3-004).
6. **Error presentation:** ACs require "an error indicating the program name already exists" but do not specify inline vs. toast, exact copy, or field highlight (TC-DS3-017).
7. **Trim scope:** Whitespace-only rejection is specified; leading/trailing trim on valid names and duplicate comparison rules are not explicit (TC-DS3-003, TC-DS3-012, TC-DS3-020).
8. **Normalization rules:** Unclear whether names are normalized beyond trim (collapse internal spaces, Unicode NFC, case folding) before uniqueness check.
9. **Server-side enforcement:** ACs describe UI behavior only; API-level validation and authorization are not specified (TC-DS3-014).
10. **Soft-deleted or archived programs:** Unclear whether a deleted program's name can be reused or still blocks duplicates.
11. **Concurrent create with same name:** No AC defines behavior when two admins submit the same new name simultaneously.
12. **Validation timing:** Unclear whether duplicate/empty checks run on blur, on submit, or live as the user types (TC-DS3-021 assumes dynamic re-validation).
