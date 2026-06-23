# Test Plan: Edit Existing Program Details

**Feature:** Edit existing program details  
**User story:** As an admin user, I want to edit an existing program's details so that I can correct or update program information after creation.

---

## Positive Flows

### TC-DS2-001 — Open edit form with pre-populated fields

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- An admin user account exists and is active.
- A program **Web Development 2026** exists with Description **Full-stack web development program**.

**Steps:**
```gherkin
Given I am logged in as admin
And a program "Web Development 2026" exists with Description "Full-stack web development program"
When I navigate to the Programs page
And I open the edit form for "Web Development 2026"
Then I see the edit form with Program Name pre-filled as "Web Development 2026"
And I see Description pre-filled as "Full-stack web development program"
And I see a "Save" button
And I see a way to cancel or close the form
```

**Expected result:**
- The edit modal or form opens for the selected program.
- **Program Name** and **Description** fields display the current stored values and are editable.
- **Save** is present and enabled when fields contain valid data.

**AC mapping:** Open edit form with pre-populated fields

---

### TC-DS2-002 — Successfully rename a program

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- A program **Web Development 2026** exists with Description **Full-stack web development program**.
- No program named **Web Development 2026 - Updated** exists.

**Steps:**
```gherkin
Given I am on the edit form for "Web Development 2026"
When I change Program Name to "Web Development 2026 - Updated"
And I click Save
Then the modal closes
And the program list shows "Web Development 2026 - Updated"
And the program list does not show "Web Development 2026"
```

**Expected result:**
- The edit form closes without error.
- The program list reflects the new name **Web Development 2026 - Updated**.
- The old name **Web Development 2026** no longer appears as a separate list entry.
- Description remains **Full-stack web development program** unless explicitly changed.

**AC mapping:** Successfully rename a program

---

### TC-DS2-003 — Edit Description only preserves Program Name

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- A program **Web Development 2026** exists with Description **Full-stack web development program**.

**Steps:**
```gherkin
Given I am on the edit form for "Web Development 2026"
When I leave Program Name as "Web Development 2026"
And I change Description to "Updated full-stack web development program"
And I click Save
Then the modal closes
And the program list shows Program Name "Web Development 2026"
And the program list shows Description "Updated full-stack web development program"
```

**Expected result:**
- Only the Description is updated in persistent storage.
- **Program Name** remains unchanged as **Web Development 2026**.
- No unintended field changes occur.

**AC mapping:** Edit Description only preserves Program Name

---

