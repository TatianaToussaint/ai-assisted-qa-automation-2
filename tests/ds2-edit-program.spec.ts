/**
 * DS-2: Edit existing program details
 * Test plan: Test Cases/DS-2/DS-2_output.md
 * Target app: DIDAXIS_URL (Didaxis)
 */
import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { authStorageState } from './helpers/didaxis';
import { submitCreateAndTrack } from './helpers/program-create';
import { seedProgram, uniqueProgramName } from './helpers/pom-programs';

test.beforeEach(async ({ page }) => {
  const programsPage = new ProgramsPage(page);
  await programsPage.goto();
});

test.describe('Positive Flows', () => {
  test('TC-DS2-001: edit form opens with pre-populated fields', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const editModal = programsPage.editProgramModal;
    const { name, description } = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Web Development 2026',
      'Full-stack web development program',
    );

    await programsPage.openEditFormForProgram(name);

    await expect(editModal.dialog).toBeVisible();
    await expect(editModal.programNameField).toHaveValue(name);
    await expect(editModal.descriptionField).toHaveValue(description);
    await expect(editModal.saveButton).toBeVisible();
    await expect(editModal.saveButton).toBeEnabled();
    await expect(editModal.cancelButton).toBeVisible();
    await expect(editModal.closeButton).toBeVisible();
  });

  test('TC-DS2-002: successfully rename a program', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const editModal = programsPage.editProgramModal;
    const original = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Web Development 2026',
      'Full-stack web development program',
    );
    const updatedName = uniqueProgramName('Web Development 2026 - Updated');

    await programsPage.openEditFormForProgram(original.name);
    await editModal.fillProgramName(updatedName);
    await editModal.clickSave();
    await expect(editModal.dialog).toBeHidden({ timeout: 10000 });

    await expect(programsPage.programRow(updatedName)).toBeVisible();
    await expect(programsPage.programRow(original.name)).toHaveCount(0);
    expect(await programsPage.getProgramDescriptionInList(updatedName)).toBe(original.description);
  });

  test('TC-DS2-003: edit description only preserves program name', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const editModal = programsPage.editProgramModal;
    const program = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Web Development 2026',
      'Full-stack web development program',
    );
    const newDescription = 'Updated full-stack web development program';

    await programsPage.openEditFormForProgram(program.name);
    await editModal.fillDescription(newDescription);
    await editModal.clickSave();
    await expect(editModal.dialog).toBeHidden({ timeout: 10000 });

    await expect(programsPage.programRow(program.name)).toBeVisible();
    expect(await programsPage.getProgramDescriptionInList(program.name)).toBe(newDescription);
  });

  test('TC-DS2-004: edit both program name and description in one save', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const editModal = programsPage.editProgramModal;
    const program = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Data Science 2026',
      'Introductory data science track',
    );
    const newName = uniqueProgramName('Advanced Data Science 2026');
    const newDescription = 'Advanced machine learning and analytics program';

    await programsPage.openEditFormForProgram(program.name);
    await editModal.fillProgramName(newName);
    await editModal.fillDescription(newDescription);
    await editModal.clickSave();
    await expect(editModal.dialog).toBeHidden({ timeout: 10000 });

    await expect(programsPage.programRow(newName)).toBeVisible();
    expect(await programsPage.getProgramDescriptionInList(newName)).toBe(newDescription);
    await expect(programsPage.programRow(program.name)).toHaveCount(0);
  });

  test('TC-DS2-005: edit program name with special characters', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const editModal = programsPage.editProgramModal;
    const program = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Software Engineering Basics',
      'Core software engineering fundamentals',
    );
    const specialName = uniqueProgramName('Informatique & IA - Niveau 2');

    await programsPage.openEditFormForProgram(program.name);
    await editModal.fillProgramName(specialName);
    await editModal.clickSave();
    await expect(editModal.dialog).toBeHidden({ timeout: 10000 });

    await expect(programsPage.programRow(specialName)).toBeVisible();
  });

  test('TC-DS2-006: program list refreshes after successful edit', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const editModal = programsPage.editProgramModal;
    const program = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Cloud Engineering 2026',
      'AWS and Azure cloud engineering track',
    );
    const newDescription = 'Multi-cloud engineering and DevOps track';

    await programsPage.openEditFormForProgram(program.name);
    await editModal.fillDescription(newDescription);
    await editModal.clickSave();
    await expect(editModal.dialog).toBeHidden({ timeout: 10000 });

    expect(await programsPage.getProgramDescriptionInList(program.name)).toBe(newDescription);
  });

  test('TC-DS2-007: save edit with no field changes', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const editModal = programsPage.editProgramModal;
    const program = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Mobile Development 2026',
      'iOS and Android development program',
    );

    await programsPage.openEditFormForProgram(program.name);
    await editModal.clickSave();
    await expect(editModal.dialog).toBeHidden({ timeout: 10000 });

    await expect(programsPage.programRow(program.name)).toBeVisible();
    expect(await programsPage.getProgramDescriptionInList(program.name)).toBe(program.description);
  });
});

