# Test Plan: Delete Program with Confirmation

**Feature:** Delete program with confirmation  
**User story:** As an admin user, I want to delete a program I no longer need, with a confirmation step to prevent accidental deletion.

---

## Positive Flows

### TC-DS4-001 — Delete program after confirmation

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- A program **Test Program** exists with Description **Program created for deletion testing**.

**Steps:**
```gherkin
Given I am logged in as admin
And a program "Test Program" exists with Description "Program created for deletion testing"
When I navigate to the Programs page
And I initiate delete for "Test Program"
Then I see a confirmation dialog asking me to confirm deletion of "Test Program"
When I confirm the deletion
Then the confirmation dialog closes
And "Test Program" is no longer shown in the program list
```

**Expected result:**
- Confirmation dialog appears before any permanent deletion.
- After confirm, dialog closes and **Test Program** is removed from the list.
- No error is shown; deletion completes successfully.

**AC mapping:** Delete program after confirmation

---

### TC-DS4-002 — Cancel deletion keeps program in list

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- A program **Test Program** exists with Description **Program created for deletion testing**.

**Steps:**
```gherkin
Given I am logged in as admin
And a program "Test Program" exists with Description "Program created for deletion testing"
When I navigate to the Programs page
And I initiate delete for "Test Program"
Then I see a confirmation dialog asking me to confirm deletion of "Test Program"
When I cancel the deletion
Then the confirmation dialog closes
And "Test Program" is still shown in the program list
And the Description for "Test Program" is still "Program created for deletion testing"
```

**Expected result:**
- Cancel closes the dialog without deleting the program.
- **Test Program** remains in the list with unchanged data.

**AC mapping:** Cancel deletion keeps program in list

---

### TC-DS4-003 — Confirmation dialog displays correct program name

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- A program **Test Program** exists with Description **Program created for deletion testing**.

**Steps:**
```gherkin
Given I am on the Programs page
When I initiate delete for "Test Program"
Then I see a confirmation dialog
And the dialog text references "Test Program" by name
And the dialog presents a confirm action and a cancel action
```

**Expected result:**
- Dialog copy clearly identifies the program being deleted (**Test Program**).
- User can distinguish confirm vs. cancel controls before acting.

**AC mapping:** Delete program after confirmation — dialog content

---

### TC-DS4-004 — Delete program with special characters in name

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Informatique & IA - Niveau 2** exists with Description **Programme bilingue en informatique et intelligence artificielle**.

**Steps:**
```gherkin
Given I am on the Programs page
When I initiate delete for "Informatique & IA - Niveau 2"
Then I see a confirmation dialog asking me to confirm deletion of "Informatique & IA - Niveau 2"
When I confirm the deletion
Then the confirmation dialog closes
And "Informatique & IA - Niveau 2" is no longer shown in the program list
```

**Expected result:**
- Special characters in the program name are displayed correctly in the confirmation dialog.
- Deletion succeeds for names containing `&`, `-`, spaces, and accented characters.

**AC mapping:** Extension — delete with special-character name

---

### TC-DS4-005 — Delete one program when multiple programs exist

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- Programs **Test Program**, **Web Development 2026**, and **Data Science Fundamentals** exist.

**Steps:**
```gherkin
Given I am on the Programs page
And the program list shows "Test Program", "Web Development 2026", and "Data Science Fundamentals"
When I initiate delete for "Test Program"
And I confirm the deletion
Then "Test Program" is no longer shown in the program list
And "Web Development 2026" is still shown in the program list
And "Data Science Fundamentals" is still shown in the program list
```

**Expected result:**
- Only the targeted program is deleted.
- Other programs in the list are unaffected.

**AC mapping:** Extension — selective delete in multi-program list

---

## Negative Flows

### TC-DS4-006 — Non-admin user cannot delete a program

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as a non-admin user (e.g., instructor or read-only role).
- A program **Test Program** exists.

