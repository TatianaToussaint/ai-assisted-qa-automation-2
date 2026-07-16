/**
 * DS-4: Delete program with confirmation
 * Test plan: block-05/DS-4/DS-4_output.md
 */
import { test, expect } from '../../fixtures/cleanup.fixture';
import {
  goToPrograms,
  deleteProgram,
  cancelDeleteProgram,
  deleteProgramButton,
  programRow,
  getProgramDescriptionInList,
  uniqueProgramName,
} from '../../tests/helpers/didaxis';
import { seedProgram } from '../../tests/helpers/program-create';

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  await goToPrograms(page);
});

test.describe('Positive Flows', () => {
  test('TC-DS4-001: delete program after confirmation', async ({ page, trackProgram }) => {
    const program = await seedProgram(page, trackProgram, 'Test Program', 'Program created for deletion testing');
    await deleteProgram(page, program.name);
    await expect(programRow(page, program.name)).toHaveCount(0);
  });

  test('TC-DS4-002: cancel deletion keeps program in list', async ({ page, trackProgram }) => {
    const program = await seedProgram(page, trackProgram, 'Test Program', 'Program created for deletion testing');
    await cancelDeleteProgram(page, program.name);
    await expect(programRow(page, program.name)).toBeVisible();
    expect(await getProgramDescriptionInList(page, program.name)).toBe(program.description);
  });

  test('TC-DS4-003: confirmation dialog displays correct program name', async ({ page, trackProgram }) => {
    const program = await seedProgram(page, trackProgram, 'Test Program', 'delete confirm text');
    const message = await cancelDeleteProgram(page, program.name);
    expect(message).toContain(program.name);
    expect(message).toMatch(/cannot be undone/i);
    await expect(programRow(page, program.name)).toBeVisible();
  });

  test('TC-DS4-004: delete program with special characters in name', async ({ page, trackProgram }) => {
    const name = uniqueProgramName('C Programming Basics C++ & C#: "Intro" (2026)');
    const program = await seedProgram(page, trackProgram, name, 'Introductory C programming');
    await deleteProgram(page, program.name);
    await expect(programRow(page, program.name)).toHaveCount(0);
  });

  test('TC-DS4-005: delete one program when multiple programs exist', async ({ page, trackProgram }) => {
    const keep = await seedProgram(page, trackProgram, 'Web Development 2026', 'keep this');
    const remove = await seedProgram(page, trackProgram, 'Data Science 2026', 'remove this');
    await deleteProgram(page, remove.name);
    await expect(programRow(page, remove.name)).toHaveCount(0);
    await expect(programRow(page, keep.name)).toBeVisible();
  });
});

test.describe('Negative Flows', () => {
  test('TC-DS4-008: delete not executed when confirmation dismissed', async ({ page, trackProgram }) => {
    const program = await seedProgram(page, trackProgram, 'Test Program', 'dismiss test');
    await cancelDeleteProgram(page, program.name);
    await expect(programRow(page, program.name)).toBeVisible();
  });
});

test.describe('Edge Cases', () => {
  test('TC-DS4-016: delete control is icon button with accessible name', async ({ page, trackProgram }) => {
    const program = await seedProgram(page, trackProgram, 'Test Program', 'icon label test');
    await expect(deleteProgramButton(page, program.name)).toBeVisible();
    await cancelDeleteProgram(page, program.name);
  });

  test('TC-DS4-018: program list refreshes after delete without manual reload', async ({ page, trackProgram }) => {
    const program = await seedProgram(page, trackProgram, 'Test Program', 'refresh test');
    await deleteProgram(page, program.name);
    await expect(programRow(page, program.name)).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Programs', level: 2 })).toBeVisible();
  });
});
