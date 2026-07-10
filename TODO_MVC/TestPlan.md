# Test Plan: TodoMVC (Playwright Demo)

**Feature:** TodoMVC — add, complete, and delete todo items  
**Application URL:** https://demo.playwright.dev/todomvc/#/  
**Acceptance Criteria:**
- User can add a todo item to the list
- User can complete an item
- User can delete item from the list

---

## Positive Flows

### TC-001 — New todo appears in the list after submission

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- Browser is open at https://demo.playwright.dev/todomvc/#/ with an empty todo list.
- The **What needs to be done?** input field is visible under the **todos** heading.

**Steps:**
```gherkin
Given I am on the TodoMVC page at https://demo.playwright.dev/todomvc/#/
And the todo list is empty
When I type "Buy groceries" into the "What needs to be done?" field
And I press Enter
Then the todo list shows one item labeled "Buy groceries"
And the item count footer displays "1 item left"
And the "What needs to be done?" field is cleared and ready for another entry
```

**Expected result:**
- **Buy groceries** appears as a new row in the todo list.
- The new-todo input is empty after submission.
- Footer counter reflects one active (incomplete) item.

**AC mapping:** User can add a todo item to the list

---

### TC-002 — Multiple todos can be added sequentially

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am on the TodoMVC page with an empty todo list.

**Steps:**
```gherkin
Given I am on the TodoMVC page with an empty todo list
When I add a todo "Walk the dog"
And I add a todo "Pay electric bill"
And I add a todo "Call dentist"
Then the todo list shows three items in order: "Walk the dog", "Pay electric bill", "Call dentist"
And the footer displays "3 items left"
```

**Expected result:**
- All three todos appear in the order they were entered.
- Each item has a **Toggle Todo** checkbox and is marked incomplete by default.
- Footer counter shows **3 items left**.

**AC mapping:** User can add a todo item to the list

---

### TC-003 — Todo is marked completed when toggle is checked

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am on the TodoMVC page.
- The todo list contains one incomplete item: **Write test plan**.

**Steps:**
```gherkin
Given the todo list contains "Write test plan" as an incomplete item
When I click the "Toggle Todo" checkbox next to "Write test plan"
Then "Write test plan" is displayed with completed styling
And the footer displays "0 items left"
And the "Clear completed" button is visible
```

**Expected result:**
- The item moves to completed state visually (strikethrough / completed class).
- Active-item counter decrements to **0 items left**.
- **Clear completed** control appears in the footer when at least one completed item exists.

**AC mapping:** User can complete an item

---

### TC-004 — Completed todo can be toggled back to active

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- The todo list contains one completed item: **Review pull request**.

**Steps:**
```gherkin
Given "Review pull request" is marked completed
When I click the "Toggle Todo" checkbox next to "Review pull request" again
Then "Review pull request" is displayed as an active (incomplete) item without strikethrough
And the footer displays "1 item left"
```

**Expected result:**
- Completed styling is removed.
- Item is counted again in the active-items footer.

**AC mapping:** User can complete an item (toggle behavior)

---

### TC-005 — Todo is removed from the list when delete control is used

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am on the TodoMVC page.
- The todo list contains **Schedule team meeting** and **Send status update**.

**Steps:**
```gherkin
Given the todo list contains "Schedule team meeting" and "Send status update"
When I hover over "Schedule team meeting"
And I click the "Delete" button for that item
Then "Schedule team meeting" is no longer visible in the todo list
And "Send status update" remains in the list
And the footer displays "1 item left"
```

**Expected result:**
- Only the targeted item is removed.
- Remaining items and footer counter update correctly.

**AC mapping:** User can delete item from the list

---

### TC-006 — Completed todo can be deleted

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- The todo list contains one completed item: **Archive old emails**.

**Steps:**
```gherkin
Given "Archive old emails" is marked completed
When I click the "Delete" button for "Archive old emails"
Then "Archive old emails" is removed from the todo list
And the todo list section is hidden or empty
And the footer is not displayed
```

**Expected result:**
- Completed items can be deleted individually.
- When the last item is removed, the main list and footer disappear (empty state).

**AC mapping:** User can delete item from the list

---

### TC-007 — Clear completed removes all completed items at once

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- The todo list contains:
  - **Buy milk** (active)
  - **Read documentation** (completed)
  - **Update changelog** (completed)

**Steps:**
```gherkin
Given "Buy milk" is active and "Read documentation" and "Update changelog" are completed
When I click "Clear completed"
Then "Read documentation" and "Update changelog" are removed from the list
And "Buy milk" remains as the only active item
And the footer displays "1 item left"
And the "Clear completed" button is no longer visible
```

