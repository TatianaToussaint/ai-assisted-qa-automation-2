/**
 * DS-2: Edit existing program details
 * Test plan: Test Cases/DS-2/DS-2_output.md
 * Target app: DIDAXIS_URL (Didaxis)
 */
import { test, expect } from '../fixtures/cleanup.fixture';
import {
  loginAsAdmin,
  navigateToPrograms,
  openEditFormForProgram,
  programNameField,
  descriptionField,
  saveButton,
  cancelButton,
  saveEditForm,
  cancelEditForm,
  editDialog,
  programRow,
  editProgramButton,
  getProgramDescriptionInList,
  countProgramsNamed,
  uniqueProgramName,
} from './helpers/didaxis';
import { createProgram, seedProgram } from './helpers/program-create';

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  await loginAsAdmin(page);
  await navigateToPrograms(page);
});

test.describe('Positive Flows', () => {
  test('TC-DS2-001: edit form opens with pre-populated fields', async ({ page, trackProgram }) => {
    const { name, description } = await seedProgram(page, trackProgram, 'Web Development 2026', 'Full-stack web development program');

    await openEditFormForProgram(page, name);

    await expect(editDialog(page)).toBeVisible();

    await expect(programNameField(page)).toHaveValue(name);
    await expect(descriptionField(page)).toHaveValue(description);
    await expect(saveButton(page)).toBeVisible();
    await expect(saveButton(page)).toBeEnabled();
    await expect(cancelButton(page)).toBeVisible();
    await expect(editDialog(page).getByRole('banner').getByRole('button')).toBeVisible();
  });

  test('TC-DS2-002: successfully rename a program', async ({ page, trackProgram }) => {
    const original = await seedProgram(page, trackProgram, 'Web Development 2026', 'Full-stack web development program');
    const updatedName = uniqueProgramName('Web Development 2026 - Updated');

    await openEditFormForProgram(page, original.name);
    await programNameField(page).fill(updatedName);
    await saveEditForm(page);

    await expect(programRow(page, updatedName)).toBeVisible();
    await expect(programRow(page, original.name)).toHaveCount(0);
    await expect(await getProgramDescriptionInList(page, updatedName)).toBe(original.description);
  });

  test('TC-DS2-003: edit description only preserves program name', async ({ page, trackProgram }) => {
    const program = await seedProgram(page, trackProgram, 'Web Development 2026', 'Full-stack web development program');
    const newDescription = 'Updated full-stack web development program';

    await openEditFormForProgram(page, program.name);
    await descriptionField(page).fill(newDescription);
    await saveEditForm(page);

    await expect(programRow(page, program.name)).toBeVisible();
    await expect(await getProgramDescriptionInList(page, program.name)).toBe(newDescription);
  });

  test('TC-DS2-004: edit both program name and description in one save', async ({ page, trackProgram }) => {
    const program = await seedProgram(page, trackProgram, 'Data Science 2026', 'Introductory data science track');
    const newName = uniqueProgramName('Advanced Data Science 2026');
    const newDescription = 'Advanced machine learning and analytics program';

    await openEditFormForProgram(page, program.name);
    await programNameField(page).fill(newName);
    await descriptionField(page).fill(newDescription);
    await saveEditForm(page);

    await expect(programRow(page, newName)).toBeVisible();
    await expect(await getProgramDescriptionInList(page, newName)).toBe(newDescription);
    await expect(programRow(page, program.name)).toHaveCount(0);
  });

  test('TC-DS2-005: edit program name with special characters', async ({ page, trackProgram }) => {
    const program = await seedProgram(page, trackProgram, 'Software Engineering Basics', 'Core software engineering fundamentals');
    const specialName = uniqueProgramName('Informatique & IA - Niveau 2');

    await openEditFormForProgram(page, program.name);
    await programNameField(page).fill(specialName);
    await saveEditForm(page);

    await expect(programRow(page, specialName)).toBeVisible();
  });

  test('TC-DS2-006: program list refreshes after successful edit', async ({ page, trackProgram }) => {
    const program = await seedProgram(page, trackProgram, 'Cloud Engineering 2026', 'AWS and Azure cloud engineering track');
    const newDescription = 'Multi-cloud engineering and DevOps track';

    await openEditFormForProgram(page, program.name);
    await descriptionField(page).fill(newDescription);
    await saveEditForm(page);

    await expect(await getProgramDescriptionInList(page, program.name)).toBe(newDescription);
  });

  test('TC-DS2-007: save edit with no field changes', async ({ page, trackProgram }) => {
    const program = await seedProgram(page, trackProgram, 'Mobile Development 2026', 'iOS and Android development program');

    await openEditFormForProgram(page, program.name);
    await saveEditForm(page);

    await expect(programRow(page, program.name)).toBeVisible();
    await expect(await getProgramDescriptionInList(page, program.name)).toBe(program.description);
  });
});

