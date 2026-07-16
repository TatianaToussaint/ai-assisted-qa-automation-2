/**
 * DS-1: Create new academic program
 * Test plan: Test Cases/DS-1/DS-1_output.md
 */
import { test, expect, trackProgramsByExactName } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import {
  submitCreateAndTrack,
  trackMultipleCreatesOnSubmit,
} from './helpers/program-create';
import { uniqueProgramName } from './helpers/pom-programs';

const PROGRAM_NAME_MAX = 255;
const DESCRIPTION_MAX = 1000;

test.beforeEach(async ({ page }) => {
  const programsPage = new ProgramsPage(page);
  await programsPage.goto();
});

test.describe('Positive Flows', () => {
  test('TC-DS1-001: navigate to program creation form', async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    const modal = programsPage.newProgramModal;

    await programsPage.openNewProgramForm();

    await expect(modal.programNameField).toBeVisible();
    await expect(modal.descriptionField).toBeVisible();
    await expect(modal.createButton).toBeVisible();
    await expect(modal.cancelButton).toBeVisible();
  });

  test('TC-DS1-002: successfully create a program with name and description', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const programName = uniqueProgramName('Web Development 2026');
    const description = `Full-stack web development program ${Date.now()}`;

    await submitCreateAndTrack(page, trackProgram, async () => {
      await programsPage.createProgram(programName, description);
    });
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });
    await expect(programsPage.programRow(programName)).toBeVisible();
    await expect(programsPage.visibleText(description)).toBeVisible();
  });

  test('TC-DS1-003: create program with name only and empty description', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const programName = uniqueProgramName('Data Science Fundamentals');

    await submitCreateAndTrack(page, trackProgram, async () => {
      await programsPage.createProgram(programName, '');
    });
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });
    await expect(programsPage.programRow(programName)).toBeVisible();
  });

  test('TC-DS1-004: create program with special characters in name', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const programName = uniqueProgramName('Informatique & IA - Niveau 2');

    await submitCreateAndTrack(page, trackProgram, async () => {
      await programsPage.createProgram(
        programName,
        'Programme bilingue en informatique et intelligence artificielle',
      );
    });
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });
    await expect(programsPage.programRow(programName)).toBeVisible();
  });

  test('TC-DS1-005: program list refreshes after successful create', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const programName = uniqueProgramName('Cloud Engineering 2026');

    await submitCreateAndTrack(page, trackProgram, async () => {
      await programsPage.createProgram(programName, 'AWS and Azure cloud engineering track');
    });
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });
    await expect(programsPage.programRow(programName)).toBeVisible();
    await expect(page).toHaveURL(/\/programs/);
  });
});

test.describe('Negative Flows', () => {
  test('TC-DS1-006: create button disabled when program name is empty', async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    const modal = programsPage.newProgramModal;

    await programsPage.openNewProgramForm();
    await expect(modal.createButton).toBeDisabled();
  });

  test('TC-DS1-007: duplicate program name on create (observed: allowed)', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const modal = programsPage.newProgramModal;
    const programName = uniqueProgramName('Web Development 2026');

    await submitCreateAndTrack(page, trackProgram, async () => {
      await programsPage.createProgram(programName, 'Original program');
    });
    await expect(modal.dialog).toBeHidden({ timeout: 10000 });

    await programsPage.openNewProgramForm();
    await modal.fillProgramName(programName);
    await modal.fillDescription('Another description for duplicate test');
    await submitCreateAndTrack(page, trackProgram, async () => {
      await modal.clickCreate();
    });
    await expect(modal.dialog).toBeHidden({ timeout: 10000 });

    expect(await programsPage.countProgramsNamed(programName)).toBeGreaterThanOrEqual(2);
  });

  test('TC-DS1-008: non-admin user cannot access program creation', async () => {
    test.skip(true, 'Requires non-admin credentials (DIDAXIS_NON_ADMIN_EMAIL / DIDAXIS_NON_ADMIN_PASSWORD)');
  });

  test('TC-DS1-009: cancel creation discards unsaved data', async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    const modal = programsPage.newProgramModal;
    const programName = uniqueProgramName('Cancelled Program Test');

    await programsPage.openNewProgramForm();
    await modal.fillProgramName(programName);
    await modal.fillDescription('This should not be saved');
    await modal.clickCancel();

    await expect(modal.dialog).toBeHidden();
    await expect(programsPage.programRow(programName)).toHaveCount(0);
  });

  test('TC-DS1-009 (variant): close modal via X discards unsaved data', async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    const modal = programsPage.newProgramModal;
    const programName = uniqueProgramName('Cancelled Program Test');

    await programsPage.openNewProgramForm();
    await modal.fillProgramName(programName);
    await modal.fillDescription('This should not be saved');
    await modal.clickClose();

    await expect(modal.dialog).toBeHidden();
    await expect(programsPage.programRow(programName)).toHaveCount(0);
  });

  test('TC-DS1-010: create blocked when program name is cleared after initial entry', async ({
    page,
  }) => {
    const programsPage = new ProgramsPage(page);
    const modal = programsPage.newProgramModal;

    await programsPage.openNewProgramForm();
    await modal.fillProgramName('Temporary Name');
    await modal.clearProgramName();

    await expect(modal.createButton).toBeDisabled();
  });
});

