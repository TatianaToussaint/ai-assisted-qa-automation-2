# Playwright Test Cleanup Examples

## Correct pattern

```typescript
import { test, expect } from "../fixtures/cleanup.fixture";

test("TC-002 — Program is created successfully", async ({ page, trackProgram }) => {
  await loginAsAdmin(page);
  await goToPrograms(page);

  const programName = uniqueName("QA Program");
  const [response] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes("/api/programs") &&
        res.request().method() === "POST" &&
        res.ok(),
    ),
    createProgramViaUI(page, programName, "Created by Playwright"),
  ]);

  const body = await response.json();
  const uuid = body.data?.id ?? body.data?.uuid ?? body.id ?? body.uuid;
  trackProgram(uuid);

  await expect(programRow(page, programName)).toBeVisible();
});
```

## Anti-patterns

**Wrong import — cleanup fixture not used:**

```typescript
import { test, expect } from "@playwright/test";
```

**Manual teardown — fixture already handles this:**

```typescript
test.afterAll(async () => {
  await fetch(`${process.env.DIDAXIS_URL}/api/programs/${uuid}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer eyJ..." },
  });
});
```

**UI cleanup — use the DELETE API instead:**

```typescript
await page.getByRole("button", { name: "Delete" }).click();
```

**Untracked creation — data will accumulate:**

```typescript
test("creates a program", async ({ page }) => {
  // creates program but never calls trackProgram(uuid)
});
```