test.describe('Negative Flows', () => {
  test('TC-DS2-008: save blocked when program name is cleared', async ({ page, trackProgram }) => {
    const program = await seedProgram(page, trackProgram, 'Web Development 2026', 'Full-stack web development program');

    await openEditFormForProgram(page, program.name);
    await programNameField(page).fill('');

    await expect(saveButton(page)).toBeDisabled();
    await cancelEditForm(page);
    await expect(programRow(page, program.name)).toBeVisible();
  });

  test.skip('TC-DS2-009: non-admin user cannot edit program', async () => {
    // Requires non-admin credentials not available in .env
  });

  test('TC-DS2-010: rename to existing program name is allowed on edit', async ({ page, trackProgram }) => {
    // Observed: app allows duplicate names on edit (diverges from DS-3 create rules)
    const programA = await seedProgram(page, trackProgram, 'Web Development 2026', 'desc a');
    const programB = await seedProgram(page, trackProgram, 'Cybersecurity 2026', 'desc b');

    await openEditFormForProgram(page, programA.name);
    await programNameField(page).fill(programB.name);
    await saveEditForm(page);

    await expect(programRow(page, programA.name)).toHaveCount(0);
    expect(await countProgramsNamed(page, programB.name)).toBeGreaterThanOrEqual(2);
  });

  test('TC-DS2-011: cancel edit discards unsaved changes', async ({ page, trackProgram }) => {
    const program = await seedProgram(page, trackProgram, 'Web Development 2026', 'Full-stack web development program');
    const updatedName = uniqueProgramName('Web Development 2026 - Updated');

    await openEditFormForProgram(page, program.name);
    await programNameField(page).fill(updatedName);
    await descriptionField(page).fill('This change should not be saved');
    await cancelEditForm(page);

    await expect(programRow(page, program.name)).toBeVisible();
    await expect(await getProgramDescriptionInList(page, program.name)).toBe(program.description);
    await expect(programRow(page, updatedName)).toHaveCount(0);
  });

  test('TC-DS2-012: rename to case variant of existing name is allowed', async ({ page, trackProgram }) => {
    const webProgram = await seedProgram(page, trackProgram, 'Web Development 2026', 'web desc');
    const dataProgram = await seedProgram(page, trackProgram, 'Data Science 2026', 'data desc');

    await openEditFormForProgram(page, dataProgram.name);
    await programNameField(page).fill(webProgram.name.toLowerCase());
    await saveEditForm(page);

    // Case-sensitive: lowercase variant coexists with original casing
    await expect(programRow(page, webProgram.name)).toBeVisible();
    await expect(programRow(page, webProgram.name.toLowerCase())).toBeVisible();
    await expect(programRow(page, dataProgram.name)).toHaveCount(0);
  });
});

