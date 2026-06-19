import { test, expect } from '@playwright/test';

test('google page title contains Google', async ({ page }) => {
  await page.goto('https://google.com/');

  await expect(page).toHaveTitle(/Google/);
});
