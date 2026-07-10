/**
 * Intentional failure for jira-bug-reporter skill smoke testing.
 * Run: npx playwright test tests/smoke/jira-bug-reporter-live.spec.ts --workers=1
 */
import { test, expect } from '@playwright/test';
import {
  loginAsAdmin,
  navigateToPrograms,
  seedProgram,
  openEditFormForProgram,
  programNameField,
  saveEditForm,
  programRow,
  countProgramsNamed,
} from '../helpers/didaxis';

test.describe.configure({ mode: 'serial' });

test.describe('DS-2: Edit existing program details', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToPrograms(page);
  });

  test('SKILL-SMOKE: duplicate rename on edit should be rejected per DS-3', async ({ page }) => {
    const programA = await seedProgram(page, 'Web Development 2026', 'desc a');
    const programB = await seedProgram(page, 'Cybersecurity 2026', 'desc b');

    await openEditFormForProgram(page, programA.name);
    await programNameField(page).fill(programB.name);
    await saveEditForm(page);

    // Expected per DS-3 / features/DS-2.feature TC-DS2-010 — app currently allows duplicates.
    expect(await countProgramsNamed(page, programB.name)).toBe(1);
    await expect(programRow(page, programB.name)).toHaveCount(1);
  });
});
