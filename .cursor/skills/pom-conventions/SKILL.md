---
name: pom-conventions
description: >-
  Page Object Model conventions for Playwright tests in this project. Apply
  whenever generating, refactoring, or reviewing any Playwright test that
  interacts with the Didaxis UI — even if the user doesn't say "POM". Tests
  should never contain inline locators.
---

# Page Object Model Conventions

All UI interactions go through Page Objects in `pages/`. Tests describe intent; POMs handle mechanics.

## Existing Page Objects (reuse first)

| File | Scope |
|------|-------|
| `pages/LoginPage.ts` | Login form — `goto`, `signIn`, `signInAsAdmin`, `openPrograms` |
| `pages/ProgramsPage.ts` | Programs list — navigation, create/edit/delete, row locators |
| `pages/NewProgramModal.ts` | New Program dialog — fill fields, Create/Cancel/Close |
| `pages/EditProgramModal.ts` | Edit Program dialog — fill fields, Save/Cancel/Close |

**Always extend or reuse these before creating new Page Objects.** Add methods or locators to an existing class when the UI belongs to that page or modal.

`ProgramsPage` composes modals:

```typescript
readonly newProgramModal: NewProgramModal;
readonly editProgramModal: EditProgramModal;
```

Instantiate modals inside the `ProgramsPage` constructor — do not construct them directly in specs when `ProgramsPage` is already in use.

## Rules

1. **One Page Object per page or distinct component** — e.g. `LoginPage`, `ProgramsPage`, `NewProgramModal`, `EditProgramModal`.

2. **Locators are `readonly` constructor properties** — assign with `getByRole`, `getByLabel`, or `getByText` only. Never CSS selectors or XPath (`page.locator('.class')`, `page.locator('//…')`, `locator('td')`, etc.).

3. **Methods perform user actions** — `goto`, `openNewProgramForm`, `createProgram`, `clickSave`, `fillProgramName`. Methods await interactions; they do not assert.

4. **No assertions inside Page Objects** — no `expect(...)` in `pages/`. All assertions live in spec files.

5. **No inline locators in spec files** — spec bodies must not call `page.getByRole`, `page.getByLabel`, or `page.getByText`. Import a POM, instantiate with `new XxxPage(page)`, then use POM properties and methods. Page-level checks like `expect(page).toHaveURL(...)` are fine.

6. **Compose POMs for nested UI** — pages that host modals expose them as readonly properties (see `ProgramsPage` + `NewProgramModal`).

7. **Dynamic locators belong on the Page Object** — methods that return a `Locator` (e.g. `programRow(name)`, `editProgramButton(name)`) are acceptable when the label depends on test data. Specs use the returned locator in `expect(...)`.

## Locator patterns (Didaxis)

```typescript
// Page-level
this.newProgramButton = page.getByRole('button', { name: '+ New Program' });
this.heading = page.getByRole('heading', { name: 'Programs', level: 2 });
this.tagline = page.getByText('Manage academic programs and semesters');

// Modal — scope to dialog first
this.dialog = page.getByRole('dialog', { name: 'New Program' });
this.programNameField = this.dialog.getByLabel('Program Name');
this.createButton = this.dialog.getByRole('button', { name: 'Create' });
this.closeButton = this.dialog.getByRole('banner').getByRole('button');

// Dynamic row
programRow(name: string): Locator {
  return this.page.getByRole('row').filter({
    has: this.page.getByText(name, { exact: true }),
  });
}
```

## Spec pattern

```typescript
import { ProgramsPage } from '../pages/ProgramsPage';

test('example', async ({ page }) => {
  const programsPage = new ProgramsPage(page);
  await programsPage.goto();
  await programsPage.openNewProgramForm();

  await expect(programsPage.newProgramModal.programNameField).toBeVisible();
  await expect(programsPage.newProgramModal.createButton).toBeDisabled();
});
```

Test infrastructure (cleanup tracking, unique names) may stay in `tests/helpers/` — e.g. `pom-programs.ts`, `program-create.ts`. Those helpers orchestrate API tracking; they are not Page Objects and must not introduce inline locators into specs.

## Workflow

When generating or refactoring tests:

1. Read existing files under `pages/` and reuse/extend them.
2. Add new Page Object files only for UI not covered by current classes.
3. Move any inline locator from a spec into the appropriate POM.
4. Keep every `expect(...)` in the spec; verify the spec body has zero `page.getBy*` calls.

## Output layout

```
pages/
├── LoginPage.ts
├── ProgramsPage.ts      # composes NewProgramModal + EditProgramModal
├── NewProgramModal.ts
└── EditProgramModal.ts

tests/
├── ds1-create-program.spec.ts   # imports from pages/, no inline locators
└── helpers/
    └── pom-programs.ts          # optional seed/track helpers (not POM)
```

## Anti-patterns

| Do not | Do instead |
|--------|------------|
| `page.getByRole('button', { name: 'Create' })` in a spec | `programsPage.newProgramModal.createButton` |
| `expect(...)` inside `pages/*.ts` | `expect(...)` in the spec after a POM action |
| `page.locator('td')` or CSS/XPath in POM | `getByRole('row')`, `getByRole('cell')`, `getByText` |
| `new NewProgramModal(page)` in a spec that already has `ProgramsPage` | `programsPage.newProgramModal` |
| Duplicate Page Object for the same screen | Extend the existing class |
