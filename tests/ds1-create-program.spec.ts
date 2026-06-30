import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateToPrograms, programRow, uniqueProgramName } from './helpers/didaxis';

test('TC-DS1-001: successfully create a new program', async ({ page }) => {
  await loginAsAdmin(page);
  await navigateToPrograms(page);

  const programName = uniqueProgramName('Web Development 2026');
  const description = `Full-stack web development program ${Date.now()}`;

  await page.getByRole('button', { name: '+ New Program' }).click();
  await expect(page.getByRole('dialog', { name: 'New Program' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Program Name' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Description' })).toBeVisible();

  await page.getByRole('textbox', { name: 'Program Name' }).fill(programName);
  await page.getByRole('textbox', { name: 'Description' }).fill(description);
  await page.getByRole('dialog', { name: 'New Program' }).getByRole('button', { name: 'Create' }).click();

  await expect(page.getByRole('dialog', { name: 'New Program' })).toBeHidden({ timeout: 10000 });
  await expect(programRow(page, programName)).toBeVisible();
  await expect(page.getByText(description)).toBeVisible();
});