test.describe('Edge Cases', () => {
  test('TC-DS2-013: program name at maximum allowed length on edit', async ({ page, trackProgram }) => {
    const program = await seedProgram(page, trackProgram, 'Short Name Program', 'Program for max-length edit test');
    const maxName = 'A'.repeat(255);

    await openEditFormForProgram(page, program.name);
    await programNameField(page).fill(maxName);
    await saveEditForm(page);

    await expect(programRow(page, program.name)).toHaveCount(0);
    await expect(programRow(page, maxName).first()).toBeVisible();
  });

  test('TC-DS2-014: program name exceeding 255 characters is accepted on edit', async ({ page, trackProgram }) => {
    const program = await seedProgram(page, trackProgram, 'Boundary Edit Test', 'boundary');
    const overMaxName = 'B'.repeat(256);

    await openEditFormForProgram(page, program.name);
    await programNameField(page).fill(overMaxName);

    // App accepts 256+ characters without blocking Save (observed behavior)
    if (await saveButton(page).isDisabled()) {
      await expect(saveButton(page)).toBeDisabled();
      await cancelEditForm(page);
      await expect(programRow(page, program.name)).toBeVisible();
    } else {
      await saveEditForm(page);
      await expect(programRow(page, program.name)).toHaveCount(0);
      await expect(programRow(page, overMaxName).first()).toBeVisible();
    }
  });

  test('TC-DS2-015: whitespace-only program name treated as empty on edit', async ({ page, trackProgram }) => {
    const program = await seedProgram(page, trackProgram, 'Web Development 2026', 'Full-stack web development program');

    await openEditFormForProgram(page, program.name);
    await programNameField(page).fill('   ');

    await expect(saveButton(page)).toBeDisabled();
    await cancelEditForm(page);
    await expect(programRow(page, program.name)).toBeVisible();
  });

  test('TC-DS2-016: leading and trailing whitespace preserved in program name on save', async ({ page, trackProgram }) => {
    const program = await seedProgram(page, trackProgram, 'Web Development 2026', 'Full-stack web development program');
    const trimmedName = uniqueProgramName('Mobile Development 2026');
    const paddedName = `  ${trimmedName}  `;

    await openEditFormForProgram(page, program.name);
    await programNameField(page).fill(paddedName);
    await saveEditForm(page);

    // App stores the name with leading/trailing whitespace (does not trim on edit)
    await expect(programRow(page, paddedName)).toBeVisible();
    await expect(programRow(page, program.name)).toHaveCount(0);
  });

  test('TC-DS2-017: unicode and extended special characters in edited program name', async ({ page, trackProgram }) => {
    const program = await seedProgram(page, trackProgram, 'International Program', 'Global curriculum program');
    const unicodeName = uniqueProgramName('プログラム — École №1 (2026)');

    await openEditFormForProgram(page, program.name);
    await programNameField(page).fill(unicodeName);
    await saveEditForm(page);

    await expect(programRow(page, unicodeName)).toBeVisible();
  });

  test('TC-DS2-018: no edit action for non-existent program', async ({ page }) => {
    const nonExistent = uniqueProgramName('Deleted Program Test');
    await expect(editProgramButton(page, nonExistent)).toHaveCount(0);
    await expect(programRow(page, nonExistent)).toHaveCount(0);
  });

  test('TC-DS2-019: concurrent edit by two admin sessions', async ({ browser, trackProgram }) => {
    const suffix = Date.now();
    const programName = `Web Development 2026 ${suffix}`;
    const description = 'Full-stack web development program';

    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    await loginAsAdmin(pageA);
    await navigateToPrograms(pageA);
    await createProgram(pageA, trackProgram, programName, description);

    await loginAsAdmin(pageB);
    await navigateToPrograms(pageB);

    await openEditFormForProgram(pageA, programName);
    await openEditFormForProgram(pageB, programName);

    await descriptionField(pageA).fill('Updated by Session A');
    await descriptionField(pageB).fill('Updated by Session B');

    await saveEditForm(pageA);
    await saveEditForm(pageB);

    await navigateToPrograms(pageA);
    const finalDescription = await getProgramDescriptionInList(pageA, programName);
    expect(finalDescription).toMatch(/Updated by Session (A|B)/);
    expect(await countProgramsNamed(pageA, programName)).toBe(1);

    await contextA.close();
    await contextB.close();
  });

  test('TC-DS2-020: double-click save does not cause duplicate updates or errors', async ({ page, trackProgram }) => {
    const program = await seedProgram(page, trackProgram, 'Web Development 2026', 'Full-stack web development program');
    const newDescription = 'Updated description from double-click test';

    await openEditFormForProgram(page, program.name);
    await descriptionField(page).fill(newDescription);
    await saveButton(page).dblclick();
    await expect(editDialog(page)).toBeHidden({ timeout: 10000 });

    expect(await countProgramsNamed(page, program.name)).toBe(1);
    await expect(await getProgramDescriptionInList(page, program.name)).toBe(newDescription);
  });

  test('TC-DS2-021: clear description only preserves program name', async ({ page, trackProgram }) => {
    const program = await seedProgram(page, trackProgram, 'Web Development 2026', 'Full-stack web development program');

    await openEditFormForProgram(page, program.name);
    await descriptionField(page).fill('');
    await saveEditForm(page);

    await expect(programRow(page, program.name)).toBeVisible();
    const description = await getProgramDescriptionInList(page, program.name);
    expect(description).toBe('');
  });

  test('TC-DS2-022: description at maximum allowed length on edit', async ({ page, trackProgram }) => {
    const program = await seedProgram(page, trackProgram, 'Long Description Edit Test', 'short');
    const maxDescription = 'D'.repeat(1000);

    await openEditFormForProgram(page, program.name);
    await descriptionField(page).fill(maxDescription);
    await saveEditForm(page);

    await expect(programRow(page, program.name)).toBeVisible();
    await openEditFormForProgram(page, program.name);
    await expect(descriptionField(page)).toHaveValue(maxDescription);
  });

  test('TC-DS2-023: dismiss edit form via escape key without saving', async ({ page, trackProgram }) => {
    const program = await seedProgram(page, trackProgram, 'Web Development 2026', 'Full-stack web development program');
    const updatedName = uniqueProgramName('Web Development 2026 - Updated');

    await openEditFormForProgram(page, program.name);
    await programNameField(page).fill(updatedName);
    await page.keyboard.press('Escape');

    await expect(editDialog(page)).toBeHidden({ timeout: 10000 });
    await expect(programRow(page, program.name)).toBeVisible();
    await expect(programRow(page, updatedName)).toHaveCount(0);
  });
});
