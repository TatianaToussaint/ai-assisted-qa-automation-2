/**
 * DS-5: Program list filtering and display
 * Test plan: Test Cases/DS-5/DS-5_output.md
 * Feature: features/DS-5.feature
 * Target app: DIDAXIS_URL (Didaxis)
 */
import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { submitCreateAndTrack } from './helpers/program-create';
import { seedProgram, uniqueProgramName } from './helpers/pom-programs';

test.beforeEach(async ({ page }) => {
  const programsPage = new ProgramsPage(page);
  await programsPage.goto();
});

test.describe('Positive Flows', () => {
  test('TC-DS5-001: program list displays name and description for each program', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const p1 = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Web Development 2026',
      'Full-stack web development program',
    );
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });
    const p2 = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Data Science 2026',
      'Data analysis and machine learning track',
    );
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });

    await expect(programsPage.programRow(p1.name)).toBeVisible();
    await expect(programsPage.programRow(p2.name)).toBeVisible();
    expect(await programsPage.getProgramDescriptionInList(p1.name)).toBe(p1.description);
    expect(await programsPage.getProgramDescriptionInList(p2.name)).toBe(p2.description);
    await expect(programsPage.editProgramButton(p1.name)).toBeVisible();
    await expect(programsPage.deleteProgramButton(p1.name)).toBeVisible();
    await expect(programsPage.editProgramButton(p2.name)).toBeVisible();
    await expect(programsPage.deleteProgramButton(p2.name)).toBeVisible();
  });

  test('TC-DS5-004: list displays a single program correctly', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const program = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Cloud Engineering 2026',
      'Multi-cloud engineering track',
    );
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });

    await expect(programsPage.programRow(program.name)).toBeVisible();
    expect(await programsPage.getProgramDescriptionInList(program.name)).toBe(program.description);
    await expect(programsPage.newProgramButton).toBeVisible();
  });

  test('TC-DS5-005: list refreshes after creating a new program', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const existing = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Web Development 2026',
      'Full-stack web development program',
    );
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });

    const newName = uniqueProgramName('Data Science 2026');
    await submitCreateAndTrack(page, trackProgram, async () => {
      await programsPage.createProgram(newName, 'Data analysis and machine learning track');
    });
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });

    await expect(programsPage.programRow(existing.name)).toBeVisible();
    await expect(programsPage.programRow(newName)).toBeVisible();
    expect(await programsPage.getProgramDescriptionInList(newName)).toBe(
      'Data analysis and machine learning track',
    );
  });

  test('TC-DS5-008: program with special characters displays correctly in list', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const name = uniqueProgramName('Informatique & IA - Niveau 2');
    const description = 'Programme bilingue — informatique & intelligence artificielle';

    await submitCreateAndTrack(page, trackProgram, async () => {
      await programsPage.createProgram(name, description);
    });
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });

    await expect(programsPage.programRow(name)).toBeVisible();
    expect(await programsPage.getProgramDescriptionInList(name)).toBe(description);
  });

  test('TC-DS5-009: program with empty description displays appropriately', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const name = uniqueProgramName('Data Science Fundamentals');

    await submitCreateAndTrack(page, trackProgram, async () => {
      await programsPage.createProgram(name, '');
    });
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });

    await expect(programsPage.programRow(name)).toBeVisible();
    expect(await programsPage.getProgramDescriptionInList(name)).toBe('');
  });

  test('TC-DS5-010: programs page shows page title and list structure', async ({ page }) => {
    const programsPage = new ProgramsPage(page);

    await expect(programsPage.heading).toBeVisible();
    await expect(programsPage.tagline).toBeVisible();
    await expect(programsPage.newProgramButton).toBeVisible();
  });
});

test.describe('Negative Flows', () => {
  test.skip('TC-DS5-011: non-admin user cannot access the program list', async () => {
    // Requires non-admin credentials not available in .env
  });

  test.skip('TC-DS5-012: unauthenticated user cannot view the program list', async () => {
    // Requires empty storageState setup outside default project
  });
});

test.describe('Edge Cases', () => {
  test('TC-DS5-006: list reflects edited description', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const editModal = programsPage.editProgramModal;
    const program = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Web Development 2026',
      'Full-stack web development program',
    );
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });
    const updated = 'Updated full-stack curriculum for 2026';

    await programsPage.openEditFormForProgram(program.name);
    await editModal.fillDescription(updated);
    await editModal.clickSave();
    await expect(editModal.dialog).toBeHidden({ timeout: 10000 });

    expect(await programsPage.getProgramDescriptionInList(program.name)).toBe(updated);
  });

  test('TC-DS5-007: list refreshes after deleting a program', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const keep = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Web Development 2026',
      'Full-stack web development program',
    );
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });
    const remove = await seedProgram(programsPage, page, trackProgram, 'Test Program', 'temporary row');
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });

    await programsPage.deleteProgram(remove.name);

    await expect(programsPage.programRow(remove.name)).toHaveCount(0);
    await expect(programsPage.programRow(keep.name)).toBeVisible();
    expect(await programsPage.getProgramDescriptionInList(keep.name)).toBe(keep.description);
  });

  test('TC-DS5-021: unicode and emoji in description display correctly in the list', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const name = uniqueProgramName('Global Studies 2026');
    const description = 'Multilingual track: 日本語, العربية, 🎓 emoji test';

    await submitCreateAndTrack(page, trackProgram, async () => {
      await programsPage.createProgram(name, description);
    });
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });

    await expect(programsPage.programRow(name)).toBeVisible();
    expect(await programsPage.getProgramDescriptionInList(name)).toBe(description);
  });

  test('TC-DS5-002: empty state indicators (partial — shared test env)', async ({ page }) => {
    const programsPage = new ProgramsPage(page);

    await expect(programsPage.newProgramButton).toBeVisible();
    await expect(programsPage.tagline).toBeVisible();
    await expect(programsPage.heading).toBeVisible();
  });

  test.skip('TC-DS5-003: empty state CTA opens program creation form', async () => {
    test.skip(true, 'Requires empty program list precondition');
  });

  test.skip('TC-DS5-023: deleting the last program transitions to empty state', async () => {
    test.skip(true, 'Requires empty program list precondition');
  });
});
