import { expect, Page } from '@playwright/test';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function uniqueProgramName(base: string): string {
  return `${base} ${Date.now()}`;
}

/** Path to the auth file written by tests/auth.setup.ts (matches playwright.config.ts). */
export const authStorageState = 'playwright/.auth/user.json';

/** Clears inherited project storageState so a test starts logged out. */
export const emptyStorageState = { cookies: [] as [], origins: [] as [] };

export async function goToPrograms(page: Page): Promise<void> {
  await page.goto('/programs', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Programs', level: 2 })).toBeVisible();
}

export async function loginAsAdmin(page: Page): Promise<void> {
  const url = requireEnv('DIDAXIS_URL');
  const email = requireEnv('DIDAXIS_EMAIL');
  const password = requireEnv('DIDAXIS_PASSWORD');

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);

  const signIn = page.getByRole('button', { name: 'Sign In' });
  await signIn.waitFor({ state: 'visible' });
  await signIn.click();
  await page.waitForURL((current) => !current.pathname.includes('/login'), { timeout: 30000 });
}

export async function navigateToPrograms(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Programs' }).click();
  await expect(page.getByRole('heading', { name: 'Programs', level: 2 })).toBeVisible();
}

export function programRow(page: Page, programName: string) {
  return page.getByRole('row').filter({
    has: page.locator('td').first().getByText(programName, { exact: true }),
  });
}

/** Row action that opens the Edit Program modal. Accessible name: "Edit {programName}". */
export function editProgramButton(page: Page, programName: string) {
  return page.getByRole('button', { name: `Edit ${programName}` });
}

export async function openNewProgramForm(page: Page): Promise<void> {
  await page.getByRole('button', { name: '+ New Program' }).click();
  await expect(page.getByRole('dialog', { name: 'New Program' })).toBeVisible();
}

/** Clicks Edit {programName} and waits for the Edit Program modal. */
export async function openEditFormForProgram(page: Page, programName: string): Promise<void> {
  await editProgramButton(page, programName).click();
  await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeVisible();
}

export function editDialog(page: Page) {
  return page.getByRole('dialog', { name: 'Edit Program' });
}

export function newProgramDialog(page: Page) {
  return page.getByRole('dialog', { name: 'New Program' });
}

export function programNameField(page: Page, dialogName: 'Edit Program' | 'New Program' = 'Edit Program') {
  return page.getByRole('dialog', { name: dialogName }).getByRole('textbox', { name: 'Program Name' });
}

export function descriptionField(page: Page, dialogName: 'Edit Program' | 'New Program' = 'Edit Program') {
  return page.getByRole('dialog', { name: dialogName }).getByRole('textbox', { name: 'Description' });
}

export async function createProgram(
  page: Page,
  name: string,
  description: string,
): Promise<void> {
  await openNewProgramForm(page);
  await programNameField(page, 'New Program').fill(name);
  await descriptionField(page, 'New Program').fill(description);
  await page.getByRole('dialog', { name: 'New Program' }).getByRole('button', { name: 'Create' }).click();
  await expect(page.getByRole('dialog', { name: 'New Program' })).toBeHidden({ timeout: 10000 });
  await expect(programRow(page, name)).toBeVisible();
}

/** Row action icon button. Accessible name: "Delete {programName}". */
export function deleteProgramButton(page: Page, programName: string) {
  return page.getByRole('button', { name: `Delete ${programName}` });
}

export function createButton(page: Page) {
  return newProgramDialog(page).getByRole('button', { name: 'Create' });
}

/** Clicks Delete and accepts the native browser confirm dialog. */
export async function deleteProgram(page: Page, programName: string): Promise<void> {
  page.once('dialog', (dialog) => dialog.accept());
  await deleteProgramButton(page, programName).click();
  await expect(programRow(page, programName)).toHaveCount(0, { timeout: 10000 });
}

/** Clicks Delete and dismisses the native confirm. Returns the dialog message. */
export async function cancelDeleteProgram(page: Page, programName: string): Promise<string> {
  let message = '';
  page.once('dialog', (dialog) => {
    message = dialog.message();
    void dialog.dismiss();
  });
  await deleteProgramButton(page, programName).click();
  await expect(programRow(page, programName)).toBeVisible();
  return message;
}

/** Clicks Save and waits for the Edit Program modal to close (up to 10s). */
export async function saveEditForm(page: Page): Promise<void> {
  await editDialog(page).getByRole('button', { name: 'Save' }).click();
  await expect(editDialog(page)).toBeHidden({ timeout: 10000 });
}

/** Clicks Cancel and waits for the Edit Program modal to close. */
export async function cancelEditForm(page: Page): Promise<void> {
  await editDialog(page).getByRole('button', { name: 'Cancel' }).click();
  await expect(editDialog(page)).toBeHidden({ timeout: 10000 });
}

/** Clicks the X button in the dialog banner and waits for the modal to close. */
export async function closeEditFormViaX(page: Page): Promise<void> {
  await editDialog(page).getByRole('banner').getByRole('button').click();
  await expect(editDialog(page)).toBeHidden({ timeout: 10000 });
}

export function saveButton(page: Page) {
  return editDialog(page).getByRole('button', { name: 'Save' });
}

export function cancelButton(page: Page) {
  return editDialog(page).getByRole('button', { name: 'Cancel' });
}

/** Reads the second <p> in the program row. Returns '' when description was cleared on edit. */
export async function getProgramDescriptionInList(page: Page, programName: string): Promise<string> {
  const row = programRow(page, programName);
  const paragraphs = row.locator('p');
  if ((await paragraphs.count()) < 2) {
    return '';
  }
  return (await paragraphs.nth(1).textContent())?.trim() ?? '';
}

export async function countProgramsNamed(page: Page, programName: string): Promise<number> {
  return programRow(page, programName).count();
}

/** Creates a program via + New Program with a timestamp-suffixed name to avoid cross-run collisions. */
export async function seedProgram(
  page: Page,
  baseName: string,
  description: string,
): Promise<{ name: string; description: string }> {
  const name = uniqueProgramName(baseName);
  await createProgram(page, name, description);
  return { name, description };
}
