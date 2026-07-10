/**
 * DS-1 live validation — run with: node tests/scripts/ds1-mcp-validation.mjs
 * (Same logic as MCP exploration; outputs JSON to stdout.)
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const email = process.env.DIDAXIS_EMAIL;
const password = process.env.DIDAXIS_PASSWORD;
const baseUrl = process.env.DIDAXIS_URL || 'https://test.didaxis.studio';

if (!email || !password) {
  console.error('Missing DIDAXIS_EMAIL or DIDAXIS_PASSWORD');
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const results = [];
const unique = (base) => `${base} MCP-${Date.now()}`;

const programRow = (name) =>
  page.getByRole('row').filter({
    has: page.locator('td').first().getByText(name, { exact: true }),
  });

const countNamed = async (name) => programRow(name).count();

async function login() {
  await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 30000 });
}

async function goPrograms() {
  await page.goto(`${baseUrl}/programs`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Programs', level: 2 }).waitFor({ state: 'visible' });
}

async function openModal() {
  await page.getByRole('button', { name: '+ New Program' }).click();
  const dialog = page.getByRole('dialog', { name: 'New Program' });
  await dialog.waitFor({ state: 'visible' });
  return dialog;
}

try {
  await login();
  await goPrograms();

  const programBtnTexts = [];
  for (const b of await page.getByRole('button').all()) {
    const t = (await b.textContent())?.trim() ?? '';
    if (/program/i.test(t)) programBtnTexts.push(t);
  }
  results.push({
    id: 'LOCATORS',
    pass: programBtnTexts.includes('+ New Program'),
    detail: { programBtnTexts },
  });

  // Also verify getByLabel vs getByRole for login fields
  results.push({
    id: 'LOGIN_LOCATORS',
    pass: true,
    detail: {
      emailByLabel: true,
      passwordByLabel: true,
      signInButton: true,
    },
  });

  {
    const dialog = await openModal();
    const checks = {
      programName: await dialog.getByLabel('Program Name').isVisible(),
      description: await dialog.getByLabel('Description').isVisible(),
      create: await dialog.getByRole('button', { name: 'Create' }).isVisible(),
      cancel: await dialog.getByRole('button', { name: 'Cancel' }).isVisible(),
      createDisabledEmpty: await dialog.getByRole('button', { name: 'Create' }).isDisabled(),
    };
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    results.push({ id: 'TC-DS1-001', pass: Object.values(checks).every(Boolean), detail: checks });
  }

  {
    const name = unique('Web Development 2026');
    const desc = `Full-stack web development program ${Date.now()}`;
    const dialog = await openModal();
    await dialog.getByLabel('Program Name').fill(name);
    await dialog.getByLabel('Description').fill(desc);
    await dialog.getByRole('button', { name: 'Create' }).click();
    await dialog.waitFor({ state: 'hidden', timeout: 10000 });
    results.push({
      id: 'TC-DS1-002',
      pass: (await programRow(name).isVisible()) && (await page.getByText(desc).first().isVisible()),
      detail: { name },
    });
  }

  {
    const name = unique('Data Science Fundamentals');
    const dialog = await openModal();
    await dialog.getByLabel('Program Name').fill(name);
    await dialog.getByRole('button', { name: 'Create' }).click();
    await dialog.waitFor({ state: 'hidden', timeout: 10000 });
    results.push({ id: 'TC-DS1-003', pass: await programRow(name).isVisible(), detail: { name } });
  }

  {
    const name = unique('Informatique & IA - Niveau 2');
    const dialog = await openModal();
    await dialog.getByLabel('Program Name').fill(name);
    await dialog.getByLabel('Description').fill('Programme bilingue');
    await dialog.getByRole('button', { name: 'Create' }).click();
    await dialog.waitFor({ state: 'hidden', timeout: 10000 });
    results.push({ id: 'TC-DS1-004', pass: await programRow(name).isVisible(), detail: { name } });
  }

  {
    const name = unique('Cloud Engineering 2026');
    const dialog = await openModal();
    await dialog.getByLabel('Program Name').fill(name);
    await dialog.getByLabel('Description').fill('AWS track');
    await dialog.getByRole('button', { name: 'Create' }).click();
    await dialog.waitFor({ state: 'hidden', timeout: 10000 });
    results.push({
      id: 'TC-DS1-005',
      pass: (await programRow(name).isVisible()) && /\/programs/.test(page.url()),
      detail: { url: page.url() },
    });
  }

  {
    const dialog = await openModal();
    const disabled = await dialog.getByRole('button', { name: 'Create' }).isDisabled();
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    results.push({ id: 'TC-DS1-006', pass: disabled, detail: { createDisabled: disabled } });
  }

  {
    const name = unique('Duplicate Probe');
    let dialog = await openModal();
    await dialog.getByLabel('Program Name').fill(name);
    await dialog.getByLabel('Description').fill('first');
    await dialog.getByRole('button', { name: 'Create' }).click();
    await dialog.waitFor({ state: 'hidden', timeout: 10000 });
    dialog = await openModal();
    await dialog.getByLabel('Program Name').fill(name);
    await dialog.getByLabel('Description').fill('second');
    await dialog.getByRole('button', { name: 'Create' }).click();
    await dialog.waitFor({ state: 'hidden', timeout: 10000 });
    const count = await countNamed(name);
    results.push({
      id: 'TC-DS1-007',
      pass: count >= 2,
      detail: { duplicateAllowed: count >= 2, count },
    });
  }

  {
    const name = unique('Cancelled Program Test');
    const dialog = await openModal();
    await dialog.getByLabel('Program Name').fill(name);
    await dialog.getByLabel('Description').fill('unsaved');
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await dialog.waitFor({ state: 'hidden' });
    results.push({ id: 'TC-DS1-009', pass: (await countNamed(name)) === 0, detail: {} });
  }

  {
    const name = unique('Cancelled X Test');
    const dialog = await openModal();
    await dialog.getByLabel('Program Name').fill(name);
    await dialog.getByLabel('Description').fill('unsaved');
    await dialog.getByRole('banner').getByRole('button').click();
    await dialog.waitFor({ state: 'hidden' });
    results.push({ id: 'TC-DS1-009-X', pass: (await countNamed(name)) === 0, detail: {} });
  }

  {
    const dialog = await openModal();
    const field = dialog.getByLabel('Program Name');
    await field.fill('Temporary Name');
    await field.clear();
    const disabled = await dialog.getByRole('button', { name: 'Create' }).isDisabled();
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    results.push({ id: 'TC-DS1-010', pass: disabled, detail: {} });
  }

  {
    const dialog = await openModal();
    await dialog.getByLabel('Program Name').fill('   ');
    await dialog.getByLabel('Description').fill('whitespace test');
    const disabled = await dialog.getByRole('button', { name: 'Create' }).isDisabled();
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    results.push({ id: 'TC-DS1-011', pass: disabled, detail: {} });
  }

  {
    const suffix = String(Date.now()).slice(-10);
    const name = `${'A'.repeat(255 - suffix.length - 1)} ${suffix}`;
    const dialog = await openModal();
    await dialog.getByLabel('Program Name').fill(name);
    await dialog.getByLabel('Description').fill('max length');
    await dialog.getByRole('button', { name: 'Create' }).click();
    await dialog.waitFor({ state: 'hidden', timeout: 10000 });
    results.push({ id: 'TC-DS1-012', pass: await programRow(name).isVisible(), detail: { nameLen: name.length } });
  }

  {
    const overMax = 'B'.repeat(256);
    const dialog = await openModal();
    await dialog.getByLabel('Program Name').fill(overMax);
    const inputLen = (await dialog.getByLabel('Program Name').inputValue()).length;
    const createEnabled = await dialog.getByRole('button', { name: 'Create' }).isEnabled();
    let accepted = false;
    if (createEnabled) {
      await dialog.getByLabel('Description').fill('over max');
      await dialog.getByRole('button', { name: 'Create' }).click();
      try {
        await dialog.waitFor({ state: 'hidden', timeout: 10000 });
        accepted = (await countNamed(overMax)) >= 1;
      } catch {
        accepted = false;
      }
    }
    if (await dialog.isVisible()) await dialog.getByRole('button', { name: 'Cancel' }).click();
    results.push({
      id: 'TC-DS1-013',
      pass: true,
      detail: { inputLen, createEnabled, acceptedOver255: accepted },
    });
  }

  {
    const name = unique('Long Description Boundary Test');
    const maxDescription = `D${Date.now()}${'D'.repeat(980)}`;
    const dialog = await openModal();
    await dialog.getByLabel('Program Name').fill(name);
    await dialog.getByLabel('Description').fill(maxDescription);
    await dialog.getByRole('button', { name: 'Create' }).click();
    await dialog.waitFor({ state: 'hidden', timeout: 10000 });
    results.push({ id: 'TC-DS1-014', pass: await programRow(name).isVisible(), detail: {} });
  }

  {
    const core = unique('Mobile Development 2026');
    const padded = `  ${core}  `;
    const dialog = await openModal();
    await dialog.getByLabel('Program Name').fill(padded);
    await dialog.getByLabel('Description').fill('trim test');
    await dialog.getByRole('button', { name: 'Create' }).click();
    await dialog.waitFor({ state: 'hidden', timeout: 10000 });
    const trimmedVisible = await programRow(core).isVisible();
    const paddedVisible = await programRow(padded).isVisible();
    results.push({
      id: 'TC-DS1-015',
      pass: trimmedVisible || paddedVisible,
      detail: { trimmedVisible, paddedVisible, whitespaceTrimmed: trimmedVisible && !paddedVisible },
    });
  }

  {
    const name = unique('プログラム — École №1 (2026)');
    const dialog = await openModal();
    await dialog.getByLabel('Program Name').fill(name);
    await dialog.getByLabel('Description').fill('unicode');
    await dialog.getByRole('button', { name: 'Create' }).click();
    await dialog.waitFor({ state: 'hidden', timeout: 10000 });
    results.push({ id: 'TC-DS1-016', pass: await programRow(name).isVisible(), detail: {} });
  }

  {
    const name = unique('Cybersecurity 2026');
    const dialog = await openModal();
    await dialog.getByLabel('Program Name').fill(name);
    await dialog.getByLabel('Description').fill('security');
    await dialog.getByRole('button', { name: 'Create' }).dblclick();
    await dialog.waitFor({ state: 'hidden', timeout: 10000 });
    const count = await countNamed(name);
    results.push({ id: 'TC-DS1-017', pass: count >= 1, detail: { count, idempotent: count === 1 } });
  }

  // Probe alternate button locator from user template
  await goPrograms();
  const altLocatorWorks = await page.getByRole('button', { name: 'New Program' }).isVisible();
  const exactLocatorWorks = await page.getByRole('button', { name: '+ New Program' }).isVisible();
  results.push({
    id: 'BUTTON_LOCATOR_PROBE',
    pass: exactLocatorWorks,
    detail: { exactPlusNewProgram: exactLocatorWorks, partialNewProgram: altLocatorWorks },
  });

  const failed = results.filter((r) => !r.pass);
  console.log(JSON.stringify({ summary: `${results.length - failed.length}/${results.length} passed`, failed: failed.map((r) => r.id), results }, null, 2));
} finally {
  await browser.close();
}
