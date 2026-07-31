---
name: ci-failure-triage
description: >-
  When a CI run is red, pull the run's logs and the playwright-report artifact
  via gh CLI, read the Playwright error and trace, cross-reference the spec,
  POM, and app source in the repo, classify real app bug vs test issue, and
  post a structured diagnosis to the PR. Use whenever a build fails — even if
  triage isn't asked for.
---

# CI Failure Triage

## Steps

1. Pull the failed run's logs + `playwright-report` artifact (GitHub MCP / `gh` CLI).
2. Read the Playwright error: failing test, expected vs received, trace path.
3. Cross-reference: the spec, the POM, and acceptance criteria in the repo.
4. Classify: real app bug (route to Jira via bug-reporter) vs test issue (propose a patch for human review).
5. Report: post root cause, affected file, expected/actual, suggested fix, and evidence (trace/screenshot + run id) as a PR comment.

## Rules

- Never merge a fix automatically — propose; a human approves.
- For a real defect (confirm with the human user first), reuse [jira-bug-reporter](../jira-bug-reporter/SKILL.md) and link the story.
- The diagnosis must name the source location and cause, not just the symptom.

## GitHub tooling

| Task | Tool |
|------|------|
| List failed runs, view logs, download artifacts | **`gh` CLI** (required for Actions) |
| Read repo files, PR/issue context, post comments | **GitHub MCP** (`get_file_contents`, `add_issue_comment`, etc.) |

GitHub MCP in Cursor does **not** expose Actions workflow or artifact APIs. Always use `gh` for:

```bash
gh run list --repo TatianaToussaint/ai-assisted-qa-automation-2 --status failure --limit 10
gh run view <run-id> --json conclusion,url,headSha,displayTitle,workflowName
gh run view <run-id> --log-failed
gh run download <run-id> -n playwright-report -D test-evidence/ci-failed-runs/<run-id>/
```

Set `GITHUB_TOKEN` in `.env` (see `.env.example`). Cursor GitHub MCP uses `GITHUB_PERSONAL_ACCESS_TOKEN` in OS environment (`~/.cursor/mcp.json`).

## Pull CI evidence

Workflows: **E2E Tests** (`.github/workflows/e2e.yml`) and **Playwright Tests** (`.github/workflows/playwright.yml`). Artifact name: `playwright-report`.

Resolve the failing run (PR branch or SHA from the red check):

```bash
gh run list --workflow e2e.yml --branch <branch> --limit 5
gh run view <run-id> --json conclusion,url,headSha,displayTitle
gh run view <run-id> --log-failed
```

Download the HTML report and attachments:

```bash
mkdir -p test-evidence/ci-failed-runs/<run-id>
gh run download <run-id> -n playwright-report -D test-evidence/ci-failed-runs/<run-id>/
```

Open `index.html` in the artifact, or read `data/*.md` for failing test names and error text. Trace zips live under `test-results/` inside the artifact when uploaded.

Prefer GitHub MCP (`pull_request_read` for check runs, `get_file_contents` for context) when `gh` is unavailable; use `gh` for logs and artifact download.

## Cross-reference map

| Layer | Repo path | What to verify |
|-------|-----------|----------------|
| Spec | `tests/*.spec.ts` | Test title, steps, assertions, fixtures |
| POM | `pages/*.ts` | Locators, waits, navigation — see [pom-conventions](../pom-conventions/SKILL.md) |
| Acceptance criteria | `features/DS-N.feature` | Expected behavior vs assertion |
| Ticket context | `Test cases/` | Story AC and observed behavior notes |

Didaxis app UI runs at `DIDAXIS_URL` (CI: secret; local: `https://test.didaxis.studio`). This repo holds tests and page objects, not the app codebase — infer app defects from AC + trace/screenshot, not from app source files.

Derive parent story `DS-N` from `test.describe` title or matching `features/DS-N.feature`.

## Classify

**Likely app bug** when:

- Assertion matches feature AC but UI/API behavior differs
- Element exists but wrong content, state, or a11y (axe violations on real UI)
- Reproducible locally with the same steps (optional confirm via `npx playwright test -g "<title>" --workers=1`)

**Likely test issue** when:

- Locator/timeout/wait mismatch; flaky selector; missing `trackProgram` / cleanup
- Expected value contradicts documented "observed" behavior in test title/comments
- Environment/setup (secrets, network) — note separately; do not file Jira unless user asks

When uncertain, state both hypotheses and what evidence would decide.

## PR comment template

Post with `gh pr comment --body-file -` or GitHub MCP `add_issue_comment`:

```markdown
## CI failure triage

**Run:** [<run-id>](<run-url>) · commit `<sha>` · workflow `<name>`

**Failing test:** `tests/...spec.ts` — "<test title>"

**Classification:** App bug | Test issue | Inconclusive (needs human)

**Root cause:** <file:line or component> — <why it failed, not symptom only>

| | |
|---|---|
| **Expected** | … |
| **Actual** | … |

**Suggested fix:** <concrete change; patch proposed in branch / not applied>

**Evidence:** screenshot/trace paths from artifact; Playwright error excerpt

**Jira:** DS-xxx (if filed) · **Human confirm:** required before filing app bug
```

## After classification

**App bug (human confirmed):** Read and follow [jira-bug-reporter](../jira-bug-reporter/SKILL.md). Add the Jira link to the PR comment.

**Test issue:** Propose a minimal patch (spec/POM/fixture only). Do not push or merge without approval.

## Additional resources

- Worked triage examples: [examples.md](examples.md)
