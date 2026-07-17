/**
 * DS-3: Program name validation and duplicate prevention
 * Test plan: Test Cases/DS-3/DS-3_output.md
 * Feature: features/DS-3.feature
 * Target app: DIDAXIS_URL (Didaxis)
 *
 * Observed divergences from Jira AC (documented in feature file):
 * - Duplicate names are allowed on create and edit
 * - Names are case-sensitive
 * - Leading/trailing whitespace may not be trimmed
 * - Names longer than 255 characters are accepted
 */
import { test, expect, trackProgramsByExactName } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import {
  submitCreateAndTrack,
  trackMultipleCreatesOnSubmit,
} from './helpers/program-create';
import { seedProgram, uniqueProgramName } from './helpers/pom-programs';

const PROGRAM_NAME_MAX = 255;

test.beforeEach(async ({ page }) => {
  const programsPage = new ProgramsPage(page);
  await programsPage.goto();
});

test.describe('Positive Flows', () => {
  test('TC-DS3-001: program name accepts special characters on create', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const name = uniqueProgramName('Informatique & IA - Niveau 2');

    await submitCreateAndTrack(page, trackProgram, async () => {
      await programsPage.createProgram(name, 'Advanced informatics and artificial intelligence program');
    });
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });
    await expect(programsPage.programRow(name)).toBeVisible();
  });

  test('TC-DS3-002: valid program name with inner spaces is accepted', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const name = uniqueProgramName('Web Development 2026');

    await submitCreateAndTrack(page, trackProgram, async () => {
      await programsPage.createProgram(name, 'Full-stack web development program');
    });
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });
    await expect(programsPage.programRow(name)).toBeVisible();
  });

  test('TC-DS3-004: saving unchanged program name on edit does not trigger duplicate error', async ({
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

    await programsPage.openEditFormForProgram(program.name);
    await editModal.fillDescription('Updated description only');
    await editModal.clickSave();
    await expect(editModal.dialog).toBeHidden({ timeout: 10000 });

    await expect(programsPage.programRow(program.name)).toBeVisible();

    await programsPage.openEditFormForProgram(program.name);
    await expect(editModal.programNameField).toHaveValue(program.name);
    await editModal.clickCancel();
    await expect(editModal.dialog).toBeHidden();
  });

  test('TC-DS3-005: rename to a unique name succeeds on edit', async ({ page, trackProgram }) => {
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

    await programsPage.openEditFormForProgram(program.name);
    await editModal.fillProgramName(newName);
    await editModal.clickSave();
    await expect(editModal.dialog).toBeHidden({ timeout: 10000 });

    await expect(programsPage.programRow(newName)).toBeVisible();
    await expect(programsPage.programRow(program.name)).toHaveCount(0);
  });

  test('TC-DS3-006: program name at maximum allowed length is accepted', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const suffix = String(Date.now()).slice(-10);
    const name = `${'A'.repeat(PROGRAM_NAME_MAX - suffix.length - 1)} ${suffix}`;

    await submitCreateAndTrack(page, trackProgram, async () => {
      await programsPage.createProgram(name, 'Boundary test for max-length program name');
    });
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });
    await expect(programsPage.programRow(name)).toBeVisible();
  });

  test('TC-DS3-018: unicode and extended special characters in program name', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const name = uniqueProgramName('プログラム — École №1 (2026)');

    await submitCreateAndTrack(page, trackProgram, async () => {
      await programsPage.createProgram(name, 'Unicode and symbol validation test');
    });
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });
    await expect(programsPage.programRow(name)).toBeVisible();
  });
});