**Expected result:**
- Bulk clear removes only completed items.
- Active items are preserved.

**AC mapping:** Extension — bulk delete of completed items

---

## Negative Flows

### TC-008 — Empty submission does not create a todo

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am on the TodoMVC page with an empty todo list.

**Steps:**
```gherkin
Given the todo list is empty
When I focus the "What needs to be done?" field
And I press Enter without typing any text
Then no new item appears in the todo list
And the todo list section remains hidden
And no footer counter is shown
```

**Expected result:**
- Blank submissions are ignored.
- UI remains in initial empty state.

**AC mapping:** Extension — empty input must not add an item

---

### TC-009 — Whitespace-only input does not create a todo

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am on the TodoMVC page with an empty todo list.

**Steps:**
```gherkin
Given the todo list is empty
When I type "   " into the "What needs to be done?" field
And I press Enter
Then no new item appears in the todo list
And the input field is cleared or retains no persisted todo
```

**Expected result:**
- Whitespace-only values are treated as empty and rejected.
- No blank or whitespace-only todo row is created.

**AC mapping:** Extension — whitespace validation on add

---

### TC-010 — Delete control on one item does not remove other items

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- The todo list contains **Item A**, **Item B**, and **Item C** (all active).

**Steps:**
```gherkin
Given the todo list contains "Item A", "Item B", and "Item C"
When I delete "Item B" using its "Delete" button
Then "Item A" and "Item C" remain in the list
And "Item B" is not present anywhere in the list
And the footer displays "2 items left"
```

**Expected result:**
- Deletion is scoped to the selected item only.
- Unrelated todos are unaffected.

**AC mapping:** User can delete item from the list (isolation)

---

### TC-011 — Toggling complete on a deleted item has no effect

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- The todo list contained **Temporary task**, which was just deleted.

**Steps:**
```gherkin
Given "Temporary task" was deleted and is no longer in the DOM
When I attempt to interact with a toggle for "Temporary task"
Then no todo row for "Temporary task" exists
And the footer count reflects only remaining items
```

**Expected result:**
- Deleted items cannot be completed or modified.
- Application state remains consistent with visible list only.

**AC mapping:** Extension — no ghost interactions after delete

---

### TC-012 — Active filter hides completed items without deleting them

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- The todo list contains **Active task** (incomplete) and **Done task** (completed).

**Steps:**
```gherkin
Given "Active task" is incomplete and "Done task" is completed
When I click the "Active" filter in the footer
Then "Active task" is visible
And "Done task" is not visible in the filtered view
When I click the "All" filter
Then both "Active task" and "Done task" are visible again
```

**Expected result:**
- Filtering hides completed items from view but does not delete them.
- Returning to **All** restores full list visibility.

**AC mapping:** Extension — filter must not mutate list data

---

## Edge Cases

### TC-013 — Duplicate todo titles are allowed as separate entries

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am on the TodoMVC page with an empty todo list.

**Steps:**
```gherkin
Given the todo list is empty
When I add a todo "Buy milk"
And I add another todo "Buy milk"
Then the todo list shows two separate items both labeled "Buy milk"
And the footer displays "2 items left"
When I complete the first "Buy milk" entry only
Then one "Buy milk" is completed and one "Buy milk" remains active
And the footer displays "1 item left"
```

**Expected result:**
- Duplicate text is stored as distinct list entries (no deduplication).
- Each duplicate has its own toggle and delete control.

**AC mapping:** Extension — duplicate titles

---

### TC-014 — Todo text containing special characters is preserved

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am on the TodoMVC page with an empty todo list.

**Steps:**
```gherkin
Given the todo list is empty
When I add a todo "Pay $50 & tip 15% — due @5pm!"
Then the todo list shows exactly "Pay $50 & tip 15% — due @5pm!"
And I can complete and delete that item without corruption of the label text
```

**Expected result:**
- Special characters (`$`, `&`, `%`, `@`, punctuation, em dash) render and persist correctly.
- No HTML encoding issues or truncated display.

**AC mapping:** Extension — special characters in todo text

---

### TC-015 — Very long todo text is accepted and displayed

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am on the TodoMVC page with an empty todo list.
- A string of 500 characters is prepared (e.g., repeated **a**).

**Steps:**
```gherkin
Given the todo list is empty
When I add a todo consisting of 500 characters without spaces
Then the todo list shows the full 500-character label without submission error
And I can toggle the item complete and delete it successfully
```

