# CI Failure Triage — Examples

## Example 1 — App bug (accessibility)

### Input

Run **30596576853**, workflow **E2E Tests**, commit `565a5c4`.

```bash
gh run list --repo TatianaToussaint/ai-assisted-qa-automation-2 --status failure --limit 5
gh run view 30596576853 --log-failed
gh run download 30596576853 -n playwright-report -D test-evidence/ci-failed-runs/30596576853/
```

Log / artifact excerpt:

```
tests/programs.a11y.spec.ts >> Programs accessibility >> New Program modal has no accessibility violations within scope @regression

Error: [critical] button-name
  Buttons must have discernible text
  nodes (1): .m_220c80f2
```

### Cross-reference

- **Spec:** [`tests/programs.a11y.spec.ts`](../../tests/programs.a11y.spec.ts:28) — opens New Program modal, runs axe on modal scope via `expectNoAxeViolations`
- **POM:** [`pages/NewProgramModal.ts`](../../pages/NewProgramModal.ts:17) — `closeButton` targets `dialog.getByRole('banner').getByRole('button')` (icon-only, no accessible name)
- **Helper:** [`tests/helpers/axe-a11y.ts`](../../tests/helpers/axe-a11y.ts) — attaches violation JSON/txt on failure
- **Policy:** Spec comment — do not use `.disableRules()` to silence real product violations

axe identifies `.m_220c80f2` inside the modal: an icon-only control (likely modal close) with no `aria-label`, visible text, or `title`.

### Classification

**App bug** — test and axe policy are correct; Didaxis UI ships an unnamed button in the New Program modal.

### Triage report

```markdown
## CI failure triage

**Run:** [30596576853](https://github.com/TatianaToussaint/ai-assisted-qa-automation-2/actions/runs/30596576853) · commit `565a5c4` · workflow `E2E Tests`

**Failing test:** `tests/programs.a11y.spec.ts` — "New Program modal has no accessibility violations within scope @regression"

**Classification:** App bug (pending human confirm)

**Root cause:** Didaxis New Program modal — icon-only button (CSS `.m_220c80f2`, modal header close control) lacks discernible accessible name (`button-name` / WCAG 4.1.2). Not a test or POM defect; axe correctly flags product UI.

| | |
|---|---|
| **Expected** | Modal scoped to `#root` has zero critical axe violations when opened |
| **Actual** | One critical `button-name` violation on unnamed button in modal header |

**Suggested fix:** App team: add `aria-label="Close"` (or visible text) to the modal close button. Test change not recommended — keep `test.fixme` until app is fixed, or remove fixme after fix lands.

**Evidence:** `test-evidence/ci-failed-runs/30596576853/data/16ec0cc073eab11d7c070f5c3d6bb1ace841304e.md`; axe node `.m_220c80f2`

**Jira:** pending confirmation → follow jira-bug-reporter, parent story from Programs/a11y context
```

---

## Example 2 — Test issue (assertion vs observed behavior)

### Input

Run **30585009999**, workflow **Playwright Tests**, commit `387ed15`.

```bash
gh run view 30585009999 --log-failed
gh run download 30585009999 -n playwright-report -D test-evidence/ci-failed-runs/30585009999/
```

Log excerpt:

```
tests/ds3-program-validation.spec.ts >> Edge Cases >> TC-DS3-003: leading and trailing whitespace on create (observed trim behavior)