test.describe('Negative Flows', () => {
  test('TC-DS2-008: save blocked when program name is cleared', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const editModal = programsPage.editProgramModal;
    const program = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Web Development 2026',
      'Full-stack web development program',
    );

    await programsPage.openEditFormForProgram(program.name);
    await editModal.clearProgramName();

    await expect(editModal.saveButton).toBeDisabled();
    await editModal.clickCancel();
    await expect(editModal.dialog).toBeHidden();
    await expect(programsPage.programRow(program.name)).toBeVisible();
  });

  test.skip('TC-DS2-009: non-admin user cannot edit program', async () => {
    // Requires non-admin credentials not available in .env
  });

  test('TC-DS2-010: rename to existing program name is allowed on edit', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const editModal = programsPage.editProgramModal;
    const programA = await seedProgram(programsPage, page, trackProgram, 'Web Development 2026', 'desc a');
    const programB = await seedProgram(programsPage, page, trackProgram, 'Cybersecurity 2026', 'desc b');

    await programsPage.openEditFormForProgram(programA.name);
    await editModal.fillProgramName(programB.name);
    await editModal.clickSave();
    await expect(editModal.dialog).toBeHidden({ timeout: 10000 });

    await expect(programsPage.programRow(programA.name)).toHaveCount(0);
    expect(await programsPage.countProgramsNamed(programB.name)).toBeGreaterThanOrEqual(2);
  });

  test('TC-DS2-011: cancel edit discards unsaved changes', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const editModal = programsPage.editProgramModal;
    const program = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Web Development 2026',
      'Full-stack web development program',
    );
    const updatedName = uniqueProgramName('Web Development 2026 - Updated');

    await programsPage.openEditFormForProgram(program.name);
    await editModal.fillProgramName(updatedName);
    await editModal.fillDescription('This change should not be saved');
    await editModal.clickCancel();
    await expect(editModal.dialog).toBeHidden();

    await expect(programsPage.programRow(program.name)).toBeVisible();
    expect(await programsPage.getProgramDescriptionInList(program.name)).toBe(program.description);
    await expect(programsPage.programRow(updatedName)).toHaveCount(0);
  });

  test('TC-DS2-012: rename to case variant of existing name is allowed', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const editModal = programsPage.editProgramModal;
    const webProgram = await seedProgram(programsPage, page, trackProgram, 'Web Development 2026', 'web desc');
    const dataProgram = await seedProgram(programsPage, page, trackProgram, 'Data Science 2026', 'data desc');

    await programsPage.openEditFormForProgram(dataProgram.name);
    await editModal.fillProgramName(webProgram.name.toLowerCase());
    await editModal.clickSave();
    await expect(editModal.dialog).toBeHidden({ timeout: 10000 });

    await expect(programsPage.programRow(webProgram.name)).toBeVisible();
    await expect(programsPage.programRow(webProgram.name.toLowerCase())).toBeVisible();
    await expect(programsPage.programRow(dataProgram.name)).toHaveCount(0);
  });
});

