---
name: didaxis-bulk-cleanup
description: Deletes Didaxis programs via the REST API on user request. Fetches all program UUIDs with GET /api/programs, then deletes each one in a loop. Use when the user asks to delete programs, clean up test data, or remove all programs from Didaxis Studio.
---

# Didaxis Bulk Program Cleanup

Deletes Didaxis programs via the REST API on user request. Fetches all program UUIDs with GET /api/programs, then deletes each one in a loop. Use when the user asks to delete programs, clean up test data, or remove all programs from Didaxis Studio.

## When to use

- User explicitly asks to delete all programs or reset the Didaxis program list
- **Performance issues** — program list is slow or unreliable because hundreds of test orphans accumulated
- User wants a one-off bulk cleanup outside of Playwright test teardown

## When NOT to use

- Generating or reviewing Playwright tests → use [playwright-test-cleanup](../playwright-test-cleanup/SKILL.md) instead
- Automatic cleanup after a single test run → use `fixtures/cleanup.fixture.ts` and `trackProgram(uuid)`
- User did not explicitly request bulk deletion → do not run this script
- Routine test runs where per-test cleanup is working → fix tests, do not bulk-delete

## Workflow

1. Confirm the user wants **all** programs deleted (not just test-created ones).
2. Run a dry run first:

```bash
node scripts/delete-all-programs.mjs
```

3. Show the user the program count and listed UUIDs/names.
4. Only after explicit confirmation, run:

```bash
node scripts/delete-all-programs.mjs --confirm
```

5. Report deleted and failed counts from the script output.

## Script behavior

`scripts/delete-all-programs.mjs`:

- Loads credentials from `.env` (`DIDAXIS_URL`, optional `DIDAXIS_API_TOKEN`, or `DIDAXIS_EMAIL` / `DIDAXIS_PASSWORD`)
- `GET /api/programs` → extracts each program's `id`
- Loops `DELETE /api/programs/<uuid>` for every program
- Default is dry run; `--confirm` performs deletion

Alias: `scripts/delete-all-didaxis-programs.mjs` accepts `--yes` instead of `--confirm`.

## API reference

- List: `GET ${DIDAXIS_URL}/api/programs`
- Delete: `DELETE ${DIDAXIS_URL}/api/programs/<uuid>`
- Auth: `Authorization: Bearer ${token}` via optional `DIDAXIS_API_TOKEN` or login token from `POST /api/auth/login`

If auth fails and the agent asks for a token, use Playwright MCP to obtain a bearer token from a logged-in session — `DIDAXIS_API_TOKEN` in `.env` is not required.

## Safety rules

- Never run `--confirm` without user approval
- Never hardcode tokens
- Never substitute this script for per-test cleanup in Playwright specs
- If auth fails, stop and ask the user to fix `.env` credentials or use PW MCP

## Additional resources

- For per-test cleanup patterns, see [examples.md](examples.md)
