import { Page } from '@playwright/test';
import { TrackProgram } from '../../fixtures/cleanup.fixture';
import { ProgramsPage } from '../../pages/ProgramsPage';
import { submitCreateAndTrack } from './program-create';

export function uniqueProgramName(base: string): string {
  return `${base} ${Date.now()}`;
}

export async function seedProgram(
  programsPage: ProgramsPage,
  page: Page,
  trackProgram: TrackProgram,
  baseName: string,
  description: string,
): Promise<{ name: string; description: string }> {
  const name = uniqueProgramName(baseName);
  await submitCreateAndTrack(page, trackProgram, async () => {
    await programsPage.createProgram(name, description);
  });
  return { name, description };
}
