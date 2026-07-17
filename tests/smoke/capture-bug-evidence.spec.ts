/**
 * Captures screenshots for individual Jira bug reports.
 * Run: npx playwright test tests/smoke/capture-bug-evidence.spec.ts --project=chromium
 *
 * cleanup-intentionally-skipped: leaves programs in Didaxis for manual Jira evidence review
 */
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { ProgramsPage } from '../../pages/ProgramsPage';
import { uniqueProgramName } from '../helpers/pom-programs';

const SCREENSHOT_DIR = path.join(__dirname, 'evidence');

async function seedProgramWithoutTracking(
  programsPage: ProgramsPage,
  baseName: string,
  description: string,
): Promise<{ name: string; description: string }> {
  const name = uniqueProgramName(baseName);
  await programsPage.createProgram(name, description);
  await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });
  return { name, description };
}

test.describe.configure({ mode: 'serial' });

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

test.beforeEach(async ({ page }) => {
  const programsPage = new ProgramsPage(page);
  await programsPage.goto();
});

test('BUG-DS3-duplicate-on-create', async ({ page }) => {
  const programsPage = new ProgramsPage(page);
  const modal = programsPage.newProgramModal;
  const existing = await seedProgramWithoutTracking(programsPage, 'Web Development 2026', 'existing program');

  await programsPage.openNewProgramForm();
  await modal.fillProgramName(existing.name);
  await modal.fillDescription('Duplicate program attempt');
  await modal.clickCreate();
  await expect(modal.dialog).toBeHidden({ timeout: 10000 });
  expect(await programsPage.countProgramsNamed(existing.name)).toBeGreaterThanOrEqual(2);

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'ds3-duplicate-name-on-create.png'),
    fullPage: true,
  });
});

test('BUG-DS2-duplicate-on-edit', async ({ page }) => {
  const programsPage = new ProgramsPage(page);
  const editModal = programsPage.editProgramModal;
  const programA = await seedProgramWithoutTracking(programsPage, 'Web Development 2026', 'desc a');
  const programB = await seedProgramWithoutTracking(programsPage, 'Cybersecurity 2026', 'desc b');

  await programsPage.openEditFormForProgram(programA.name);
  await editModal.fillProgramName(programB.name);
  await editModal.clickSave();
  await expect(editModal.dialog).toBeHidden({ timeout: 10000 });

  expect(await programsPage.countProgramsNamed(programB.name)).toBeGreaterThanOrEqual(2);

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'ds2-duplicate-name-on-edit.png'),
    fullPage: true,
  });
});

test('BUG-DS2-max-length-exceeded', async ({ page }) => {
  const programsPage = new ProgramsPage(page);
  const editModal = programsPage.editProgramModal;
  const program = await seedProgramWithoutTracking(programsPage, 'Boundary Edit Test', 'boundary');
  const overMaxName = 'B'.repeat(256);

  await programsPage.openEditFormForProgram(program.name);
  await editModal.fillProgramName(overMaxName);

  if (await editModal.saveButton.isDisabled()) {
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'ds2-max-length-exceeded.png'),
      fullPage: true,
    });
    return;
  }

  await editModal.clickSave();
  await expect(editModal.dialog).toBeHidden({ timeout: 10000 });
  await expect(programsPage.programRow(overMaxName).first()).toBeVisible();

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'ds2-max-length-exceeded.png'),
    fullPage: true,
  });
});

test('BUG-DS2-whitespace-not-trimmed', async ({ page }) => {
  const programsPage = new ProgramsPage(page);
  const editModal = programsPage.editProgramModal;
  const program = await seedProgramWithoutTracking(
    programsPage,
    'Web Development 2026',
    'Full-stack web development program',
  );
  const paddedName = `  Mobile Development 2026 ${Date.now()}  `;

  await programsPage.openEditFormForProgram(program.name);
  await editModal.fillProgramName(paddedName);
  await editModal.clickSave();
  await expect(editModal.dialog).toBeHidden({ timeout: 10000 });

  await expect(programsPage.programRow(paddedName)).toBeVisible();

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'ds2-whitespace-not-trimmed.png'),
    fullPage: true,
  });
});

test('BUG-DS4-native-confirm-delete', async ({ page }) => {
  const programsPage = new ProgramsPage(page);
  const program = await seedProgramWithoutTracking(programsPage, 'Test Program', 'delete confirm evidence');

  const dialogMessage = await programsPage.cancelDeleteProgram(program.name);
  await expect(programsPage.programRow(program.name)).toBeVisible();

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'ds4-delete-native-confirm-trigger.png'),
    fullPage: true,
  });

  fs.writeFileSync(
    path.join(SCREENSHOT_DIR, 'ds4-native-confirm-message.txt'),
    dialogMessage,
    'utf8',
  );
});
