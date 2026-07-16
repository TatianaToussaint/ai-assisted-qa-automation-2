import { test as setup } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

setup('authenticate', async ({ page }) => {
  await page.goto('https://test.didaxis.studio/login', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Email').fill(requireEnv('DIDAXIS_EMAIL'));
  await page.getByLabel('Password').fill(requireEnv('DIDAXIS_PASSWORD'));
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('button', { name: 'Programs' }).click();
  await page.waitForURL('**/programs', { timeout: 30000 });

  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
