# Test Plan: Edit Existing Program Details

**Feature:** Edit existing program details  
**Jira:** [DS-2](https://legionqaschool.atlassian.net/browse/DS-2)  
**User story:** As an admin user, I want to edit an existing program's details so that I can correct or update program information after creation.  
**Target app:** Didaxis at `DIDAXIS_URL`

---

## App UI Reference

| Element | Real Didaxis UI |
|---------|-----------------|
| Login | Textboxes **Email**, **Password**; button **Sign In** |
| Navigation | Sidebar button **Programs** |
| Page heading | **Programs** (h2) |
| Programs list | Table rows; program name in first `td`; description in second `<p>` |
| Open edit | Row button **Edit {programName}** (Jira AC says "edit icon") |
| Edit modal | Dialog **Edit Program** |
| Fields | Textbox **Program Name**, textbox **Description** |
| Actions | Button **Save**, button **Cancel**, X button in dialog banner |
| Modal close on save | Dialog hidden within ~10 seconds |
| Seed program (tests) | Button **+ New Program** → dialog **New Program** → button **Create** |

**Playwright selectors:** role + accessible name (see [`tests/helpers/didaxis.ts`](../../tests/helpers/didaxis.ts)).

---

## Observed Behavior Summary

Confirmed against live Didaxis app via Playwright exploration (`tests/ds2-edit-program.spec.ts`).

| Behavior | Observed result |
|----------|-----------------|
| Edit entry point | `Edit {programName}` button opens **Edit Program** modal |
| Pre-population | **Program Name** and **Description** match stored values |
| Empty / whitespace-only name | **Save** disabled |
| Max Program Name | 255 characters accepted |
| Program Name 256+ chars | **Accepted** — Save enabled, full name stored (no validation block) |
| Max Description | 1000 characters accepted |
| Duplicate rename | **Allowed** — no error; modal closes; multiple rows can share a name |
| Case sensitivity | **Case-sensitive** — `"web development 2026"` ≠ `"Web Development 2026"` |
| Whitespace trim on edit | **Not trimmed** — leading/trailing spaces stored as entered |
| Clear description | **Allowed** — list shows blank description |
| Cancel / Escape | Changes discarded; original data preserved |
| Concurrent edit | **Last-write-wins** — single record, final save wins |
| Non-existent program | No `Edit {name}` button on Programs list |
| Double-click Save | Single update applied; one program record |

**Divergence from ideal/create rules:** Duplicate names and missing trim on edit differ from expected create-time validation (see DS-3). Documented as observed behavior, not spec requirements.

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
And I click the "Edit Web Development 2026" button
Then I see the "Edit Program" modal dialog
And I see Program Name pre-filled as "Web Development 2026"
And I see Description pre-filled as "Full-stack web development program"
And I see an enabled "Save" button
And I see a "Cancel" button
And I see an X close control in the dialog banner
```

**Expected result:**
- The **Edit Program** modal opens for the selected program.
- **Program Name** and **Description** textboxes display current stored values and are editable.
- **Save** is enabled when fields contain valid data.

**AC mapping:** Open program for editing

---

### TC-DS2-002 — Successfully rename a program

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- A program **Web Development 2026** exists with Description **Full-stack web development program**.

**Steps:**
```gherkin
Given I am on the "Edit Program" modal for "Web Development 2026"
When I change Program Name to "Web Development 2026 - Updated"
And I click Save
Then the "Edit Program" modal closes within 10 seconds
And the program list immediately shows "Web Development 2026 - Updated"
And the program list does not show "Web Development 2026"
And the Description remains "Full-stack web development program"
```

**Expected result:**
- Modal closes without error; list updates without manual page refresh.
- Old name no longer appears; description unchanged.

**AC mapping:** Successfully edit a program name

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
Given I am on the "Edit Program" modal for "Web Development 2026"
When I leave Program Name as "Web Development 2026"
And I change Description to "Updated full-stack web development program"
And I click Save
Then the "Edit Program" modal closes
And the program list shows Program Name "Web Development 2026" in the first table cell
And the program list shows Description "Updated full-stack web development program" in the second paragraph of the row
```

**Expected result:**
- Only Description is updated; **Program Name** and other fields remain unchanged.

**AC mapping:** Edit preserves unchanged fields

---

### TC-DS2-004 — Edit both Program Name and Description in one save

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Data Science 2026** exists with Description **Introductory data science track**.

**Steps:**
```gherkin
Given I am on the "Edit Program" modal for "Data Science 2026"
When I change Program Name to "Advanced Data Science 2026"
And I change Description to "Advanced machine learning and analytics program"
And I click Save
Then the "Edit Program" modal closes
And the program list shows Program Name "Advanced Data Science 2026"
And the program list shows Description "Advanced machine learning and analytics program"
And the program list does not show "Data Science 2026"
```

**Expected result:**
- Both fields update atomically in a single save; list reflects both new values.

**AC mapping:** Extension — combined name and description edit

---

### TC-DS2-005 — Edit program name with special characters

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Software Engineering Basics** exists with Description **Core software engineering fundamentals**.

**Steps:**
```gherkin
Given I am on the "Edit Program" modal for "Software Engineering Basics"
When I change Program Name to "Informatique & IA - Niveau 2"
And I click Save
Then the "Edit Program" modal closes
And the program list shows "Informatique & IA - Niveau 2" exactly as entered
```

**Expected result:**
- Special characters (`&`, `-`, spaces, accented characters) are accepted and stored without corruption.

**AC mapping:** Extension — special characters in edited name

---

### TC-DS2-006 — Program list refreshes after successful edit

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- The Programs page shows program **Cloud Engineering 2026** with Description **AWS and Azure cloud engineering track**.

**Steps:**
```gherkin
Given I am on the Programs page
When I click "Edit Cloud Engineering 2026"
And I change Description to "Multi-cloud engineering and DevOps track"
And I click Save
Then the "Edit Program" modal closes
And the program list shows Description "Multi-cloud engineering and DevOps track" for "Cloud Engineering 2026" without manual page refresh
```

**Expected result:**
- Updated description appears immediately after save; no full page reload required.

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
Given I am on the "Edit Program" modal for "Mobile Development 2026"
When I do not change Program Name or Description
And I click Save
Then the "Edit Program" modal closes
And the program list shows Program Name "Mobile Development 2026"
And the program list shows Description "iOS and Android development program"
```

**Expected result:**
- Save succeeds as a no-op; program data unchanged; no duplicate records.

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
Given I am on the "Edit Program" modal for "Web Development 2026"
When I clear the Program Name field completely
Then the Save button is disabled
And I cannot save the program with an empty name
```

**Expected result:**
- **Save** is disabled when Program Name is empty.
- Original program **Web Development 2026** remains unchanged in the list.

**AC mapping:** Extension — Save with cleared Name

---

### TC-DS2-009 — Non-admin user cannot edit program

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- A non-admin user account exists (e.g., instructor or read-only role).
- A program **Web Development 2026** exists in the system.

**Steps:**
```gherkin
Given I am logged in as a non-admin user
When I navigate to the Programs page
Then I do not see an "Edit Web Development 2026" button
Or I cannot open the "Edit Program" modal for "Web Development 2026"
```

**Expected result:**
- Non-admin users cannot modify program details.

**AC mapping:** Extension — non-admin access denied  
**Automation status:** Skipped — non-admin credentials not in `.env`

---

### TC-DS2-010 — Rename to existing program name is allowed on edit

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- Programs **Web Development 2026** and **Cybersecurity 2026** exist.

**Steps:**
```gherkin
Given I am on the "Edit Program" modal for "Web Development 2026"
When I change Program Name to "Cybersecurity 2026"
And I click Save
Then the "Edit Program" modal closes
And the program list no longer shows "Web Development 2026"
And the program list shows at least two rows named "Cybersecurity 2026"
```

**Expected result:**
- **Observed behavior:** Rename to an existing name succeeds; no duplicate-name error.
- Multiple programs can share the same name after edit.
- **Note:** Diverges from ideal create-time uniqueness rules (DS-3).

**AC mapping:** Extension — duplicate name on rename (observed behavior)

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
Given I am on the "Edit Program" modal for "Web Development 2026"
When I change Program Name to "Web Development 2026 - Updated"
And I change Description to "This change should not be saved"
And I click Cancel
Then the "Edit Program" modal closes
And the program list shows Program Name "Web Development 2026"
And the program list shows Description "Full-stack web development program"
And the program list does not show "Web Development 2026 - Updated"
```

**Expected result:**
- **Cancel** dismisses the modal without persisting changes.

**AC mapping:** Extension — cancel edit without saving

---

### TC-DS2-012 — Rename to case variant of existing name is allowed

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- Programs **Web Development 2026** and **Data Science 2026** exist.

**Steps:**
```gherkin
Given I am on the "Edit Program" modal for "Data Science 2026"
When I change Program Name to "web development 2026"
And I click Save
Then the "Edit Program" modal closes
And the program list shows "Web Development 2026"
And the program list shows "web development 2026"
And the program list does not show "Data Science 2026"
```

**Expected result:**
- **Observed behavior:** Names are case-sensitive; lowercase variant is accepted and coexists with original casing.
- **Data Science 2026** is renamed to the lowercase variant.

**AC mapping:** Extension — case-sensitive duplicate policy on edit

---

## Edge Cases

### TC-DS2-013 — Program Name at maximum allowed length (255) on edit

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Short Name Program** exists with Description **Program for max-length edit test**.

**Steps:**
```gherkin
Given I am on the "Edit Program" modal for "Short Name Program"
When I change Program Name to a string of exactly 255 characters
And I click Save
Then the "Edit Program" modal closes
And the program list shows the full 255-character name without truncation
```

**Expected result:**
- 255-character name is accepted and displayed correctly in the list.

**AC mapping:** Extension — max-length updated name (boundary)

---

### TC-DS2-014 — Program Name exceeding 255 characters is accepted on edit

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Boundary Edit Test** exists.

**Steps:**
```gherkin
Given I am on the "Edit Program" modal for "Boundary Edit Test"
When I change Program Name to a string of 256 characters
And I click Save
Then the "Edit Program" modal closes
And the program list shows the full 256-character name
And the program list does not show "Boundary Edit Test"
```

**Expected result:**
- **Observed behavior:** 256+ character names are accepted; **Save** is enabled; no length validation error.
- **Note:** May indicate missing max-length enforcement on edit.

**AC mapping:** Extension — over-max-length name on edit (observed behavior)

---

### TC-DS2-015 — Whitespace-only Program Name disables Save on edit

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- A program **Web Development 2026** exists with Description **Full-stack web development program**.

**Steps:**
```gherkin
Given I am on the "Edit Program" modal for "Web Development 2026"
When I change Program Name to "   "
Then the Save button is disabled
And I cannot save the program
```

**Expected result:**
- Whitespace-only input is treated as empty; **Save** is disabled.
- Original program **Web Development 2026** is not overwritten.

**AC mapping:** Extension — whitespace-only name on edit

---

### TC-DS2-016 — Leading and trailing whitespace preserved in Program Name on save

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Web Development 2026** exists with Description **Full-stack web development program**.

**Steps:**
```gherkin
Given I am on the "Edit Program" modal for "Web Development 2026"
When I change Program Name to "  Mobile Development 2026  "
And I click Save
Then the "Edit Program" modal closes
And the program list shows "  Mobile Development 2026  " with leading and trailing spaces preserved
And the program list does not show "Web Development 2026"
```

**Expected result:**
- **Observed behavior:** App does **not** trim whitespace on edit; padded name is stored and displayed as entered.
- Inner spaces within the name are preserved.

**AC mapping:** Extension — whitespace handling on edit (observed behavior)

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
Given I am on the "Edit Program" modal for "International Program"
When I change Program Name to "プログラム — École №1 (2026)"
And I click Save
Then the "Edit Program" modal closes
And the program list shows "プログラム — École №1 (2026)" exactly as stored
```

**Expected result:**
- Unicode characters (CJK, accented Latin, symbols) are handled consistently on edit.

**AC mapping:** Extension — unicode/special characters on edit

---

### TC-DS2-018 — No edit action for non-existent program

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- No program named **Deleted Program Test** exists on the Programs page.

**Steps:**
```gherkin
Given I am logged in as admin on the Programs page
When I look for an "Edit Deleted Program Test" button
Then no such button is present
And no table row shows "Deleted Program Test"
```

**Expected result:**
- Programs list only exposes **Edit {name}** for existing programs; no edit UI for absent programs.

**AC mapping:** Extension — edit non-existent program

---

### TC-DS2-019 — Concurrent edit follows last-write-wins policy

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- Two admin sessions (Session A and Session B) are logged in.
- A program **Web Development 2026** exists with Description **Full-stack web development program**.

**Steps:**
```gherkin
Given Session A opens the "Edit Program" modal for "Web Development 2026"
And Session B opens the "Edit Program" modal for "Web Development 2026"
When Session A changes Description to "Updated by Session A" and clicks Save
And Session B changes Description to "Updated by Session B" and clicks Save
Then exactly one program named "Web Development 2026" exists in the program list
And the final Description is either "Updated by Session A" or "Updated by Session B"
```

**Expected result:**
- **Observed behavior:** Last-write-wins; no conflict error; single consistent record.

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
Given I am on the "Edit Program" modal for "Web Development 2026"
When I change Description to "Updated description from double-click test"
And I double-click the Save button rapidly
Then the "Edit Program" modal closes
And exactly one program named "Web Development 2026" exists in the program list
And the Description is "Updated description from double-click test"
```

**Expected result:**
- Idempotent submit: only one update applied.

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
Given I am on the "Edit Program" modal for "Web Development 2026"
When I leave Program Name as "Web Development 2026"
And I clear the Description field completely
And I click Save
Then the "Edit Program" modal closes
And the program list shows Program Name "Web Development 2026"
And the program list shows a blank Description in the second paragraph of the row
```

**Expected result:**
- Clearing Description on edit is allowed; **Program Name** unchanged.

**AC mapping:** Edit preserves unchanged fields (description cleared, name preserved)

---

### TC-DS2-022 — Description at maximum allowed length (1000) on edit

| Field | Value |
|-------|-------|
| **Priority** | Low |

**Preconditions:**
- I am logged in as admin.
- A program **Long Description Edit Test** exists with a short description.

**Steps:**
```gherkin
Given I am on the "Edit Program" modal for "Long Description Edit Test"
When I change Description to a string of exactly 1000 characters
And I click Save
Then the "Edit Program" modal closes
And reopening the "Edit Program" modal shows the full 1000-character Description
```

**Expected result:**
- 1000-character description is accepted and fully retrievable on subsequent edit.

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
Given I am on the "Edit Program" modal for "Web Development 2026"
When I change Program Name to "Web Development 2026 - Updated"
And I press the Escape key
Then the "Edit Program" modal closes
And the program list shows Program Name "Web Development 2026"
And the program list does not show "Web Development 2026 - Updated"
```

**Expected result:**
- Escape dismisses the modal without saving, consistent with Cancel behavior.

**AC mapping:** Extension — dismiss edit via Escape

---

## Acceptance Criteria Coverage Matrix

| Jira AC Scenario | Test Case(s) |
|------------------|--------------|
| Open program for editing | TC-DS2-001 |
| Successfully edit a program name | TC-DS2-002 |
| Edit preserves unchanged fields | TC-DS2-003, TC-DS2-021 |

---

## Playwright Automation Coverage Matrix

**Spec:** `tests/ds2-edit-program.spec.ts`  
**Last run:** 22 passed, 1 skipped, 0 failed (Chromium)

| Test Case | Automated | Notes |
|-----------|-----------|-------|
| TC-DS2-001 | Yes | Asserts Edit Program modal, fields, Save, Cancel, X |
| TC-DS2-002 | Yes | Uses timestamp-suffixed name to avoid collisions |
| TC-DS2-003 | Yes | |
| TC-DS2-004 | Yes | |
| TC-DS2-005 | Yes | |
| TC-DS2-006 | Yes | |
| TC-DS2-007 | Yes | |
| TC-DS2-008 | Yes | |
| TC-DS2-009 | Skipped | Non-admin credentials not in `.env` |
| TC-DS2-010 | Yes | Documents observed duplicate-name allowance |
| TC-DS2-011 | Yes | Cancel path only; X close helper exists but not separate TC |
| TC-DS2-012 | Yes | |
| TC-DS2-013 | Yes | 255-char boundary |
| TC-DS2-014 | Yes | Branches on observed 256+ acceptance |
| TC-DS2-015 | Yes | |
| TC-DS2-016 | Yes | |
| TC-DS2-017 | Yes | |
| TC-DS2-018 | Yes | Title aligned: no edit button for absent program |
| TC-DS2-019 | Yes | Last-write-wins concurrency |
| TC-DS2-020 | Yes | |
| TC-DS2-021 | Yes | |
| TC-DS2-022 | Yes | 1000-char description boundary |
| TC-DS2-023 | Yes | Escape dismiss |

---

## Resolved via App Observation

1. **Edit control:** Jira says "edit icon"; app uses button **Edit {programName}** on each table row.
2. **Field label:** Jira says "Name"; app field is **Program Name**.
3. **Form type:** **Edit Program** modal dialog with **Save**, **Cancel**, and X close.
4. **Description optional on edit:** Clearing Description is allowed (TC-DS2-021).
5. **Max lengths:** Program Name 255 accepted; 256+ also accepted. Description max 1000 accepted.
6. **Duplicate rename:** Allowed on edit — no error (TC-DS2-010, TC-DS2-012).
7. **Whitespace:** Whitespace-only disables Save; leading/trailing spaces **not** trimmed on save.
8. **Concurrency:** Last-write-wins; no conflict UI.
9. **Non-existent program:** No **Edit** button when program absent.
10. **List update:** Immediate refresh after save; no manual reload.

---

## Remaining Ambiguities / Gaps

1. **Non-admin access:** Role boundaries not defined in DS-2 ACs; TC-DS2-009 requires non-admin credentials.
2. **Success feedback:** No toast or banner after save — only list update is observable.
3. **Curriculum linkage:** Unclear whether renaming affects linked curriculum structure or references.
4. **Create vs edit validation parity:** Duplicates blocked on create (DS-3) but allowed on edit; trim may differ between create and edit.
5. **256+ char names:** Accepted on edit but may violate intended max-length policy — product decision needed.
6. **No-change save:** TC-DS2-007 succeeds silently; no explicit user feedback.