Error: expect(locator).toHaveCount(expected) failed
Expected: 0
Received: 1
> 260 | await expect(programsPage.programRow(padded)).toHaveCount(0);
```

### Cross-reference

- **Spec:** [`tests/ds3-program-validation.spec.ts`](../../tests/ds3-program-validation.spec.ts:239-261) — creates program with padded name `"  ${base}  "`, then if trimmed row visible asserts padded row count is 0
- **POM:** [`pages/ProgramsPage.ts`](../../pages/ProgramsPage.ts:70-74) — `programRow(name)` filters rows by exact text match
- **AC:** [`features/DS-3.feature`](../../features/DS-3.feature:28-38) TC-DS3-003 expects trimmed name in list and padded name absent — test assertion aligns with AC, but test title documents **observed** trim behavior (app may not trim)
- **Current state:** Test marked `test.fixme` after CI failure

When trimmed row is visible, assertion at line 260 still finds one row matching the padded string — the test assumed trim-on-display but the app retains/stores the padded variant in the list row text.

### Classification

**Test issue** — assertion at `tests/ds3-program-validation.spec.ts:260` encodes ideal AC trim behavior without matching documented observed app behavior; spec should stay `fixme` or assert what the app actually does until product fixes trim.

### Triage report

```markdown
## CI failure triage

**Run:** [30585009999](https://github.com/TatianaToussaint/ai-assisted-qa-automation-2/actions/runs/30585009999) · commit `387ed15` · workflow `Playwright Tests`

**Failing test:** `tests/ds3-program-validation.spec.ts` — "TC-DS3-003: leading and trailing whitespace on create (observed trim behavior)"

**Classification:** Test issue

**Root cause:** `tests/ds3-program-validation.spec.ts:260` — conditional branch assumes when trimmed name row is visible, padded-name row must not exist (`toHaveCount(0)`). App displays/stores padded program name in list; test title already flags this as observed behavior, not guaranteed AC. Failure is wrong expectation for current product, not a flaky locator.

| | |
|---|---|
| **Expected** | `programRow("  Mobile Development 2026  ")` count 0 after create with padded input |
| **Actual** | Count 1 — padded variant visible in program list |

**Suggested fix (proposed, not applied):**

```typescript
// Option A: keep test.fixme until app trims per DS-3 AC
test.fixme('TC-DS3-003: ...', async () => { ... });

// Option B: document observed behavior explicitly
expect(await programsPage.countProgramsNamed(padded)).toBe(1);
// and file separate app bug if AC trim is required
```

Do not merge without human approval. If AC trim is mandatory, reclassify as app bug and use jira-bug-reporter after human confirm.

**Evidence:** `test-evidence/ci-failed-runs/30585009999/data/7518ba3ced119be0978d088bea971bbc9f65d11b.md`; log line `expect(locator).toHaveCount`
```

---

## Reflection

### What worked

- **`gh` CLI** reliably listed failed runs, pulled `--log-failed` output, and downloaded `playwright-report` artifacts into `test-evidence/ci-failed-runs/<run-id>/`.
- **GitHub MCP** authenticated successfully for repo context (`get_me`, `list_commits`, file/issue tools) but could not replace `gh` for Actions.
- **Cross-referencing** spec → POM → `features/DS-N.feature` made classification straightforward: axe violations on live UI point to app; assertion mismatches on documented "observed" behavior point to test.

### Limitations

- GitHub MCP toolset has no workflow-run or artifact-download tools — triage must shell out to `gh`.
- Artifact download can fail on Windows if target path already exists (`error extracting ... The file exists`); remove or use a fresh directory before re-downloading.
- `test-evidence/` is gitignored — triage artifacts stay local unless archived elsewhere.

### Classification lesson

| Symptom | Shallow read | Root cause |
|---------|--------------|------------|
| axe `button-name` on `.m_220c80f2` | "a11y test failed" | Didaxis modal close button missing accessible name (app) |
| `toHaveCount(0)` got 1 on padded name | "locator flaky" | Spec line 260 asserts trim behavior app does not exhibit (test) |

Always name **file:line or UI component**, not the Playwright error string alone.

### Human-in-the-loop

- No auto-merge of test fixes or app changes.
- Jira filing only after human confirms app bug ([jira-bug-reporter](../jira-bug-reporter/SKILL.md)).
- Revoke and rotate any PAT exposed during MCP setup; use `.env` + OS env vars, never commit tokens.
