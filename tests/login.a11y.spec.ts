/**
 * Login page axe-core scans — requires a logged-out session.
 *
 * Policy: do not use `.disableRules()` to silence real product violations.
 * Failures attach axe evidence for jira-bug-reporter triage.
 */
import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { emptyStorageState } from './helpers/didaxis';
import { expectNoAxeViolations } from './helpers/axe-a11y';

test.use({ storageState: emptyStorageState });

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test.fixme('login page has no accessibility violations @regression', async ({ page }, testInfo) => {
    const loginPage = new LoginPage(page);

    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.logo).toBeVisible();
    await expect(loginPage.tagline).toBeVisible();
    await expect(loginPage.emailField).toBeVisible();
    await expect(loginPage.passwordField).toBeVisible();
    await expect(loginPage.signInButton).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();

    await expectNoAxeViolations(results, testInfo, 'login-page');
  });
});
