---
name: a11y-checks
description: >-
  Adds @axe-core/playwright accessibility scans when generating or reviewing
  Playwright tests for new pages or components. Apply whenever creating,
  extending, or reviewing UI tests — even if the user does not mention
  accessibility, a11y, or axe.
---

# Accessibility Checks

Every Playwright test for a new page or component **must** include an axe-core scan. This is not optional and does not require the user to ask for it. If you are generating or reviewing a UI test, add or verify an a11y check before considering the work complete.

Also apply **pom-conventions** — route navigation and interactions through Page Objects in `pages/`; no inline locators in specs. Use `getByRole`, `getByLabel`, and `getByText` only.

## When to apply

Apply this skill when you:

- Generate a new Playwright spec or test case for a page or component
- Extend an existing test to cover a new page, modal, drawer, or widget
- Review or refactor any UI test — even functional or E2E tests with no a11y mention

If the test navigates to or interacts with UI, it needs an axe scan.

## Authentication

Didaxis a11y specs run under the **`chromium` project**, which depends on the `setup` project and loads `storageState` from `playwright/.auth/user.json`. Do **not** perform UI login in a11y tests — navigate directly to authenticated routes via POM methods (e.g. `ProgramsPage.goto()`).

Specs that must start logged out (e.g. login page scans) belong in the `chromium-logged-out` project and opt out with `test.use({ storageState: emptyStorageState })`.

## Required pattern

1. Import `AxeBuilder` from `@axe-core/playwright`.
2. Navigate to the target UI via POM methods and wait for it to be ready (web-first `expect` visibility checks first).
3. Run the scan and assert zero violations using the project helper.
4. Tag every a11y test **`@regression`**.

```typescript
import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { expectNoAxeViolations } from './helpers/axe-a11y';

test.describe('Programs accessibility', () => {
  test.beforeEach(async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    await programsPage.goto();
  });

  test('programs page has no accessibility violations @regression', async ({ page }, testInfo) => {
    const programsPage = new ProgramsPage(page);
    await expect(programsPage.heading).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();

    await expectNoAxeViolations(results, testInfo, 'programs-page');
  });
});
```

### Assertion helper

Always prefer `expectNoAxeViolations` from `tests/helpers/axe-a11y.ts` over a bare assertion. It ultimately asserts:

```typescript
await expect(results.violations, summarizeAxeViolations(results.violations)).toEqual([]);
```

On failure it attaches `*-violations.json` and `*-violations.txt` to the Playwright report — evidence for **jira-bug-reporter** triage. Never use bare `assert`, `if (violations.length)`, or manual length checks.

## Full-page and scoped scans

Provide **both** where the UI has a page and a distinct component (modal, drawer, panel):

| Target | Scope | When |
|--------|-------|------|
| Full page | No `.include()` — scan the whole page | Every new page |
| Modal, drawer, panel, or component | Chain `.include(selector)` to limit the scan | Every distinct component under test |

For component-level scans, derive the include selector from a role-based POM locator. Add `axeIncludeSelector()` on the modal POM when needed (see `NewProgramModal.axeIncludeSelector()`). Do not use brittle CSS selectors unrelated to the component under test.

```typescript
test('New Program modal has no accessibility violations within scope @regression', async ({
  page,
}, testInfo) => {
  const programsPage = new ProgramsPage(page);
  const modal = programsPage.newProgramModal;

  await programsPage.openNewProgramForm();
  await expect(modal.dialog).toBeVisible();

  // `.disableRules()` is only for a documented known false positive, upstream
  // issue, ticket, or environmental limitation — not to silence real violations
  // (e.g. color-contrast). Add it here only when such a justification exists.
  const results = await new AxeBuilder({ page })
    .include(await modal.axeIncludeSelector())
    .analyze();

  await expectNoAxeViolations(results, testInfo, 'new-program-modal');

  await modal.clickCancel();
});
```

Reference implementation: `tests/programs.a11y.spec.ts`.

## disableRules — strict policy

`.disableRules()` is allowed **only** when a rule produces a known false positive that cannot be fixed in the test or app right now.

Rules:

- **Always** add an inline comment on the same line or the line above explaining **why** the rule is disabled and what tracks fixing it (ticket, upstream issue, or environmental limitation).
- **Never** use `.disableRules()` to silence a real accessibility failure or make a failing test pass.
- **Never** disable rules preemptively "just in case."
- Prefer fixing the violation or scoping with `.include()` before disabling anything.
- If no valid justification exists, **do not add `.disableRules()`** — leave a comment explaining the policy instead.

```typescript
// color-contrast: third-party chart overlay — tracked in DS-123
.disableRules(['color-contrast'])
```

If you cannot justify the disable with a specific reason, do not disable the rule.

## File placement and config registration

- Dedicated a11y coverage: `tests/<page>.a11y.spec.ts` (see `tests/programs.a11y.spec.ts`)
- Or add an axe assertion at the end of an existing functional test when it already reaches the target UI state

Keep axe scans in test files, not in Page Objects. POMs may expose helpers like `axeIncludeSelector()`; assertions stay in specs.

This repo uses an **explicit Playwright test allowlist** in `playwright.config.ts`. The `chromium` project only runs files listed in `didaxisApplicationSpecs`. When adding a new `*.a11y.spec.ts`, register it there:

```typescript
const didaxisApplicationSpecs = [
  // …existing specs…
  'tests/programs.a11y.spec.ts',
  'tests/<new-page>.a11y.spec.ts',  // add new a11y specs here
];
```

Without registration, `npx playwright test tests/<spec>.a11y.spec.ts --project=chromium` finds **0 tests** under the authenticated project.

## On failure

Do **not** disable rules to go green. Real violations are product defects:

1. Re-run the failing test: `npx playwright test <spec> -g "<title>" --workers=1`
2. Collect evidence: `node scripts/collect-failure-screenshots.mjs --latest`
3. Apply **jira-bug-reporter** to file a sub-task under the parent story

Axe attachments (`*-violations.json`, `*-violations.txt`) are in the HTML report under the failed test.

## Generating tests checklist

- [ ] Target UI is loaded and visible before scanning
- [ ] Uses stored session (no UI login) unless testing a logged-out page
- [ ] Navigation and interactions go through POMs (pom-conventions)
- [ ] Full-page scan provided for each new page
- [ ] Scoped `.include()` scan provided for each distinct component (modal, drawer, etc.)
- [ ] Test title includes `@regression`
- [ ] `AxeBuilder({ page }).analyze()` is called
- [ ] `expectNoAxeViolations(results, testInfo, label)` asserts zero violations
- [ ] Any `.disableRules()` has a commented reason — none added without justification
- [ ] New `*.a11y.spec.ts` files are listed in `playwright.config.ts` under `didaxisApplicationSpecs`

## Reviewing tests checklist

When reviewing any UI test, verify:

- [ ] An axe scan covers every new page or component introduced by the change
- [ ] Scans run after the UI is in the state under test (modal open, form filled, etc.)
- [ ] Violations are asserted with web-first `expect` via `expectNoAxeViolations`
- [ ] No `.disableRules()` without a documented reason
- [ ] No missing a11y coverage because the user didn't say "accessibility"
- [ ] New authenticated specs are registered in `playwright.config.ts`

If any item fails, add or fix the a11y check before considering the test complete.