**Steps:**
```gherkin
Given I am logged in as a non-admin user
When I navigate to the Programs page
Then I do not see a delete action for "Test Program"
Or when I attempt to delete "Test Program" via direct URL or API
Then deletion is denied
And "Test Program" remains in the program list
```

**Expected result:**
- Delete is restricted to authorized admin users.
- Unauthorized delete attempts are blocked with appropriate access-denied feedback.

**AC mapping:** Extension — authorization boundary

---

### TC-DS4-007 — Closing confirmation without confirm or cancel does not delete program

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Test Program** exists.

**Steps:**
```gherkin
Given I am on the Programs page
When I initiate delete for "Test Program"
Then I see a confirmation dialog asking me to confirm deletion of "Test Program"
When I dismiss the dialog without choosing confirm or cancel
Then the confirmation dialog closes
And "Test Program" is still shown in the program list
```

**Expected result:**
- Dismissing the dialog (e.g., overlay click if supported) does not delete the program.
- Program data remains unchanged.

**AC mapping:** Extension — dismiss without explicit cancel

---

### TC-DS4-008 — Delete is not executed when confirmation dialog is shown but not confirmed

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- A program **Test Program** exists.

**Steps:**
```gherkin
Given I am on the Programs page
When I initiate delete for "Test Program"
Then I see a confirmation dialog asking me to confirm deletion of "Test Program"
And I do not click confirm
Then "Test Program" remains shown in the program list
And no success or deletion-complete message is shown
```

**Expected result:**
- Deletion requires an explicit confirm action.
- Program is not removed while the dialog is open or abandoned without confirm.

**AC mapping:** Extension — no implicit delete

---

### TC-DS4-009 — Attempt to delete non-existent program

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- No program named **Ghost Program** exists in the system.

**Steps:**
```gherkin
Given I am logged in as admin
When I attempt to delete "Ghost Program" via stale bookmark, direct URL, or API
Then I see an error indicating the program was not found
And no program is removed from the current program list
```

**Expected result:**
- System handles missing target gracefully.
- No unintended deletion of other programs occurs.

**AC mapping:** Extension — delete non-existent program

---

### TC-DS4-010 — Delete already-deleted program in concurrent session

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin in two browser sessions (Session A and Session B).
- A program **Test Program** exists and is visible in both sessions.

**Steps:**
```gherkin
Given Session A and Session B are on the Programs page
And both sessions show "Test Program"
When Session A initiates delete for "Test Program" and confirms
Then "Test Program" is no longer shown in Session A
When Session B initiates delete for "Test Program" and confirms
Then Session B shows an error indicating the program no longer exists or the list refreshes without "Test Program"
And no additional program records are affected
```

**Expected result:**
- Second delete attempt on an already-deleted program fails safely.
- List state converges to reflect single deletion.

**AC mapping:** Extension — concurrent / stale delete

---

## Edge Cases

### TC-DS4-011 — Dismiss confirmation dialog via close (X) control

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Test Program** exists.

**Steps:**
```gherkin
Given I am on the Programs page
When I initiate delete for "Test Program"
Then I see a confirmation dialog asking me to confirm deletion of "Test Program"
When I click the dialog close (X) control
Then the confirmation dialog closes
And "Test Program" is still shown in the program list
```

**Expected result:**
- Close (X) behaves equivalently to cancel for deletion safety.
- Program is not deleted.

**AC mapping:** Extension — dismiss via X

---

### TC-DS4-012 — Dismiss confirmation dialog via Escape key

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Test Program** exists.

**Steps:**
```gherkin
Given I am on the Programs page
When I initiate delete for "Test Program"
Then I see a confirmation dialog asking me to confirm deletion of "Test Program"
When I press the Escape key
Then the confirmation dialog closes
And "Test Program" is still shown in the program list
```

**Expected result:**
- Escape dismisses the dialog without deleting.
- Focus returns to the Programs page in a predictable location.

