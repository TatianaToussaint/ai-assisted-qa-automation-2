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

export function editProgramButton(page: Page, programName: string) {
  return page.getByRole('button', { name: `Edit ${programName}` });
}

export async function openNewProgramForm(page: Page): Promise<void> {
  await page.getByRole('button', { name: '+ New Program' }).click();
  await expect(page.getByRole('dialog', { name: 'New Program' })).toBeVisible();
}

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

export async function deleteProgram(page: Page, programName: string): Promise<void> {
  await page.getByRole('button', { name: `Delete ${programName}` }).click();
  const confirmDialog = page.getByRole('dialog').last();
  await expect(confirmDialog).toBeVisible({ timeout: 5000 });
  await confirmDialog.getByRole('button', { name: /delete/i }).click();
  await expect(programRow(page, programName)).toBeHidden({ timeout: 10000 });
}

export async function saveEditForm(page: Page): Promise<void> {
  await editDialog(page).getByRole('button', { name: 'Save' }).click();
  await expect(editDialog(page)).toBeHidden({ timeout: 10000 });
}

export async function cancelEditForm(page: Page): Promise<void> {
  await editDialog(page).getByRole('button', { name: 'Cancel' }).click();
  await expect(editDialog(page)).toBeHidden({ timeout: 10000 });
}

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

export async function seedProgram(
  page: Page,
  baseName: string,
  description: string,
): Promise<{ name: string; description: string }> {
  const name = uniqueProgramName(baseName);
  await createProgram(page, name, description);
  return { name, description };
}