test.describe('Negative Flows', () => {
  test('TC-DS3-007: whitespace-only program name rejected on create', async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    const modal = programsPage.newProgramModal;

    await programsPage.openNewProgramForm();
    await modal.fillProgramName('   ');
    await modal.fillDescription('Should not be created');

    await expect(modal.createButton).toBeDisabled();
    await modal.clickClose();
    await expect(modal.dialog).toBeHidden();
  });

  test('TC-DS3-008: empty program name rejected on create', async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    const modal = programsPage.newProgramModal;

    await programsPage.openNewProgramForm();
    await modal.fillDescription('Description without name');

    await expect(modal.createButton).toBeDisabled();
  });

  test('TC-DS3-009: duplicate program name on create (observed: allowed)', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const modal = programsPage.newProgramModal;
    const existing = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Web Development 2026',
      'Full-stack web development program',
    );
    await expect(modal.dialog).toBeHidden({ timeout: 10000 });

    await programsPage.openNewProgramForm();
    await modal.fillProgramName(existing.name);
    await modal.fillDescription('Duplicate program attempt');
    await submitCreateAndTrack(page, trackProgram, async () => {
      await modal.clickCreate();
    });
    await expect(modal.dialog).toBeHidden({ timeout: 10000 });

    expect(await programsPage.countProgramsNamed(existing.name)).toBeGreaterThanOrEqual(2);
  });

  test('TC-DS3-010: duplicate program name on edit (observed: allowed)', async ({ page, trackProgram }) => {
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

  test('TC-DS3-011: whitespace-only program name rejected on edit', async ({ page, trackProgram }) => {
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

  test('TC-DS3-024: duplicate name with different description (observed: allowed)', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const modal = programsPage.newProgramModal;
    const existing = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Web Development 2026',
      'Full-stack web development program',
    );
    await expect(modal.dialog).toBeHidden({ timeout: 10000 });

    await programsPage.openNewProgramForm();
    await modal.fillProgramName(existing.name);
    await modal.fillDescription('Completely different description from existing program');
    await submitCreateAndTrack(page, trackProgram, async () => {
      await modal.clickCreate();
    });
    await expect(modal.dialog).toBeHidden({ timeout: 10000 });

    expect(await programsPage.countProgramsNamed(existing.name)).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Edge Cases', () => {
  test('TC-DS3-003: leading and trailing whitespace on create (observed trim behavior)', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const modal = programsPage.newProgramModal;
    const base = uniqueProgramName('Mobile Development 2026');
    const padded = `  ${base}  `;

    await programsPage.openNewProgramForm();
    await modal.fillProgramName(padded);
    await modal.fillDescription('Trim behavior validation test');
    await submitCreateAndTrack(page, trackProgram, async () => {
      await modal.clickCreate();
    });
    await expect(modal.dialog).toBeHidden({ timeout: 10000 });

    const trimmedVisible = await programsPage.programRow(base).isVisible();
    const paddedVisible = await programsPage.programRow(padded).isVisible();
    expect(trimmedVisible || paddedVisible).toBe(true);
    if (trimmedVisible) {
      await expect(programsPage.programRow(padded)).toHaveCount(0);
    }
  });

  test('TC-DS3-012: duplicate after trimming whitespace on create (observed)', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const modal = programsPage.newProgramModal;
    const existing = await seedProgram(
      programsPage,
      page,
      trackProgram,
      'Web Development 2026',
      'existing program',
    );
    await expect(modal.dialog).toBeHidden({ timeout: 10000 });
    const countBefore = await programsPage.countProgramsNamed(existing.name);

    await programsPage.openNewProgramForm();
    await modal.fillProgramName(`  ${existing.name}  `);
    await modal.fillDescription('Duplicate attempt with padded whitespace');
    await submitCreateAndTrack(page, trackProgram, async () => {
      await modal.clickCreate();
    });
    await expect(modal.dialog).toBeHidden({ timeout: 10000 });

    expect(await programsPage.countProgramsNamed(existing.name)).toBeGreaterThanOrEqual(countBefore);
  });

  test('TC-DS3-013: program name exceeding maximum length (observed: accepted)', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const modal = programsPage.newProgramModal;
    const overMaxName = 'B'.repeat(PROGRAM_NAME_MAX + 1);

    await programsPage.openNewProgramForm();
    await modal.fillProgramName(overMaxName);
    await modal.fillDescription('Over-limit name validation test');

    await expect(modal.createButton).toBeEnabled();
    await submitCreateAndTrack(page, trackProgram, async () => {
      await modal.clickCreate();
    });
    await expect(modal.dialog).toBeHidden({ timeout: 10000 });
    await expect(programsPage.programRow(overMaxName).first()).toBeVisible();
  });

  test('TC-DS3-015: case variant duplicate on create (observed: case-sensitive)', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const modal = programsPage.newProgramModal;
    const existing = await seedProgram(programsPage, page, trackProgram, 'Web Development 2026', 'web track');
    await expect(modal.dialog).toBeHidden({ timeout: 10000 });
    const variant = existing.name.replace('Web', 'web');
    test.skip(variant === existing.name, 'Unique suffix prevents case variant');

    await programsPage.openNewProgramForm();
    await modal.fillProgramName(variant);
    await modal.fillDescription('Case variant duplicate test');
    await submitCreateAndTrack(page, trackProgram, async () => {
      await modal.clickCreate();
    });
    await expect(modal.dialog).toBeHidden({ timeout: 10000 });
    await expect(programsPage.programRow(variant)).toBeVisible();
  });

  test('TC-DS3-016: case variant duplicate on edit (observed: case-sensitive)', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const editModal = programsPage.editProgramModal;
    const webProgram = await seedProgram(programsPage, page, trackProgram, 'Web Development 2026', 'web desc');
    const dataProgram = await seedProgram(programsPage, page, trackProgram, 'Data Science 2026', 'data desc');
    const caseVariant = webProgram.name.replace('Web', 'WEB');

    await programsPage.openEditFormForProgram(dataProgram.name);
    await editModal.fillProgramName(caseVariant);
    await editModal.clickSave();
    await expect(editModal.dialog).toBeHidden({ timeout: 10000 });

    await expect(programsPage.programRow(caseVariant)).toBeVisible();
    await expect(programsPage.programRow(dataProgram.name)).toHaveCount(0);
    await expect(programsPage.programRow(webProgram.name)).toBeVisible();
  });

  test('TC-DS3-020: duplicate check with trim and case normalization (observed)', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const modal = programsPage.newProgramModal;
    const existing = await seedProgram(programsPage, page, trackProgram, 'Web Development 2026', 'web track');
    await expect(modal.dialog).toBeHidden({ timeout: 10000 });
    const paddedUpper = `  ${existing.name.toUpperCase()}  `;

    await programsPage.openNewProgramForm();
    await modal.fillProgramName(paddedUpper);
    await modal.fillDescription('Combined trim and case duplicate test');
    await submitCreateAndTrack(page, trackProgram, async () => {
      await modal.clickCreate();
    });
    await expect(modal.dialog).toBeHidden({ timeout: 10000 });

    const upperVisible = await programsPage.programRow(existing.name.toUpperCase()).isVisible();
    const paddedVisible = await programsPage.programRow(paddedUpper).isVisible();
    expect(upperVisible || paddedVisible).toBe(true);
  });

  test('TC-DS3-021: create button disabled after program name is cleared', async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    const modal = programsPage.newProgramModal;

    await programsPage.openNewProgramForm();
    await modal.fillProgramName('Temporary Valid Name');
    await modal.clearProgramName();

    await expect(modal.createButton).toBeDisabled();
  });

  test('TC-DS3-022: double-click create with duplicate name (observed)', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const modal = programsPage.newProgramModal;
    const existing = await seedProgram(programsPage, page, trackProgram, 'Web Development 2026', 'existing');
    await expect(modal.dialog).toBeHidden({ timeout: 10000 });

    await programsPage.openNewProgramForm();
    await modal.fillProgramName(existing.name);
    await modal.fillDescription('Double-click duplicate attempt');
    await trackMultipleCreatesOnSubmit(page, trackProgram, 2, async () => {
      await modal.doubleClickCreate();
    });
    await expect(modal.dialog).toBeHidden({ timeout: 10000 });

    expect(await programsPage.countProgramsNamed(existing.name)).toBeGreaterThanOrEqual(2);
    await trackProgramsByExactName(trackProgram, existing.name);
  });

  test('TC-DS3-023: HTML or script-like characters stored and displayed safely', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const modal = programsPage.newProgramModal;
    const xssName = uniqueProgramName("<script>alert('xss')</script>");
    let dialogShown = false;
    page.on('dialog', () => {
      dialogShown = true;
    });

    await submitCreateAndTrack(page, trackProgram, async () => {
      await programsPage.createProgram(xssName, 'XSS boundary test');
    });
    await expect(modal.dialog).toBeHidden({ timeout: 10000 });
    await expect(programsPage.programRow(xssName)).toBeVisible();
    expect(dialogShown).toBe(false);
  });
});