**AC mapping:** Extension — keyboard dismiss

---

### TC-DS4-013 — Delete last remaining program

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- **Test Program** is the only program in the system.

**Steps:**
```gherkin
Given I am on the Programs page
And the program list shows only "Test Program"
When I initiate delete for "Test Program"
And I confirm the deletion
Then the confirmation dialog closes
And "Test Program" is no longer shown in the program list
And I see the empty-state message prompting me to create the first program
```

**Expected result:**
- Deleting the last program succeeds.
- Programs page transitions to empty state (aligned with DS-5 empty-state behavior).

**AC mapping:** Extension — delete last program

---

### TC-DS4-014 — Delete program with linked curriculum or dependent data

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- A program **Web Development 2026** exists with an associated curriculum structure (courses, modules, or linked content).

**Steps:**
```gherkin
Given I am on the Programs page
And "Web Development 2026" has linked curriculum data
When I initiate delete for "Web Development 2026"
Then I see a confirmation dialog asking me to confirm deletion of "Web Development 2026"
When I confirm the deletion
Then either "Web Development 2026" and its dependent data are removed per product rules
Or I see a blocking error explaining that linked data prevents deletion
```

**Expected result:**
- Behavior for programs with dependencies is defined and consistent.
- User receives clear feedback if deletion is blocked or cascades to related data.

**AC mapping:** Extension — delete with linked curriculum/data

---

### TC-DS4-015 — Double-click confirm does not cause duplicate delete errors

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Test Program** exists.

**Steps:**
```gherkin
Given I am on the Programs page
When I initiate delete for "Test Program"
And I see a confirmation dialog asking me to confirm deletion of "Test Program"
When I double-click the confirm action rapidly
Then the confirmation dialog closes
And "Test Program" is no longer shown in the program list
And I do not see duplicate error toasts or server errors
```

**Expected result:**
- Confirm action is idempotent; only one delete request is processed.
- UI remains stable after rapid double-click.

**AC mapping:** Extension — double-click confirm guard

---

### TC-DS4-016 — Confirm and cancel button labels are clear and distinct

| Field | Value |
|-------|-------|
| **Priority** | Low |

**Preconditions:**
- I am logged in as admin.
- A program **Test Program** exists.

**Steps:**
```gherkin
Given I am on the Programs page
When I initiate delete for "Test Program"
Then I see a confirmation dialog
And the confirm action label clearly indicates destructive action (e.g., "Delete" or "Confirm delete")
And the cancel action label clearly indicates abort (e.g., "Cancel")
And the confirm action is visually distinct from cancel (e.g., destructive styling)
```

**Expected result:**
- Users can identify destructive vs. safe actions before clicking.
- Dialog copy matches product tone and accessibility expectations.

**AC mapping:** Extension — confirm button label and dialog copy

---

### TC-DS4-017 — Delete program with long name displays correctly in confirmation dialog

| Field | Value |
|-------|-------|
| **Priority** | Low |

**Preconditions:**
- I am logged in as admin.
- A program exists with a long Program Name at or near the documented maximum length (e.g., 255 characters).

**Steps:**
```gherkin
Given I am on the Programs page
And a program with a long name exists in the list
When I initiate delete for that program
Then I see a confirmation dialog
And the full program name is readable (wrapped or truncated with accessible full name available)
When I confirm the deletion
Then the program is no longer shown in the program list
```

**Expected result:**
- Long names do not break dialog layout or hide the identity of the program being deleted.
- Deletion succeeds for max-length names.

**AC mapping:** Extension — long name in dialog

---

### TC-DS4-018 — Program list refreshes after delete without manual reload

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Test Program** exists alongside at least one other program.

**Steps:**
```gherkin
Given I am on the Programs page
When I initiate delete for "Test Program"
And I confirm the deletion
Then "Test Program" is removed from the visible list immediately
And I do not need to refresh the browser to see the updated list
```

