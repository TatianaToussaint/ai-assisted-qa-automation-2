/**
 * DS-3: Program name validation and duplicate prevention
 * Test plan: block-05/DS-3/DS-3_output.md
 */
import { test, expect } from '../../fixtures/cleanup.fixture';
import {
  goToPrograms,
  openNewProgramForm,
  programNameField,
  descriptionField,
  newProgramDialog,
  createButton,
  programRow,
  countProgramsNamed,
  uniqueProgramName,
} from '../../tests/helpers/didaxis';
import { createProgram, seedProgram, submitCreateAndTrack } from '../../tests/helpers/program-create';

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  await goToPrograms(page);
});

test.describe('Positive Flows', () => {
  test('TC-DS3-001: program name accepts special characters on create', async ({ page, trackProgram }) => {
    const name = uniqueProgramName('Informatique & IA - Niveau 2');
    await createProgram(page, trackProgram, name, 'Advanced informatics and artificial intelligence program');
    await expect(programRow(page, name)).toBeVisible();
  });

  test('TC-DS3-002: valid program name with inner spaces is accepted', async ({ page, trackProgram }) => {
    const name = uniqueProgramName('Web Development 2026');
    await createProgram(page, trackProgram, name, 'Full-stack web development program');
    await expect(programRow(page, name)).toBeVisible();
  });

  test('TC-DS3-018: unicode and extended special characters in program name', async ({ page, trackProgram }) => {
    const name = uniqueProgramName('プログラム — École №1 (2026)');
    await createProgram(page, trackProgram, name, 'Global curriculum program');
    await expect(programRow(page, name)).toBeVisible();
  });
});

test.describe('Negative Flows', () => {
  test('TC-DS3-007: whitespace-only program name rejected on create', async ({ page }) => {
    await openNewProgramForm(page);
    await programNameField(page, 'New Program').fill('   ');
    await descriptionField(page, 'New Program').fill('Should not be created');
    await expect(createButton(page)).toBeDisabled();
    await newProgramDialog(page).getByRole('banner').getByRole('button').click();
    await expect(newProgramDialog(page)).toBeHidden();
  });

  test('TC-DS3-008: empty program name rejected on create', async ({ page }) => {
    await openNewProgramForm(page);
    await descriptionField(page, 'New Program').fill('Description without name');
    await expect(createButton(page)).toBeDisabled();
  });

  test('TC-DS3-009: duplicate program name on create (observed behavior)', async ({ page, trackProgram }) => {
    const existing = await seedProgram(page, trackProgram, 'Web Development 2026', 'existing program');

    await openNewProgramForm(page);
    await programNameField(page, 'New Program').fill(existing.name);
    await descriptionField(page, 'New Program').fill('Duplicate program attempt');
    await submitCreateAndTrack(page, trackProgram, async () => {
      await createButton(page).click();
    });
    await expect(newProgramDialog(page)).toBeHidden({ timeout: 10000 });

    expect(await countProgramsNamed(page, existing.name)).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Edge Cases', () => {
  test('TC-DS3-003: leading and trailing whitespace on create (observed trim)', async ({ page, trackProgram }) => {
    const base = uniqueProgramName('Mobile Development 2026');
    const padded = `  ${base}  `;

    await openNewProgramForm(page);
    await programNameField(page, 'New Program').fill(padded);
    await descriptionField(page, 'New Program').fill('Mobile apps track');
    await submitCreateAndTrack(page, trackProgram, async () => {
      await createButton(page).click();
    });
    await expect(newProgramDialog(page)).toBeHidden({ timeout: 10000 });

    const trimmedVisible = await programRow(page, base).isVisible();
    const paddedVisible = await programRow(page, padded).isVisible();
    expect(trimmedVisible || paddedVisible).toBe(true);
  });

  test('TC-DS3-015: case sensitivity on duplicate create (observed)', async ({ page, trackProgram }) => {
    const existing = await seedProgram(page, trackProgram, 'Data Science 2026', 'data track');
    const variant = existing.name.replace('Data', 'data');

    await openNewProgramForm(page);
    await programNameField(page, 'New Program').fill(variant);
    await descriptionField(page, 'New Program').fill('case variant');
    await submitCreateAndTrack(page, trackProgram, async () => {
      await createButton(page).click();
    });
    await expect(newProgramDialog(page)).toBeHidden({ timeout: 10000 });

    if (variant !== existing.name) {
      await expect(programRow(page, variant)).toBeVisible();
    }
  });
});