### TC-DS2-004 — Edit both Program Name and Description in one save

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
And I change Description to "Advanced machine learning and analytics program"
And I click Save
Then the modal closes
And the program list shows Program Name "Advanced Data Science 2026"
And the program list shows Description "Advanced machine learning and analytics program"
And the program list does not show "Data Science 2026"
```

**Expected result:**
- Both fields are updated atomically in a single save operation.
- The list displays both new values correctly.

**AC mapping:** Extension — combined name and description edit

---

### TC-DS2-005 — Edit program name with special characters

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Software Engineering Basics** exists with Description **Core software engineering fundamentals**.
- No program named **Informatique & IA - Niveau 2** exists.

**Steps:**
```gherkin
Given I am on the edit form for "Software Engineering Basics"
When I change Program Name to "Informatique & IA - Niveau 2"
And I click Save
Then the modal closes
And the program list shows "Informatique & IA - Niveau 2"
```

**Expected result:**
- Special characters (`&`, `-`, spaces, accented characters) are accepted on edit and stored without corruption.
- Program appears in the list exactly as entered.

**AC mapping:** Extension — special characters in edited name

---

### TC-DS2-006 — Program list refreshes after successful edit

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- The Programs page is open showing program **Cloud Engineering 2026** with Description **AWS and Azure cloud engineering track**.

**Steps:**
```gherkin
Given I am on the Programs page
When I open the edit form for "Cloud Engineering 2026"
And I change Description to "Multi-cloud engineering and DevOps track"
And I click Save
Then the modal closes
And the program list shows Description "Multi-cloud engineering and DevOps track" for "Cloud Engineering 2026" without manual page refresh
```

**Expected result:**
- Updated values appear in the list immediately after save completes.
- No full page reload is required unless explicitly designed that way.

**AC mapping:** Extension — list update after edit

---

### TC-DS2-007 — Save edit with no field changes

| Field | Value |
|-------|-------|
| **Priority** | Low |

**Preconditions:**
- I am logged in as admin.
- A program **Mobile Development 2026** exists with Description **iOS and Android development program**.

**Steps:**
```gherkin
Given I am on the edit form for "Mobile Development 2026"
When I do not change Program Name or Description
And I click Save
Then the modal closes
And the program list shows Program Name "Mobile Development 2026"
And the program list shows Description "iOS and Android development program"
```

**Expected result:**
- Save succeeds (or is a no-op) without error when no changes were made.
- Program data remains unchanged.
- No duplicate records or data corruption occurs.

**AC mapping:** Extension — edit with no changes

---

## Negative Flows

### TC-DS2-008 — Save blocked when Program Name is cleared

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- A program **Web Development 2026** exists with Description **Full-stack web development program**.

**Steps:**
```gherkin
Given I am on the edit form for "Web Development 2026"
When I clear the Program Name field completely
Then the Save button is disabled
Or I see a validation message that Program Name is required
And I cannot save the program with an empty name
```

**Expected result:**
- **Save** is disabled or submission is rejected when Program Name is empty.
- Original program **Web Development 2026** remains unchanged in the list.
- No program record is saved with a blank name.

**AC mapping:** Extension — Save with cleared Name

---

### TC-DS2-009 — Non-admin user cannot edit program

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- A non-admin user account exists (e.g., instructor or read-only role).
- A program **Web Development 2026** exists in the system.
- Program editing is restricted to admin users.

**Steps:**
```gherkin
Given I am logged in as a non-admin user
When I navigate to the Programs page
Then I do not see an edit action for "Web Development 2026"
Or I cannot open the edit form for "Web Development 2026"
Or I receive an access denied message if edit is attempted via direct URL
```

**Expected result:**
- Non-admin users cannot modify program details.
- No unauthorized updates are persisted.

**AC mapping:** Extension — non-admin access denied

---

### TC-DS2-010 — Rename rejected when new name duplicates existing program

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- Programs **Web Development 2026** and **Cybersecurity 2026** exist.
- **Cybersecurity 2026** is not the program being edited.

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
- Rename is rejected with a clear duplicate-name error.
- Both original programs remain unchanged.
- User can correct the name without losing other field values.

**AC mapping:** Extension — duplicate name on rename (negative)

---

### TC-DS2-011 — Cancel edit discards unsaved changes

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Web Development 2026** exists with Description **Full-stack web development program**.

**Steps:**
```gherkin
Given I am on the edit form for "Web Development 2026"
When I change Program Name to "Web Development 2026 - Updated"
And I change Description to "This change should not be saved"
And I click Cancel
Or I close the modal via the X control
Then the modal closes
And the program list shows Program Name "Web Development 2026"
And the program list shows Description "Full-stack web development program"
And the program list does not show "Web Development 2026 - Updated"
```

**Expected result:**
- Cancel or close dismisses the form without persisting changes.
- Original program data remains intact.

**AC mapping:** Extension — cancel edit without saving

---

### TC-DS2-012 — Rename to same name as another program (case variant)

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- Programs **Web Development 2026** and **Data Science 2026** exist.

**Steps:**
```gherkin
Given I am on the edit form for "Data Science 2026"
When I change Program Name to "web development 2026"
And I click Save
Then I see an error indicating the program name already exists
Or the rename is accepted if names are case-sensitive
And the program list state matches the defined duplicate policy
```

**Expected result:**
- Behavior aligns with system duplicate rules (case-sensitive vs. case-insensitive).
- If duplicates are forbidden, edit is rejected and **Data Science 2026** remains unchanged.

**AC mapping:** Extension — case-insensitive duplicate check on edit

---

## Edge Cases

### TC-DS2-013 — Program Name at maximum allowed length on edit

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Short Name Program** exists with Description **Program for max-length edit test**.
- The system maximum length for Program Name is known (e.g., 255 characters) or will be discovered during execution.

**Steps:**
```gherkin
Given I am on the edit form for "Short Name Program"
When I change Program Name to a string of exactly the maximum allowed length
And I click Save
Then the modal closes
And the program list shows the program with the full max-length name without truncation
```

**Expected result:**
- Name at exact max length is accepted on edit and displayed correctly in the list.
- No overflow, layout break, or silent truncation occurs.

**AC mapping:** Extension — max-length updated name (boundary)

---

### TC-DS2-014 — Program Name exceeding maximum allowed length on edit

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Boundary Edit Test** exists.
- Maximum Program Name length is defined by the application.

**Steps:**
```gherkin
Given I am on the edit form for "Boundary Edit Test"
When I change Program Name to a string one character longer than the maximum allowed length
And I attempt to click Save
Then I see a validation error for Program Name length
Or the field prevents input beyond the maximum length
And no update is saved
And the program list still shows "Boundary Edit Test"
```

**Expected result:**
- Over-limit names are rejected or prevented at input during edit.
- User receives clear feedback about the length constraint.
- Original program name is preserved.

**AC mapping:** Extension — max-length name (over boundary) on edit

---

### TC-DS2-015 — Whitespace-only Program Name treated as empty on edit

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
Then the Save button is disabled
Or I see a validation message that Program Name is required
And I cannot save the program
```