test.describe('Edge Cases', () => {
  test('TC-DS1-011: whitespace-only program name treated as empty', async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    const modal = programsPage.newProgramModal;

    await programsPage.openNewProgramForm();
    await modal.fillProgramName('   ');
    await modal.fillDescription('Description with whitespace-only name test');

    await expect(modal.createButton).toBeDisabled();
  });

  test('TC-DS1-012: program name at maximum allowed length', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const suffix = String(Date.now()).slice(-10);
    const programName = `${'A'.repeat(PROGRAM_NAME_MAX - suffix.length - 1)} ${suffix}`;

    await submitCreateAndTrack(page, trackProgram, async () => {
      await programsPage.createProgram(programName, 'Boundary test for max-length program name');
    });
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });
    await expect(programsPage.programRow(programName)).toBeVisible();
  });

  test('TC-DS1-013: program name exceeding 255 characters is accepted on create', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const modal = programsPage.newProgramModal;
    const overMaxName = 'B'.repeat(PROGRAM_NAME_MAX + 1);

    await programsPage.openNewProgramForm();
    await modal.fillProgramName(overMaxName);
    await modal.fillDescription('Over-limit name test');

    await expect(modal.createButton).toBeEnabled();
    await submitCreateAndTrack(page, trackProgram, async () => {
      await modal.clickCreate();
    });
    await expect(modal.dialog).toBeHidden({ timeout: 10000 });
    await expect(programsPage.programRow(overMaxName).first()).toBeVisible();
  });

  test('TC-DS1-014: description at maximum allowed length', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const programName = uniqueProgramName('Long Description Boundary Test');
    const maxDescription = `D${Date.now()}${'D'.repeat(DESCRIPTION_MAX - 20)}`;

    await submitCreateAndTrack(page, trackProgram, async () => {
      await programsPage.createProgram(programName, maxDescription);
    });
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });
    await expect(programsPage.programRow(programName)).toBeVisible();
  });

  test('TC-DS1-015: leading and trailing whitespace on create (observed: not trimmed)', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const modal = programsPage.newProgramModal;
    const trimmedName = uniqueProgramName('Mobile Development 2026');
    const paddedName = `  ${trimmedName}  `;

    await programsPage.openNewProgramForm();
    await modal.fillProgramName(paddedName);
    await modal.fillDescription('Trim behavior test');
    await submitCreateAndTrack(page, trackProgram, async () => {
      await modal.clickCreate();
    });

    await expect(modal.dialog).toBeHidden({ timeout: 10000 });
    await expect(programsPage.programRow(paddedName)).toBeVisible();
  });

  test('TC-DS1-016: unicode and extended special characters in program name', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const programName = uniqueProgramName('プログラム — École №1 (2026)');

    await submitCreateAndTrack(page, trackProgram, async () => {
      await programsPage.createProgram(programName, 'Unicode and symbol boundary test');
    });
    await expect(programsPage.newProgramModal.dialog).toBeHidden({ timeout: 10000 });
    await expect(programsPage.programRow(programName)).toBeVisible();
  });

  test('TC-DS1-017: double-click create may create duplicate programs (observed)', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const modal = programsPage.newProgramModal;
    const programName = uniqueProgramName('Cybersecurity 2026');

    await programsPage.openNewProgramForm();
    await modal.fillProgramName(programName);
    await modal.fillDescription('Security fundamentals program');
    await trackMultipleCreatesOnSubmit(page, trackProgram, 2, async () => {
      await modal.doubleClickCreate();
    });

    await expect(modal.dialog).toBeHidden({ timeout: 10000 });
    expect(await programsPage.countProgramsNamed(programName)).toBeGreaterThanOrEqual(2);
    await trackProgramsByExactName(trackProgram, programName);
  });

  test('TC-DS1-018: create first program when list is empty', async () => {
    test.skip(true, 'Requires empty program list precondition');
  });
});