**Expected result:**
- Long input is accepted (no client-side max-length block on the demo).
- Item remains functional for complete and delete actions.
- Layout may wrap or overflow visually but text is not silently truncated on add.

**AC mapping:** Extension — max-length / long input boundary

---

### TC-016 — Single-character todo is accepted

| Field | Value |
|-------|-------|
| **Priority** | Low |

**Preconditions:**
- I am on the TodoMVC page with an empty todo list.

**Steps:**
```gherkin
Given the todo list is empty
When I add a todo "X"
Then the todo list shows one item labeled "X"
And the footer displays "1 item left"
```

**Expected result:**
- Minimum non-empty length (one visible character) is valid.

**AC mapping:** Extension — boundary minimum length

---

### TC-017 — Leading and trailing spaces are trimmed on add

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am on the TodoMVC page with an empty todo list.

**Steps:**
```gherkin
Given the todo list is empty
When I add a todo "  Trim test  "
Then the todo list shows "Trim test" without leading or trailing spaces
And the trimmed label persists after I complete the item
And the trimmed label and completed state persist after page reload
```

**Expected result:**
- Leading and trailing whitespace is trimmed before the todo is saved.
- Trimmed text is used consistently for display, toggle, and persistence.

**AC mapping:** Extension — whitespace boundary on non-empty input

---

### TC-018 — Completing all items shows zero items left and Clear completed

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- The todo list contains **Task one** and **Task two** (both active).

**Steps:**
```gherkin
Given the todo list contains "Task one" and "Task two"
When I complete "Task one"
And I complete "Task two"
Then the footer displays "0 items left"
And the "Clear completed" button is visible
And the "Completed" filter shows both items when selected
```

**Expected result:**
- Counter reaches **0 items left** when all items are completed.
- Completed filter and bulk clear remain available.

**AC mapping:** User can complete an item (all-items-completed boundary)

---

### TC-019 — Todo list persists after page reload (local storage)

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am on the TodoMVC page with an empty todo list.

**Steps:**
```gherkin
Given the todo list is empty
When I add "Persist me"
And I mark "Persist me" as completed
And I reload the browser page at https://demo.playwright.dev/todomvc/#/
Then "Persist me" is still present in the todo list in completed state
When I delete "Persist me"
And I reload the page again
Then the todo list is empty
```

**Expected result:**
- Demo app persists todos via `localStorage` across reloads.
- Deleted state also persists after reload.

**AC mapping:** Extension — persistence behavior (not stated in ACs)

---

### TC-020 — Unicode and emoji characters in todo text

| Field | Value |
|-------|-------|
| **Priority** | Low |

**Preconditions:**
- I am on the TodoMVC page with an empty todo list.

**Steps:**
```gherkin
Given the todo list is empty
When I add a todo "Réunion 📝 日本語"
Then the todo list shows "Réunion 📝 日本語" exactly
And I can complete and delete the item without character loss
```

**Expected result:**
- Unicode accents, emoji, and non-Latin scripts display and persist correctly.

**AC mapping:** Extension — internationalization / emoji input

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Empty and whitespace input:** ACs do not specify whether pressing Enter on empty or whitespace-only input should be ignored; standard TodoMVC behavior is to reject it (covered in TC-008, TC-009).

2. **Duplicate titles:** No requirement states whether two todos with identical text should merge or remain separate; the Playwright demo allows duplicates (TC-013).

3. **Complete vs. delete interaction:** ACs do not define whether completed items must remain deletable individually, via **Clear completed**, or both; the demo supports both paths (TC-006, TC-007).

4. **Persistence:** ACs do not mention whether todos survive page refresh; the Playwright demo persists to `localStorage` (TC-019).

5. **Filters (All / Active / Completed):** Not mentioned in ACs; filtering is view-only and should not be confused with delete (TC-012).

6. **Edit-in-place:** Classic TodoMVC supports double-click to edit an item; ACs do not include edit/update behavior — out of scope unless added to ACs.

7. **Leading/trailing whitespace:** ACs do not specify trim rules; the demo trims leading and trailing spaces on add (TC-017).

8. **Maximum text length:** No AC defines an upper bound; the demo accepts very long strings (TC-015); confirm if a product limit exists elsewhere.

9. **Accessibility / keyboard-only flows:** ACs imply mouse interactions only; keyboard Enter-to-add and toggle focus order are not specified.

10. **Demo vs. production:** The page states this is a demo for testing, not the real TodoMVC app; behavior may differ from other TodoMVC implementations.