**Expected result:**
- Whitespace-only input is trimmed and treated as empty on edit.
- Original program **Web Development 2026** is not overwritten with a blank name.

**AC mapping:** Extension — whitespace-only name on edit

---

### TC-DS2-016 — Leading and trailing whitespace trimmed from Program Name on save

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Web Development 2026** exists with Description **Full-stack web development program**.
- No program named **Mobile Development 2026** exists.

**Steps:**
```gherkin
Given I am on the edit form for "Web Development 2026"
When I change Program Name to "  Mobile Development 2026  "
And I click Save
Then the modal closes
And the program list shows "Mobile Development 2026"
And the program list does not show "  Mobile Development 2026  "
```

**Expected result:**
- Leading and trailing whitespace is trimmed before save on edit.
- Inner spaces within the name are preserved.

**AC mapping:** Extension — whitespace trimming on edit

---

### TC-DS2-017 — Unicode and extended special characters in edited Program Name

| Field | Value |
|-------|-------|
| **Priority** | Low |

**Preconditions:**
- I am logged in as admin.
- A program **International Program** exists with Description **Global curriculum program**.

**Steps:**
```gherkin
Given I am on the edit form for "International Program"
When I change Program Name to "プログラム — École №1 (2026)"
And I click Save
Then the modal closes
And the program list shows "プログラム — École №1 (2026)" exactly as stored after any normalization rules
```

**Expected result:**
- Unicode characters (CJK, accented Latin, symbols) are handled consistently on edit.
- Display in the list matches persisted value.

**AC mapping:** Extension — unicode/special characters on edit

---

### TC-DS2-018 — Edit non-existent or deleted program

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Deleted Program Test** existed but was deleted by another session, or a stale edit URL/bookmark is used.

**Steps:**
```gherkin
Given I am logged in as admin
When I attempt to open the edit form for "Deleted Program Test" via direct URL or stale UI action
Then I see a not-found or program-unavailable error
Or I am redirected to the Programs page
And no edit form opens with invalid data
```

**Expected result:**
- System handles missing program gracefully.
- No partial or corrupt update is applied.

**AC mapping:** Extension — edit non-existent program

---

### TC-DS2-019 — Concurrent edit by two admin sessions

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- Two admin sessions (Session A and Session B) are logged in.
- A program **Web Development 2026** exists with Description **Full-stack web development program**.

**Steps:**
```gherkin
Given Session A opens the edit form for "Web Development 2026"
And Session B opens the edit form for "Web Development 2026"
When Session A changes Description to "Updated by Session A" and clicks Save
And Session B changes Description to "Updated by Session B" and clicks Save
Then the final stored Description reflects the defined concurrency policy (last-write-wins or conflict error)
And the program list shows a single consistent record for "Web Development 2026"
```

**Expected result:**
- Concurrent edits do not corrupt data or create duplicate records.
- User receives conflict feedback if optimistic locking or versioning is implemented.

**AC mapping:** Extension — concurrent edit

---

### TC-DS2-020 — Double-click Save does not cause duplicate updates or errors

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Web Development 2026** exists with Description **Full-stack web development program**.

**Steps:**
```gherkin
Given I am on the edit form for "Web Development 2026"
When I change Description to "Updated description from double-click test"
And I double-click the Save button rapidly
Then the modal closes
And exactly one program named "Web Development 2026" exists in the program list
And the Description is "Updated description from double-click test"
```

**Expected result:**
- Idempotent submit behavior: only one update is applied.
- **Save** is disabled or request is debounced during submission.

