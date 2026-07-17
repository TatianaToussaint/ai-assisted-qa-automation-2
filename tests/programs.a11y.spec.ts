/**
 * Programs page accessibility (axe-core)
 *
 * Policy: do not use `.disableRules()` to silence real product violations.
 * Failures attach axe evidence for jira-bug-reporter triage.
 */
import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { expectNoAxeViolations } from './helpers/axe-a11y';

test.describe('Programs accessibility', () => {
  test.beforeEach(async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    await programsPage.goto();
  });

  test('programs page has no accessibility violations @regression', async ({ page }, testInfo) => {
    const programsPage = new ProgramsPage(page);

    await expect(programsPage.heading).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();

    await expectNoAxeViolations(results, testInfo, 'programs-page');
  });

  test('New Program modal has no accessibility violations within scope @regression', async ({
    page,
  }, testInfo) => {
    const programsPage = new ProgramsPage(page);
    const modal = programsPage.newProgramModal;

    await programsPage.openNewProgramForm();
    await expect(modal.dialog).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include(await modal.axeIncludeSelector())
      .analyze();

    await expectNoAxeViolations(results, testInfo, 'new-program-modal');

    await modal.clickCancel();
  });
});
