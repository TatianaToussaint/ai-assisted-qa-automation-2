# Prompt Template — Playwright Tests

## Role

You are a senior QA automation engineer writing Playwright tests for Didaxis Studio.

## Task

Write Playwright tests for creating a new program on Didaxis Studio.

## App context (from manual inspection)

- Login page: [https://test.didaxis.studio/login](https://test.didaxis.studio/login)
  - Email field: `getByLabel('Email')`
  - Password field: `getByLabel('Password')`
  - Sign In button: `getByRole('button', { name: 'Sign In' })`

- Programs page: `/programs`
  - "+ New Program" button: `getByRole('button', { name: '+ New Program' })`
  - Modal form:
    - Program Name: `getByLabel('Program Name')`
    - Description: `getByLabel('Description')`
    - Create button: `getByRole('button', { name: 'Create' })`

## Credentials

Use dotenv. Read email and password from `process.env`:

- `process.env.DIDAXIS_EMAIL`
- `process.env.DIDAXIS_PASSWORD`

Do NOT hardcode credentials in the test file.

## Test plan

Test cases are sourced from **Test Cases/DS-1/DS-1_output.md** (Block 2 — Create New Academic Program). Please consult that file for detailed, structured Gherkin steps and expected results for each scenario.

### Acceptance Criteria Coverage

| AC Scenario | Test Case(s) |
|-------------|--------------|
| Navigate to program creation form | TC-DS1-001 |
| Successfully create a program | TC-DS1-002 |
| Validation prevents empty program name | TC-DS1-006, TC-DS1-010 |

### Test cases to automate (priority)

**Positive flows:** TC-DS1-001, TC-DS1-002, TC-DS1-003, TC-DS1-004, TC-DS1-005

**Negative flows:** TC-DS1-006, TC-DS1-009, TC-DS1-010

**Edge cases:** TC-DS1-011, TC-DS1-015, TC-DS1-017

**Out of scope for automation (missing preconditions):** TC-DS1-008 (non-admin credentials), TC-DS1-018 (empty program list)

## Requirements

- TypeScript
- Use Playwright locators (`getByRole`, `getByLabel`, `getByText`)
- Login as the first step in each test (or use `beforeEach`)
- Each test is independent
- Use unique test data with `Date.now()` suffix
- Save as `tests/ds1-create-program.spec.ts`
