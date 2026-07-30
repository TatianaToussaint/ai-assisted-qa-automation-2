/**
 * Login page smoke test — requires a logged-out session.
 */
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { emptyStorageState } from './helpers/didaxis';

test.use({ storageState: emptyStorageState });

test.describe('Login smoke', () => {
  test('login page loads and sign-in form is visible', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.logo).toBeVisible();
    await expect(loginPage.tagline).toBeVisible();
    await expect(loginPage.emailField).toBeVisible();
    await expect(loginPage.passwordField).toBeVisible();
    await expect(loginPage.signInButton).toBeVisible();
    await expect(loginPage.signInButton).toBeEnabled();
  });
});
