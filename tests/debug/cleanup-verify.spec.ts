/**
 * One-off diagnostic: verify API cleanup deletes a program created in-test.
 * Run: npx playwright test tests/debug/cleanup-verify.spec.ts --workers=1
 */
import { test, expect } from '../../fixtures/cleanup.fixture';
import { createProgram } from '../helpers/program-create';

function uniqueName(base: string): string {
  return `${base} ${Date.now()}`;
}

async function login(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Email').fill(process.env.DIDAXIS_EMAIL!);
  await page.getByLabel('Password').fill(process.env.DIDAXIS_PASSWORD!);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
}

test('cleanup removes created program from list', async ({ page, trackProgram }) => {
  await login(page);
  await page.goto('/programs', { waitUntil: 'domcontentloaded' });

  const rowsBefore = await page.getByRole('row').count();
  const name = uniqueName('Cleanup Verify');

  await createProgram(page, trackProgram, name, 'Should be deleted after test');

  await expect(page.getByRole('row').filter({
    has: page.locator('td').first().getByText(name, { exact: true }),
  })).toHaveCount(1);

  // trackProgram fixture teardown runs after this test — re-check in afterEach via second test
  (test.info() as { rowsBefore: number; name: string }).rowsBefore = rowsBefore;
  (test.info() as { rowsBefore: number; name: string }).name = name;
});

test('created program is gone after previous test cleanup', async ({ page }) => {
  await login(page);
  await page.goto('/programs', { waitUntil: 'domcontentloaded' });

  const orphanName = 'Cleanup Verify';
  const orphans = page.getByRole('row').filter({
    has: page.locator('td').first().getByText(orphanName, { exact: false }),
  });
  expect(await orphans.count()).toBe(0);
});
