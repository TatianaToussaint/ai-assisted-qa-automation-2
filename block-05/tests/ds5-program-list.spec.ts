/**
 * DS-5: Program list filtering and display
 * Test plan: block-05/DS-5/DS-5_output.md
 */
import { test, expect } from '@playwright/test';
import {
  loginAsAdmin,
  navigateToPrograms,
  createProgram,
  seedProgram,
  deleteProgram,
  programRow,
  getProgramDescriptionInList,
  openNewProgramForm,
  newProgramDialog,
  openEditFormForProgram,
  descriptionField,
  saveEditForm,
  uniqueProgramName,
} from '../../tests/helpers/didaxis';

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  await loginAsAdmin(page);
  await navigateToPrograms(page);
});

test.describe('Positive Flows', () => {
  test('TC-DS5-001: program list displays name and description for each program', async ({ page }) => {
    const p1 = await seedProgram(page, 'Web Development 2026', 'Full-stack web development program');
    const p2 = await seedProgram(page, 'Data Science 2026', 'Data analysis and machine learning track');

    await expect(programRow(page, p1.name)).toBeVisible();
    await expect(programRow(page, p2.name)).toBeVisible();
    expect(await getProgramDescriptionInList(page, p1.name)).toBe(p1.description);
    expect(await getProgramDescriptionInList(page, p2.name)).toBe(p2.description);
  });

  test('TC-DS5-004: list displays a single program correctly', async ({ page }) => {
    const program = await seedProgram(page, 'Cloud Engineering 2026', 'Multi-cloud engineering track');
    await expect(programRow(page, program.name)).toBeVisible();
    expect(await getProgramDescriptionInList(page, program.name)).toBe(program.description);
  });

  test('TC-DS5-005: list refreshes after creating a new program', async ({ page }) => {
    const name = uniqueProgramName('DevOps Engineering');
    await createProgram(page, name, 'CI/CD and infrastructure');
    await expect(programRow(page, name)).toBeVisible();
  });

  test('TC-DS5-008: program with special characters displays correctly in list', async ({ page }) => {
    const name = uniqueProgramName('Informatique & IA - Niveau 2');
    await createProgram(page, name, 'Advanced informatics program');
    await expect(programRow(page, name)).toBeVisible();
    expect(await getProgramDescriptionInList(page, name)).toBe('Advanced informatics program');
  });

  test('TC-DS5-009: program with empty description displays appropriately', async ({ page }) => {
    const name = uniqueProgramName('Ethics in AI systems');
    await createProgram(page, name, '');
    await expect(programRow(page, name)).toBeVisible();
    expect(await getProgramDescriptionInList(page, name)).toBe('');
  });

  test('TC-DS5-010: programs page shows page title and list structure', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Programs', level: 2 })).toBeVisible();
    await expect(page.getByRole('button', { name: '+ New Program' })).toBeVisible();
    await expect(page.getByText('Manage academic programs and semesters')).toBeVisible();
  });
});

test.describe('Edge Cases', () => {
  test('TC-DS5-006: list reflects edited description', async ({ page }) => {
    const program = await seedProgram(page, 'Cybersecurity 2026', 'Security fundamentals track');
    const updated = 'Updated security fundamentals track';

    await openEditFormForProgram(page, program.name);
    await descriptionField(page).fill(updated);
    await saveEditForm(page);

    expect(await getProgramDescriptionInList(page, program.name)).toBe(updated);
  });

  test('TC-DS5-007: list refreshes after deleting a program', async ({ page }) => {
    const program = await seedProgram(page, 'Test Program', 'list delete refresh');
    await deleteProgram(page, program.name);
    await expect(programRow(page, program.name)).toHaveCount(0);
  });

  test('TC-DS5-002: empty state indicators (partial — shared test env)', async ({ page }) => {
    // Full empty-state verification requires an isolated tenant; assert create affordance is always present.
    await expect(page.getByRole('button', { name: '+ New Program' })).toBeVisible();
    const body = await page.locator('body').textContent();
    expect(body).toMatch(/program/i);
  });
});
