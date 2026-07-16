/**
 * Captures program list count screenshot for MCP/manual validation.
 * Run: npx playwright test tests/debug/programs-count.spec.ts --workers=1
 */
import { test, expect } from '@playwright/test';
import { goToPrograms } from '../helpers/didaxis';

test('capture programs page row count', async ({ page }) => {
  await goToPrograms(page);

  const rowCount = await page.getByRole('row').count() - 1;
  await page.screenshot({ path: 'test-results/programs-list-count.png', fullPage: true });

  console.log(`PROGRAMS_UI_ROW_COUNT=${rowCount}`);
  expect(rowCount).toBeGreaterThan(0);
});