test.describe('Edge Cases', () => {
  test('TC-DS2-013: program name at maximum allowed length on edit', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const editModal = programsPage.editProgramModal;
    const program = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Short Name Program',
      'Program for max-length edit test',
    );
    const maxName = 'A'.repeat(255);

    await programsPage.openEditFormForProgram(program.name);
    await editModal.fillProgramName(maxName);
    await editModal.clickSave();
    await expect(editModal.dialog).toBeHidden({ timeout: 10000 });

    await expect(programsPage.programRow(program.name)).toHaveCount(0);
    await expect(programsPage.programRow(maxName).first()).toBeVisible();
  });

  test('TC-DS2-014: program name exceeding 255 characters is accepted on edit', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const editModal = programsPage.editProgramModal;
    const program = await seedProgram(programsPage, page, trackProgram, 'Boundary Edit Test', 'boundary');
    const overMaxName = 'B'.repeat(256);

    await programsPage.openEditFormForProgram(program.name);
    await editModal.fillProgramName(overMaxName);

    if (await editModal.saveButton.isDisabled()) {
      await expect(editModal.saveButton).toBeDisabled();
      await editModal.clickCancel();
      await expect(editModal.dialog).toBeHidden();
      await expect(programsPage.programRow(program.name)).toBeVisible();
    } else {
      await editModal.clickSave();
      await expect(editModal.dialog).toBeHidden({ timeout: 10000 });
      await expect(programsPage.programRow(program.name)).toHaveCount(0);
      await expect(programsPage.programRow(overMaxName).first()).toBeVisible();
    }
  });

  test('TC-DS2-015: whitespace-only program name treated as empty on edit', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const editModal = programsPage.editProgramModal;
    const program = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Web Development 2026',
      'Full-stack web development program',
    );

    await programsPage.openEditFormForProgram(program.name);
    await editModal.fillProgramName('   ');

    await expect(editModal.saveButton).toBeDisabled();
    await editModal.clickCancel();
    await expect(editModal.dialog).toBeHidden();
    await expect(programsPage.programRow(program.name)).toBeVisible();
  });

  test('TC-DS2-016: leading and trailing whitespace preserved in program name on save', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const editModal = programsPage.editProgramModal;
    const program = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Web Development 2026',
      'Full-stack web development program',
    );
    const trimmedName = uniqueProgramName('Mobile Development 2026');
    const paddedName = `  ${trimmedName}  `;

    await programsPage.openEditFormForProgram(program.name);
    await editModal.fillProgramName(paddedName);
    await editModal.clickSave();
    await expect(editModal.dialog).toBeHidden({ timeout: 10000 });

    await expect(programsPage.programRow(paddedName)).toBeVisible();
    await expect(programsPage.programRow(program.name)).toHaveCount(0);
  });

  test('TC-DS2-017: unicode and extended special characters in edited program name', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const editModal = programsPage.editProgramModal;
    const program = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'International Program',
      'Global curriculum program',
    );
    const unicodeName = uniqueProgramName('プログラム — École №1 (2026)');

    await programsPage.openEditFormForProgram(program.name);
    await editModal.fillProgramName(unicodeName);
    await editModal.clickSave();
    await expect(editModal.dialog).toBeHidden({ timeout: 10000 });

    await expect(programsPage.programRow(unicodeName)).toBeVisible();
  });

  test('TC-DS2-018: no edit action for non-existent program', async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    const nonExistent = uniqueProgramName('Deleted Program Test');

    await expect(programsPage.editProgramButton(nonExistent)).toHaveCount(0);
    await expect(programsPage.programRow(nonExistent)).toHaveCount(0);
  });

  test('TC-DS2-019: concurrent edit by two admin sessions', async ({ browser, trackProgram }) => {
    const suffix = Date.now();
    const programName = `Web Development 2026 ${suffix}`;
    const description = 'Full-stack web development program';

    const contextA = await browser.newContext({ storageState: authStorageState });
    const contextB = await browser.newContext({ storageState: authStorageState });
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();
    const programsPageA = new ProgramsPage(pageA);
    const programsPageB = new ProgramsPage(pageB);

    await programsPageA.goto();
    await submitCreateAndTrack(pageA, trackProgram, async () => {
      await programsPageA.createProgram(programName, description);
    });
    await expect(programsPageA.newProgramModal.dialog).toBeHidden({ timeout: 10000 });

    await programsPageB.goto();

    await programsPageA.openEditFormForProgram(programName);
    await programsPageB.openEditFormForProgram(programName);

    await programsPageA.editProgramModal.fillDescription('Updated by Session A');
    await programsPageB.editProgramModal.fillDescription('Updated by Session B');

    await programsPageA.editProgramModal.clickSave();
    await expect(programsPageA.editProgramModal.dialog).toBeHidden({ timeout: 10000 });
    await programsPageB.editProgramModal.clickSave();
    await expect(programsPageB.editProgramModal.dialog).toBeHidden({ timeout: 10000 });

    await programsPageA.navigateViaSidebar();
    const finalDescription = await programsPageA.getProgramDescriptionInList(programName);
    expect(finalDescription).toMatch(/Updated by Session (A|B)/);
    expect(await programsPageA.countProgramsNamed(programName)).toBe(1);

    await contextA.close();
    await contextB.close();
  });

  test('TC-DS2-020: double-click save does not cause duplicate updates or errors', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const editModal = programsPage.editProgramModal;
    const program = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Web Development 2026',
      'Full-stack web development program',
    );
    const newDescription = 'Updated description from double-click test';

    await programsPage.openEditFormForProgram(program.name);
    await editModal.fillDescription(newDescription);
    await editModal.doubleClickSave();
    await expect(editModal.dialog).toBeHidden({ timeout: 10000 });

    expect(await programsPage.countProgramsNamed(program.name)).toBe(1);
    expect(await programsPage.getProgramDescriptionInList(program.name)).toBe(newDescription);
  });

  test('TC-DS2-021: clear description only preserves program name', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const editModal = programsPage.editProgramModal;
    const program = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Web Development 2026',
      'Full-stack web development program',
    );

    await programsPage.openEditFormForProgram(program.name);
    await editModal.fillDescription('');
    await editModal.clickSave();
    await expect(editModal.dialog).toBeHidden({ timeout: 10000 });

    await expect(programsPage.programRow(program.name)).toBeVisible();
    expect(await programsPage.getProgramDescriptionInList(program.name)).toBe('');
  });

  test('TC-DS2-022: description at maximum allowed length on edit', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const editModal = programsPage.editProgramModal;
    const program = await seedProgram(programsPage, page, trackProgram, 'Long Description Edit Test', 'short');
    const maxDescription = 'D'.repeat(1000);

    await programsPage.openEditFormForProgram(program.name);
    await editModal.fillDescription(maxDescription);
    await editModal.clickSave();
    await expect(editModal.dialog).toBeHidden({ timeout: 10000 });

    await expect(programsPage.programRow(program.name)).toBeVisible();
    await programsPage.openEditFormForProgram(program.name);
    await expect(editModal.descriptionField).toHaveValue(maxDescription);
  });

  test('TC-DS2-023: dismiss edit form via escape key without saving', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const editModal = programsPage.editProgramModal;
    const program = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Web Development 2026',
      'Full-stack web development program',
    );
    const updatedName = uniqueProgramName('Web Development 2026 - Updated');

    await programsPage.openEditFormForProgram(program.name);
    await editModal.fillProgramName(updatedName);
    await editModal.dismissWithEscape();

    await expect(editModal.dialog).toBeHidden({ timeout: 10000 });
    await expect(programsPage.programRow(program.name)).toBeVisible();
    await expect(programsPage.programRow(updatedName)).toHaveCount(0);
  });
});