**AC mapping:** Extension — duplicate submission guard on edit

---

### TC-DS2-021 — Clear Description only preserves Program Name

| Field | Value |
|-------|-------|
| **Priority** | Low |

**Preconditions:**
- I am logged in as admin.
- A program **Web Development 2026** exists with Description **Full-stack web development program**.

**Steps:**
```gherkin
Given I am on the edit form for "Web Development 2026"
When I leave Program Name as "Web Development 2026"
And I clear the Description field completely
And I click Save
Then the modal closes
And the program list shows Program Name "Web Development 2026"
And the program list shows an empty Description or agreed empty-state presentation
```

**Expected result:**
- Clearing Description on edit is allowed if Description is optional.
- **Program Name** remains **Web Development 2026**.

**AC mapping:** Extension — clear description on edit

---

### TC-DS2-022 — Description at maximum allowed length on edit

| Field | Value |
|-------|-------|
| **Priority** | Low |

**Preconditions:**
- I am logged in as admin.
- A program **Long Description Edit Test** exists with a short description.
- Maximum Description length is defined by the application.

**Steps:**
```gherkin
Given I am on the edit form for "Long Description Edit Test"
When I change Description to a string of exactly the maximum allowed length
And I click Save
Then the modal closes
And the program list shows "Long Description Edit Test"
And the full description is stored and retrievable on subsequent edit view
```

**Expected result:**
- Description at max length is accepted on edit without error.
- Stored value matches input without truncation unless UI truncates display only.

**AC mapping:** Extension — max-length description on edit

---

### TC-DS2-023 — Dismiss edit form via Escape key without saving

| Field | Value |
|-------|-------|
| **Priority** | Low |

**Preconditions:**
- I am logged in as admin.
- A program **Web Development 2026** exists with Description **Full-stack web development program**.

**Steps:**
```gherkin
Given I am on the edit form for "Web Development 2026"
When I change Program Name to "Web Development 2026 - Updated"
And I press the Escape key
Then the modal closes
And the program list shows Program Name "Web Development 2026"
And the program list does not show "Web Development 2026 - Updated"
```

**Expected result:**
- Escape dismisses the edit form without saving changes, consistent with Cancel behavior.
- Original program data remains intact.

**AC mapping:** Extension — dismiss edit via Escape

---

## Acceptance Criteria Coverage Matrix

| AC Scenario | Test Case(s) |
|-------------|--------------|
| Open edit form with pre-populated fields | TC-DS2-001 |
| Successfully rename a program | TC-DS2-002 |
| Edit Description only preserves Program Name | TC-DS2-003 |

---

## Ambiguities / Gaps in ACs

1. **How to open edit form:** ACs say "open the edit form" but do not specify the UI control (row action menu, pencil icon, inline edit, or program detail page). TC-DS2-001 assumes a standard edit action from the Programs list.
2. **Description required or optional on edit:** ACs cover editing Description but not whether Description can be cleared. TC-DS2-021 assumes clearing is allowed; confirm with product spec.
3. **Maximum field lengths:** No AC defines max length for Program Name or Description on edit. TC-DS2-013, TC-DS2-014, and TC-DS2-022 depend on undocumented limits.
4. **Duplicate name on rename:** DS-2 ACs do not mention duplicate prevention when renaming (covered in DS-3). TC-DS2-010 and TC-DS2-012 assume the same rules apply on edit as on create.
5. **Whitespace handling:** ACs do not cover whitespace-only name or trim behavior on edit (TC-DS2-015, TC-DS2-016).
6. **Rename to identical name:** Unclear whether saving with the same Program Name and Description (no effective change) should succeed silently or show feedback (TC-DS2-007).
7. **Modal vs. full-page form:** ACs refer to a modal closing on save; layout type is not specified.
8. **Success feedback:** No AC requires a toast, banner, or inline success message after edit—only list visibility is specified.
9. **Role model:** "Admin" is referenced but other roles and permission boundaries are not defined in DS-2 ACs.
10. **Concurrent edit policy:** No AC defines behavior when two admins edit the same program simultaneously (TC-DS2-019).
11. **Curriculum linkage after rename:** User story mentions correcting program information; unclear whether renaming affects linked curriculum structure, URLs, or references.
12. **Validation parity with create:** Unclear whether all create-time validations (special characters, duplicates, empty name) apply identically on edit.
