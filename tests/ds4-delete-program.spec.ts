/**
 * DS-4: Delete program with confirmation
 * Test plan: Test Cases/DS-4/DS-4_output.md
 * Feature: features/DS-4.feature
 * Target app: DIDAXIS_URL (Didaxis)
 */
import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { seedProgram, uniqueProgramName } from './helpers/pom-programs';

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  const programsPage = new ProgramsPage(page);
  await programsPage.goto();
});

test.describe('Positive Flows', () => {
  test('TC-DS4-001: delete program after confirmation', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const program = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Test Program',
      'Program created for deletion testing',
    );
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });

    await programsPage.deleteProgram(program.name);
    await expect(programsPage.programRow(program.name)).toHaveCount(0);
  });

  test('TC-DS4-002: cancel deletion keeps program in list', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const program = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Test Program',
      'Program created for deletion testing',
    );
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });

    await programsPage.cancelDeleteProgram(program.name);
    await expect(programsPage.programRow(program.name)).toBeVisible();
    expect(await programsPage.getProgramDescriptionInList(program.name)).toBe(program.description);
  });

  test('TC-DS4-003: confirmation dialog displays correct program name', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const program = await seedProgram(programsPage, page, trackProgram, 'Test Program', 'delete confirm text');
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });

    const message = await programsPage.cancelDeleteProgram(program.name);
    expect(message).toContain(program.name);
    expect(message).toMatch(/cannot be undone/i);
    await expect(programsPage.programRow(program.name)).toBeVisible();
  });

  test('TC-DS4-004: delete program with special characters in name', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const name = uniqueProgramName('C Programming Basics C++ & C#: "Intro" (2026)');
    const program = await seedProgram(programsPage, page, trackProgram, name, 'Introductory C programming');
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });

    await programsPage.deleteProgram(program.name);
    await expect(programsPage.programRow(program.name)).toHaveCount(0);
  });

  test('TC-DS4-005: delete one program when multiple programs exist', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const keep = await seedProgram(programsPage, page, trackProgram, 'Web Development 2026', 'keep this');
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });
    const remove = await seedProgram(programsPage, page, trackProgram, 'Data Science 2026', 'remove this');
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });

    await programsPage.deleteProgram(remove.name);
    await expect(programsPage.programRow(remove.name)).toHaveCount(0);
    await expect(programsPage.programRow(keep.name)).toBeVisible();
  });
});

test.describe('Negative Flows', () => {
  test('TC-DS4-008: delete not executed when confirmation dismissed', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const program = await seedProgram(programsPage, page, trackProgram, 'Test Program', 'dismiss test');
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });

    await programsPage.cancelDeleteProgram(program.name);
    await expect(programsPage.programRow(program.name)).toBeVisible();
  });
});

test.describe('Edge Cases', () => {
  test('TC-DS4-016: delete control is icon button with accessible name', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const program = await seedProgram(programsPage, page, trackProgram, 'Test Program', 'icon label test');
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });

    await expect(programsPage.deleteProgramButton(program.name)).toBeVisible();
    await programsPage.cancelDeleteProgram(program.name);
  });

  test('TC-DS4-018: program list refreshes after delete without manual reload', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const program = await seedProgram(programsPage, page, trackProgram, 'Test Program', 'refresh test');
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });

    await programsPage.deleteProgram(program.name);
    await expect(programsPage.programRow(program.name)).toHaveCount(0);
    await expect(programsPage.heading).toBeVisible();
  });
});
