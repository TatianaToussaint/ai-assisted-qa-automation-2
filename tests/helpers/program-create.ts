import { expect, Page, Response } from '@playwright/test';
import { extractProgramUuid, TrackProgram } from '../../fixtures/cleanup.fixture';
import { programRow, uniqueProgramName } from './didaxis';

function isProgramCreateResponse(response: Response): boolean {
  return response.url().includes('/api/programs') && response.request().method() === 'POST';
}

export async function trackUuidFromResponse(
  response: Response,
  trackProgram: TrackProgram,
): Promise<string | undefined> {
  const uuid = extractProgramUuid(await response.json());
  if (uuid) {
    trackProgram(uuid);
  }
  return uuid;
}

export async function submitCreateAndTrack(
  page: Page,
  trackProgram: TrackProgram,
  submit: () => Promise<void>,
): Promise<void> {
  const responsePromise = page.waitForResponse(
    (response) => isProgramCreateResponse(response) && response.ok(),
  );
  await submit();
  await trackUuidFromResponse(await responsePromise, trackProgram);
}

export async function openNewProgramModal(page: Page) {
  await page.getByRole('button', { name: '+ New Program' }).click();
  const dialog = page.getByRole('dialog', { name: 'New Program' });
  await expect(dialog).toBeVisible();
  return dialog;
}

export async function seedProgram(
  page: Page,
  trackProgram: TrackProgram,
  baseName: string,
  description: string,
): Promise<{ name: string; description: string }> {
  const name = uniqueProgramName(baseName);
  await createProgram(page, trackProgram, name, description);
  return { name, description };
}

export async function createProgram(
  page: Page,
  trackProgram: TrackProgram,
  name: string,
  description: string,
): Promise<void> {
  const dialog = await openNewProgramModal(page);
  await dialog.getByLabel('Program Name').fill(name);
  if (description) {
    await dialog.getByLabel('Description').fill(description);
  }

  await submitCreateAndTrack(page, trackProgram, async () => {
    await dialog.getByRole('button', { name: 'Create' }).click();
  });

  await expect(dialog).toBeHidden({ timeout: 10000 });
  await expect(programRow(page, name)).toBeVisible();
}

export async function trackAllProgramCreates(
  page: Page,
  trackProgram: TrackProgram,
  action: () => Promise<void>,
): Promise<void> {
  const pending = new Set<Promise<void>>();

  const listener = (response: Response) => {
    if (!isProgramCreateResponse(response)) return;
    pending.add(
      (async () => {
        if (response.ok()) {
          await trackUuidFromResponse(response, trackProgram);
        }
      })(),
    );
  };

  page.on('response', listener);
  try {
    await action();
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => undefined);
    await Promise.all([...pending]);
  } finally {
    page.off('response', listener);
  }
}

export async function trackMultipleCreatesOnSubmit(
  page: Page,
  trackProgram: TrackProgram,
  expectedPosts: number,
  submit: () => Promise<void>,
): Promise<void> {
  const responsePromises = Array.from({ length: expectedPosts }, () =>
    page.waitForResponse((response) => isProgramCreateResponse(response) && response.ok()),
  );
  await submit();
  const responses = await Promise.all(responsePromises);
  for (const response of responses) {
    await trackUuidFromResponse(response, trackProgram);
  }
}
