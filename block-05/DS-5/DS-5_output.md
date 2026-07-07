# Test Plan: Program List Filtering and Display

**Feature:** Program list filtering and display  
**Jira:** [DS-5](https://legionqaschool.atlassian.net/browse/DS-5)  
**User story:** As an admin user, I want to see all programs in a clear list so that I can quickly find and manage them.  
**Target app:** Didaxis at `DIDAXIS_URL`

---

## App UI Reference

| Element | Real Didaxis UI |
|---------|-----------------|
| Page | Heading **Programs** (h2); subtitle "Manage academic programs and semesters" |
| List | Table rows; name in first `<p>` (bold); description in second `<p>` (dimmed, line-clamp) |
| Create CTA | Button **+ New Program** always visible |
| Row actions | **Edit {name}**, **Delete {name}** icon buttons |

---

## Observed Behavior Summary

| Behavior | Observed result |
|----------|-----------------|
| Name + description | Both shown per row via two `<p>` elements |
| Empty description | Second `<p>` empty / blank |
| After create | New row appears without manual reload |
| After edit | Description updates in list immediately |
| After delete | Row removed immediately |
| Empty state | Full empty-state not verified (shared test env has many programs); **+ New Program** always present |

---


## Positive Flows

### TC-DS5-001 — Program list displays name and description for each program

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- The following programs exist:
  - **Web Development 2026** — Description **Full-stack web development program**
  - **Data Science 2026** — Description **Data analysis and machine learning track**

**Steps:**
```gherkin
Given I am logged in as admin
And the following programs exist:
  | Program Name         | Description                                  |
  | Web Development 2026 | Full-stack web development program           |
  | Data Science 2026    | Data analysis and machine learning track     |
When I navigate to the Programs page
Then I see a program list
And the list shows "Web Development 2026" with Description "Full-stack web development program"
And the list shows "Data Science 2026" with Description "Data analysis and machine learning track"
```

**Expected result:**
- The Programs page renders a visible list of programs.
- Each row or card shows the program **Program Name** and **Description** exactly as stored.
- Both programs appear simultaneously without missing or swapped data.

**AC mapping:** Program list displays name and description for each program

---

### TC-DS5-002 — Empty state when no programs exist

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- No programs exist in the system.

**Steps:**
```gherkin
Given I am logged in as admin
And no programs exist
When I navigate to the Programs page
Then I see an empty state message indicating no programs are available
And I see a prompt to create the first program
And I see the "+ New Program" action to begin creating a program
```

**Expected result:**
- No program rows are shown.
- Empty state copy clearly communicates that no programs exist yet.
- User is guided to create the first program via visible prompt and **+ New Program** action.

**AC mapping:** Empty state when no programs exist

---

### TC-DS5-003 — Empty state CTA opens program creation form

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- No programs exist.

**Steps:**
```gherkin
Given I am on the Programs page with no programs
And I see an empty state message indicating no programs are available
When I click "+ New Program"
Then I see the program creation form with fields: Program Name, Description
And I see a "Create" button
```

**Expected result:**
- **+ New Program** from the empty state opens the same creation form used when programs already exist.
- User can begin creating the first program without navigating elsewhere.

**AC mapping:** Empty state when no programs exist — CTA behavior

---

### TC-DS5-004 — List displays a single program correctly

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- Exactly one program exists: **Web Development 2026** with Description **Full-stack web development program**.

**Steps:**
```gherkin
Given I am logged in as admin
And only one program "Web Development 2026" exists with Description "Full-stack web development program"
When I navigate to the Programs page
Then I see a program list with one entry
And the list shows "Web Development 2026" with Description "Full-stack web development program"
And I do not see an empty state message
And I see the "+ New Program" action
```

**Expected result:**
- Single-program state shows the list view, not the empty state.
- **+ New Program** remains available for adding more programs.

**AC mapping:** Extension — single program in list

---

### TC-DS5-005 — List refreshes after creating a new program

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- A program **Web Development 2026** already exists in the list.

**Steps:**
```gherkin
Given I am on the Programs page
And the program list shows "Web Development 2026"
When I click "+ New Program"
And I fill in Program Name with "Data Science 2026"
And I fill in Description with "Data analysis and machine learning track"
And I click Create
Then the modal closes
And the program list shows "Web Development 2026"
And the program list shows "Data Science 2026" with Description "Data analysis and machine learning track"
And I do not need to refresh the browser manually
```

**Expected result:**
- Newly created program appears in the list immediately after successful create.
- Existing programs remain visible and unchanged.

**AC mapping:** Extension — list refresh after create (cross-ticket with DS-1)

---

### TC-DS5-006 — List refreshes after editing program details

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Web Development 2026** exists with Description **Full-stack web development program**.

**Steps:**
```gherkin
Given I am on the Programs page
And the program list shows "Web Development 2026" with Description "Full-stack web development program"
When I open edit for "Web Development 2026"
And I change Description to "Updated full-stack curriculum for 2026"
And I save the changes
Then the program list shows "Web Development 2026" with Description "Updated full-stack curriculum for 2026"
And I do not need to refresh the browser manually
```

**Expected result:**
- Updated description is reflected in the list without full page reload.
- Program Name remains **Web Development 2026**.

**AC mapping:** Extension — list refresh after edit (cross-ticket with DS-2)

---

### TC-DS5-007 — List refreshes after deleting a program

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- Programs **Test Program** and **Web Development 2026** exist.

**Steps:**
```gherkin
Given I am on the Programs page
And the program list shows "Test Program" and "Web Development 2026"
When I initiate delete for "Test Program"
And I confirm the deletion
Then "Test Program" is no longer shown in the program list
And "Web Development 2026" is still shown in the program list
And I do not need to refresh the browser manually
```

**Expected result:**
- Deleted program is removed from the visible list immediately.
- Remaining programs stay visible with correct data.

**AC mapping:** Extension — list refresh after delete (cross-ticket with DS-4)

---

### TC-DS5-008 — Program with special characters displays correctly in list

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Informatique & IA - Niveau 2** exists with Description **Programme bilingue — informatique & intelligence artificielle**.

**Steps:**
```gherkin
Given I am logged in as admin
And a program "Informatique & IA - Niveau 2" exists with Description "Programme bilingue — informatique & intelligence artificielle"
When I navigate to the Programs page
Then the list shows "Informatique & IA - Niveau 2"
And the list shows Description "Programme bilingue — informatique & intelligence artificielle"
And special characters are rendered correctly without HTML encoding artifacts
```

**Expected result:**
- Characters such as `&`, `-`, accented letters, and em dashes display correctly in both name and description.
- No broken layout or escaped entity text (e.g., `&amp;`) is shown to the user.

**AC mapping:** Extension — special characters in list display

---

### TC-DS5-009 — Program with empty description displays appropriately

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Data Science Fundamentals** exists with an empty Description.

**Steps:**
```gherkin
Given I am logged in as admin
And a program "Data Science Fundamentals" exists with an empty Description
When I navigate to the Programs page
Then the list shows "Data Science Fundamentals"
And the Description area for "Data Science Fundamentals" is empty or shows an agreed empty placeholder (e.g., em dash or "No description")
And the row layout remains aligned with programs that have descriptions
```

**Expected result:**
- Empty description does not break list layout or show misleading placeholder program names.
- Presentation is consistent across all rows with empty descriptions.

**AC mapping:** Extension — empty description display

---

### TC-DS5-010 — Programs page shows page title and list structure

| Field | Value |
|-------|-------|
| **Priority** | Low |

**Preconditions:**
- I am logged in as admin.
- At least two programs exist.

**Steps:**
```gherkin
Given I am logged in as admin
And multiple programs exist
When I navigate to the Programs page
Then I see a clear page heading or title for Programs
And each program entry visually associates its name with its description
And I see the "+ New Program" action in a consistent location
```

**Expected result:**
- List is scannable: name and description are visually grouped per program.
- Primary actions are discoverable without scrolling on a typical viewport.

**AC mapping:** Extension — list clarity and layout

---

## Negative Flows

### TC-DS5-011 — Non-admin user cannot access program list

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- A non-admin user account exists (e.g., instructor or student role).
- Programs exist in the system.

**Steps:**
```gherkin
Given I am logged in as a non-admin user
When I attempt to navigate to the Programs page
Then I am denied access or redirected away from the program list
And I do not see program names or descriptions from the admin list
```

**Expected result:**
- Program list is restricted to authorized admin users.
- Unauthorized users cannot view or infer program data through the UI.

**AC mapping:** Extension — non-admin list access

---

### TC-DS5-012 — Unauthenticated user cannot view program list

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am not logged in.
- Programs exist in the system.

**Steps:**
```gherkin
Given I am not logged in
When I attempt to navigate to the Programs page directly via URL
Then I am redirected to login or receive an access denied response
And I do not see the program list or empty state content
```

**Expected result:**
- Programs page requires authentication.
- No program data is exposed before login.

**AC mapping:** Extension — unauthenticated access

---

### TC-DS5-013 — Empty state does not show stale or phantom program rows

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- No programs exist.

**Steps:**
```gherkin
Given I am logged in as admin
And no programs exist
When I navigate to the Programs page
Then I see the empty state message
And I do not see any program rows with names or descriptions
And I do not see cached data from a previous session's program list
```

**Expected result:**
- Empty state and program list are mutually exclusive.
- No ghost entries from browser cache or prior navigation remain visible.

**AC mapping:** Extension — empty state integrity

---

### TC-DS5-014 — Program list does not expose internal IDs or debug fields

| Field | Value |
|-------|-------|
| **Priority** | Low |

**Preconditions:**
- I am logged in as admin.
- Programs **Web Development 2026** and **Data Science 2026** exist.

**Steps:**
```gherkin
Given I am on the Programs page
When I view the program list
Then each entry shows Program Name and Description as defined in ACs
And internal database IDs, API keys, or debug metadata are not visible in the list UI
```

**Expected result:**
- Only user-facing fields intended for admins are displayed.
- No sensitive or implementation-only data leaks in the list.

**AC mapping:** Extension — data exposure guard

---

### TC-DS5-015 — Failed list load shows error, not misleading empty state

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- Programs exist but the list API is unavailable or returns an error (simulated in test environment).

**Steps:**
```gherkin
Given I am logged in as admin
And the program list API returns an error
When I navigate to the Programs page
Then I do not see the empty state message prompting me to create the first program
And I see an error message or retry option indicating the list failed to load
```

**Expected result:**
- Empty state is shown only when the server confirms zero programs exist.
- Transient or server errors are distinguished from a genuinely empty catalog.

**AC mapping:** Extension — error vs. empty state

---

## Edge Cases

### TC-DS5-016 — Long program name is truncated or wrapped readably in list

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program exists with a Program Name at or near the documented maximum length (e.g., 255 characters).
- Description is a normal-length string.

**Steps:**
```gherkin
Given I am logged in as admin
And a program with a long name exists in the system
When I navigate to the Programs page
Then the list shows the program entry for that long name
And the full name is readable via wrap, tooltip, or expand without breaking list layout
And adjacent program rows remain aligned
```

**Expected result:**
- Long names do not overflow or overlap other columns or rows.
- Full name remains accessible (e.g., title attribute, tooltip, or multi-line wrap).

**AC mapping:** Extension — long name truncation

---

### TC-DS5-017 — Long description is truncated or expandable in list

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A program **Web Development 2026** exists with a Description at or near the documented maximum length.

**Steps:**
```gherkin
Given I am logged in as admin
And "Web Development 2026" has a very long Description
When I navigate to the Programs page
Then the list shows "Web Development 2026"
And the Description is truncated with ellipsis, clamped lines, or expandable detail
And expanding or hovering reveals the full description text if truncated
```

**Expected result:**
- Long descriptions do not break row height unbounded or push actions off-screen.
- User can access full description text when needed.

**AC mapping:** Extension — long description truncation

---

### TC-DS5-018 — Many programs support scroll or pagination

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- A large number of programs exist (e.g., 50+ or enough to exceed one viewport).

**Steps:**
```gherkin
Given I am logged in as admin
And many programs exist in the system
When I navigate to the Programs page
Then I see the program list
And I can access all programs via scroll, pagination, or virtualized list behavior
And each visible entry shows Program Name and Description
When I scroll or navigate to additional pages
Then newly loaded entries also show name and description correctly
```

**Expected result:**
- List remains performant and usable with many programs.
- No programs are silently omitted without a way to reach them.

**AC mapping:** Extension — many programs / pagination / scroll

---

### TC-DS5-019 — Default sort order of program list is consistent

| Field | Value |
|-------|-------|
| **Priority** | Low |

**Preconditions:**
- I am logged in as admin.
- Programs **Alpha Program**, **Web Development 2026**, and **Zeta Program** exist with known creation timestamps.

**Steps:**
```gherkin
Given I am logged in as admin
And programs "Alpha Program", "Web Development 2026", and "Zeta Program" exist
When I navigate to the Programs page
Then programs appear in a consistent default order (e.g., alphabetical by name, or newest first)
And the same order is applied on subsequent visits without user sort action
```

**Expected result:**
- Default ordering is predictable and documented (alphabetical, created date, or manual order).
- Order does not change arbitrarily between page loads.

**AC mapping:** Extension — sort order

---

### TC-DS5-020 — Navigate away and return refreshes or preserves accurate list

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- Programs **Web Development 2026** and **Data Science 2026** exist.

**Steps:**
```gherkin
Given I am on the Programs page
And the list shows "Web Development 2026" and "Data Science 2026"
When I navigate to another admin page
And I return to the Programs page
Then the list shows current program data
And any program created, edited, or deleted elsewhere during the session is reflected accurately
```

**Expected result:**
- Returning to the page does not show stale list data after mutations in another tab or session.
- List reflects server state on revisit or via background refresh.

**AC mapping:** Extension — navigation and stale data

---

### TC-DS5-021 — Unicode and emoji in description display correctly

| Field | Value |
|-------|-------|
| **Priority** | Low |

**Preconditions:**
- I am logged in as admin.
- A program **Global Studies 2026** exists with Description **Multilingual track: 日本語, العربية, 🎓 emoji test**.

**Steps:**
```gherkin
Given I am logged in as admin
And "Global Studies 2026" exists with Description "Multilingual track: 日本語, العربية, 🎓 emoji test"
When I navigate to the Programs page
Then the list shows "Global Studies 2026"
And the Description displays unicode and emoji characters correctly
```

**Expected result:**
- Non-Latin scripts and emoji render without tofu boxes or mojibake.
- Font and line height accommodate mixed scripts.

**AC mapping:** Extension — unicode / emoji in list

---

### TC-DS5-022 — HTML or script in name/description is rendered safely

| Field | Value |
|-------|-------|
| **Priority** | High |

**Preconditions:**
- I am logged in as admin.
- A program exists with Program Name **`<script>alert('xss')</script>Test`** and Description **`<img src=x onerror=alert(1)>`** (created via API or test seed if UI blocks input).

**Steps:**
```gherkin
Given I am logged in as admin
And a program with HTML-like name and description exists
When I navigate to the Programs page
Then the list shows the name and description as plain text
And no script executes
And no HTML is interpreted as active markup in the list
```

**Expected result:**
- List output is escaped or sanitized.
- XSS vectors in stored data do not execute in the browser.

**AC mapping:** Extension — safe rendering of stored content

---

### TC-DS5-023 — Deleting last program transitions list to empty state

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- Only one program **Test Program** exists.

**Steps:**
```gherkin
Given I am on the Programs page
And only "Test Program" exists in the list
When I initiate delete for "Test Program"
And I confirm the deletion
Then I see an empty state message indicating no programs are available
And I see a prompt to create the first program
And I see the "+ New Program" action
And I do not see "Test Program" in the list
```

**Expected result:**
- List correctly transitions from single-item to empty state after last delete.
- Empty state messaging matches TC-DS5-002.

**AC mapping:** Extension — last program deleted (cross-ticket with DS-4, DS-5)

---

### TC-DS5-024 — Filter or search by program name (if filtering is in scope)

| Field | Value |
|-------|-------|
| **Priority** | Medium |

**Preconditions:**
- I am logged in as admin.
- Programs **Web Development 2026**, **Data Science 2026**, and **Mobile Development 2026** exist.

**Steps:**
```gherkin
Given I am on the Programs page
And the full list shows "Web Development 2026", "Data Science 2026", and "Mobile Development 2026"
When I enter "Web" in the program filter or search field
Then the list shows "Web Development 2026"
And the list does not show "Data Science 2026"
And the list does not show "Mobile Development 2026"
When I clear the filter
Then all three programs are visible again
```

**Expected result:**
- If filtering is implemented per feature title, search narrows the list by name (and optionally description).
- Clearing filter restores the full list.

**AC mapping:** Extension — filtering (title implies feature; not in ACs)

---

### TC-DS5-025 — Filter with no matches shows appropriate empty results state

| Field | Value |
|-------|-------|
| **Priority** | Low |

**Preconditions:**
- I am logged in as admin.
- At least one program exists.
- A filter or search control exists on the Programs page.

**Steps:**
```gherkin
Given I am on the Programs page with programs in the list
When I enter "NonexistentProgramXYZ" in the filter or search field
Then no program rows match the filter
And I see a message indicating no programs match the search
And I do not see the global empty state prompting creation of the first program
When I clear the filter
Then previously existing programs reappear in the list
```

**Expected result:**
- "No search results" is distinct from "no programs exist in the system."
- User can recover the full list by clearing the filter.

**AC mapping:** Extension — filter no-match state

---

### TC-DS5-026 — List remains usable on narrow viewport / mobile width

| Field | Value |
|-------|-------|
| **Priority** | Low |

**Preconditions:**
- I am logged in as admin.
- Programs **Web Development 2026** and **Data Science 2026** exist.

**Steps:**
```gherkin
Given I am logged in as admin
And programs exist in the system
When I navigate to the Programs page at a narrow viewport width (e.g., 375px)
Then I see the program list with name and description for each program
And the "+ New Program" action remains accessible
And horizontal overflow does not hide critical content without scroll
```

**Expected result:**
- List is responsive; name and description remain readable or stack vertically.
- Empty state and CTAs remain usable on small screens.

**AC mapping:** Extension — responsive layout

---

## Acceptance Criteria Coverage Matrix

| AC Scenario | Test Case(s) |
|-------------|--------------|
| Program list displays name and description for each program | TC-DS5-001, TC-DS5-004, TC-DS5-008, TC-DS5-009 |
| Empty state when no programs exist | TC-DS5-002, TC-DS5-003, TC-DS5-023 |

---

## Playwright Automation Coverage Matrix

**Spec:** `block-05/tests/ds5-program-list.spec.ts`  
**Last run:** 9 passed, 0 failed (Chromium, serial)

| Test Case | Automated | Notes |
|-----------|-----------|-------|
| TC-DS5-001 | Yes | Two programs name + description |
| TC-DS5-002 | Partial | Create affordance only (shared env) |
| TC-DS5-004 | Yes | Single program row |
| TC-DS5-005 | Yes | List after create |
| TC-DS5-006 | Yes | List after edit |
| TC-DS5-007 | Yes | List after delete |
| TC-DS5-008 | Yes | Special chars in list |
| TC-DS5-009 | Yes | Empty description |
| TC-DS5-010 | Yes | Page title and structure |

---

## Resolved via App Observation

1. **List structure:** Table with program name (bold) and description (muted) per row.
2. **Immediate refresh:** Create, edit, and delete update the list without reload.
3. **Empty state:** Requires isolated tenant; partial automation only.

---


1. **Filtering vs. display:** The feature title includes "filtering," but ACs only cover listing and empty state. TC-DS5-024 and TC-DS5-025 assume a filter/search control may exist; confirm whether filtering is in scope for DS-5 or a separate ticket.
2. **Empty state exact copy:** ACs require a message and prompt to create the first program but do not define exact wording, illustration, or secondary CTAs beyond **+ New Program** (TC-DS5-002, TC-DS5-003).
3. **List layout:** ACs do not specify table vs. cards, column headers, or whether edit/delete actions appear inline in the list (TC-DS5-010).
4. **Empty description presentation:** Unclear whether blank Description shows as empty, em dash, or "No description" (TC-DS5-009).
5. **Sort order:** No AC defines default ordering (alphabetical, created date, manual) (TC-DS5-019).
6. **Pagination / virtualization:** No AC addresses behavior with large program counts (TC-DS5-018).
7. **Truncation rules:** Long name and description display rules (ellipsis, line clamp, tooltip) are not specified (TC-DS5-016, TC-DS5-017).
8. **Authorization:** ACs assume admin; non-admin and unauthenticated behavior are not defined (TC-DS5-011, TC-DS5-012).
9. **List refresh:** ACs do not require immediate update after create, edit, or delete elsewhere on the page (TC-DS5-005, TC-DS5-006, TC-DS5-007).
10. **Error vs. empty state:** Failed API load vs. genuinely zero programs is not distinguished in ACs (TC-DS5-015).
11. **Accessibility:** Screen reader structure for list, empty state announcements, and keyboard navigation through program rows are not specified.
12. **Duplicate names in list:** If duplicate names are prevented (DS-3), display of near-duplicate or case-variant names in the list is not discussed.
13. **Responsive design:** Mobile and narrow viewport behavior is not mentioned (TC-DS5-026).
14. **Cross-session staleness:** Whether the list auto-refreshes when returning to the page or after mutations in another browser tab is unspecified (TC-DS5-020).
