/**
 * Captures screenshots for individual Jira bug reports.
 * Run: npx playwright test block-05/tests/capture-bug-evidence.spec.ts --project=chromium
 *
 * cleanup-intentionally-skipped: leaves programs in Didaxis for manual Jira evidence review
 */
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import {
  loginAsAdmin,
  navigateToPrograms,
  seedProgram,
  openNewProgramForm,
  openEditFormForProgram,
  programNameField,
  descriptionField,
  createButton,
  saveEditForm,
  saveButton,
  programRow,
  countProgramsNamed,
  deleteProgramButton,
  newProgramDialog,
} from '../../tests/helpers/didaxis';

const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots');

test.describe.configure({ mode: 'serial' });

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

test.beforeEach(async ({ page }) => {
  await loginAsAdmin(page);
  await navigateToPrograms(page);
});

test('BUG-DS3-duplicate-on-create', async ({ page }) => {
  const existing = await seedProgram(page, 'Web Development 2026', 'existing program');

  await openNewProgramForm(page);
  await programNameField(page, 'New Program').fill(existing.name);
  await descriptionField(page, 'New Program').fill('Duplicate program attempt');
  await createButton(page).click();
  await expect(newProgramDialog(page)).toBeHidden({ timeout: 10000 });
  expect(await countProgramsNamed(page, existing.name)).toBeGreaterThanOrEqual(2);

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'ds3-duplicate-name-on-create.png'),
    fullPage: true,
  });
});

test('BUG-DS2-duplicate-on-edit', async ({ page }) => {
  const programA = await seedProgram(page, 'Web Development 2026', 'desc a');
  const programB = await seedProgram(page, 'Cybersecurity 2026', 'desc b');

  await openEditFormForProgram(page, programA.name);
  await programNameField(page).fill(programB.name);
  await saveEditForm(page);

  expect(await countProgramsNamed(page, programB.name)).toBeGreaterThanOrEqual(2);

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'ds2-duplicate-name-on-edit.png'),
    fullPage: true,
  });
});

test('BUG-DS2-max-length-exceeded', async ({ page }) => {
  const program = await seedProgram(page, 'Boundary Edit Test', 'boundary');
  const overMaxName = 'B'.repeat(256);

  await openEditFormForProgram(page, program.name);
  await programNameField(page).fill(overMaxName);

  if (await saveButton(page).isDisabled()) {
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'ds2-max-length-exceeded.png'),
      fullPage: true,
    });
    return;
  }

  await saveEditForm(page);
  await expect(programRow(page, overMaxName).first()).toBeVisible();

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'ds2-max-length-exceeded.png'),
    fullPage: true,
  });
});

test('BUG-DS2-whitespace-not-trimmed', async ({ page }) => {
  const program = await seedProgram(page, 'Web Development 2026', 'Full-stack web development program');
  const paddedName = `  Mobile Development 2026 ${Date.now()}  `;

  await openEditFormForProgram(page, program.name);
  await programNameField(page).fill(paddedName);
  await saveEditForm(page);

  await expect(programRow(page, paddedName)).toBeVisible();

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'ds2-whitespace-not-trimmed.png'),
    fullPage: true,
  });
});

test('BUG-DS4-native-confirm-delete', async ({ page }) => {
  const program = await seedProgram(page, 'Test Program', 'delete confirm evidence');

  let dialogMessage = '';
  page.once('dialog', (dialog) => {
    dialogMessage = dialog.message();
    void dialog.dismiss();
  });

  await deleteProgramButton(page, program.name).click();
  await expect(programRow(page, program.name)).toBeVisible();

  // Native OS confirm dialogs are not captured in screenshots; show the trigger point.
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