**Expected result:**
- List updates optimistically or after successful server response without full page reload.
- Remaining programs stay visible and correctly ordered.

**AC mapping:** Extension — list refresh after delete

---

### TC-DS4-019 — Deleted program name becomes available for reuse (if allowed)

| Field | Value |
|-------|-------|
| **Priority** | Low |

**Preconditions:**
- I am logged in as admin.
- A program **Test Program** exists.

**Steps:**
```gherkin
Given I am on the Programs page
When I initiate delete for "Test Program"
And I confirm the deletion
Then "Test Program" is no longer shown in the program list
When I click "+ New Program"
And I fill in Program Name with "Test Program"
And I fill in Description with "Recreated after deletion"
And I click Create
Then the modal closes
And the program list shows "Test Program"
```

**Expected result:**
- If product rules allow name reuse after delete, recreation succeeds without duplicate-name error.
- If reuse is disallowed (soft delete), user receives clear duplicate or retention error.

**AC mapping:** Extension — name reuse after delete (cross-ticket with DS-3)

---

### TC-DS4-020 — Initiate delete while another modal is open

| Field | Value |
|-------|-------|
| **Priority** | Low |

**Preconditions:**
- I am logged in as admin.
- A program **Test Program** exists.
- I have the program creation or edit form open.

**Steps:**
```gherkin
Given I am on the Programs page with the program creation form open
When I attempt to initiate delete for "Test Program" from the list behind the form
Then either delete is blocked until the form is closed
Or the form closes and the delete confirmation dialog appears
And no partial or inconsistent UI state occurs
```

**Expected result:**
- Only one destructive flow is active at a time.
- User cannot accidentally delete while unsaved create/edit work is ambiguous.

**AC mapping:** Extension — modal stacking / focus management

---

## Acceptance Criteria Coverage Matrix

| AC Scenario | Test Case(s) |
|-------------|--------------|
| Delete program after confirmation | TC-DS4-001, TC-DS4-003 |
| Cancel deletion keeps program in list | TC-DS4-002 |

---

## Ambiguities / Gaps in ACs

1. **Delete entry point:** ACs say "initiate delete" but do not specify control type (icon, menu item, row action, bulk delete). TC-DS4-001 assumes a per-program delete action on the Programs page.
2. **Dialog copy and button labels:** ACs require a confirmation dialog referencing the program name but do not define exact wording, confirm/cancel labels, or destructive styling (TC-DS4-003, TC-DS4-016).
3. **Dismiss methods:** Cancel is covered; close (X), Escape, and overlay click are not specified (TC-DS4-011, TC-DS4-012, TC-DS4-007).
4. **Linked curriculum / cascade delete:** No AC states whether programs with curriculum, enrollments, or other dependencies can be deleted or are blocked (TC-DS4-014).
5. **Last program / empty state:** Deleting the only program and resulting empty-state behavior are not in DS-4 ACs (TC-DS4-013; related to DS-5).
6. **Authorization:** ACs assume admin only; non-admin behavior and API-level enforcement are not defined (TC-DS4-006).
7. **Soft delete vs. hard delete:** Unclear whether deletion is permanent or recoverable from trash/archive; impacts name reuse (TC-DS4-019, cross-ticket with DS-3).
8. **Success feedback:** ACs specify list removal but not toast, banner, or undo window after confirm.
9. **Concurrent delete:** No AC covers two sessions deleting the same program or stale delete after another session removed it (TC-DS4-010).
10. **Double-submit on confirm:** Idempotency of rapid double-click on confirm is not specified (TC-DS4-015).
11. **List refresh mechanism:** ACs do not require immediate UI update vs. manual refresh (TC-DS4-018).
12. **Audit trail:** Whether deletion is logged for compliance or reversibility is not mentioned.
13. **Keyboard and screen-reader accessibility:** Focus trap, aria labels, and tab order in the confirmation dialog are not defined.
