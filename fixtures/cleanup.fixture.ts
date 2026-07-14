import { test as base, expect } from '@playwright/test';

export type TrackProgram = (uuid: string) => void;

let cachedAuthToken: string | null = null;

function apiBaseUrl(): string {
  const url = process.env.DIDAXIS_URL;
  if (!url) {
    throw new Error('Missing required environment variable: DIDAXIS_URL');
  }
  return url.replace(/\/$/, '');
}

function extractToken(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const root = payload as Record<string, unknown>;
  const data = root.data;
  const candidates = [
    root.token,
    root.accessToken,
    root.access_token,
    typeof data === 'object' && data !== null ? (data as Record<string, unknown>).token : undefined,
    typeof data === 'object' && data !== null ? (data as Record<string, unknown>).accessToken : undefined,
    typeof data === 'object' && data !== null ? (data as Record<string, unknown>).access_token : undefined,
  ];
  return candidates.find((value): value is string => typeof value === 'string' && value.length > 0);
}

async function getAuthToken(): Promise<string> {
  const envToken = process.env.DIDAXIS_API_TOKEN?.trim();
  if (envToken) {
    return envToken;
  }

  if (cachedAuthToken) {
    return cachedAuthToken;
  }

  const email = process.env.DIDAXIS_EMAIL;
  const password = process.env.DIDAXIS_PASSWORD;
  if (!email || !password) {
    throw new Error('Missing DIDAXIS_EMAIL or DIDAXIS_PASSWORD for API cleanup login');
  }

  const response = await fetch(`${apiBaseUrl()}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(`API login failed with status ${response.status}`);
  }

  const payload = await response.json();
  const token = extractToken(payload);
  if (!token) {
    throw new Error('API login succeeded but no bearer token was found in the response');
  }

  cachedAuthToken = token;
  return token;
}

export async function fetchProgramsFromApi(): Promise<Array<{ id: string; name: string }>> {
  const token = await getAuthToken();
  const response = await fetch(`${apiBaseUrl()}/api/programs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`GET /api/programs failed with status ${response.status}`);
  }
  const payload = await response.json();
  const items = (payload as { data?: Array<{ id: string; name: string }> }).data ?? payload;
  return Array.isArray(items) ? items : [];
}

/** Track every program UUID returned by the API for an exact name (handles duplicate rows / single POST). */
export async function trackProgramsByExactName(
  trackProgram: TrackProgram,
  programName: string,
): Promise<void> {
  const programs = await fetchProgramsFromApi();
  for (const program of programs.filter((item) => item.name === programName)) {
    trackProgram(program.id);
  }
}

export async function deleteProgramByUuid(uuid: string): Promise<void> {
  const token = await getAuthToken();
  const response = await fetch(`${apiBaseUrl()}/api/programs/${uuid}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (process.env.CLEANUP_DEBUG) {
    console.log(`[cleanup] DELETE /api/programs/${uuid} -> ${response.status}`);
  }

  if (!response.ok && response.status !== 404) {
    throw new Error(`DELETE /api/programs/${uuid} failed with status ${response.status}`);
  }
}

export function extractProgramUuid(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const root = body as Record<string, unknown>;
  const data = root.data;
  if (typeof data === 'object' && data !== null) {
    const id = (data as Record<string, unknown>).id;
    if (typeof id === 'string' && id.length > 0) return id;
  }
  const id = root.id;
  return typeof id === 'string' && id.length > 0 ? id : undefined;
}

export const test = base.extend<{ trackProgram: TrackProgram }>({
  trackProgram: async ({}, use) => {
    const uuids: string[] = [];

    const trackProgram: TrackProgram = (uuid: string) => {
      if (uuid && !uuids.includes(uuid)) {
        uuids.push(uuid);
        if (process.env.CLEANUP_DEBUG) {
          console.log(`[cleanup] trackProgram ${uuid}`);
        }
      }
    };

    await use(trackProgram);

    if (process.env.CLEANUP_DEBUG) {
      console.log(`[cleanup] teardown ${uuids.length} program(s)`);
    }

    for (const uuid of [...uuids].reverse()) {
      try {
        await deleteProgramByUuid(uuid);
      } catch (error) {
        console.warn(`Cleanup failed for program ${uuid}:`, error);
      }
    }
  },
});

export { expect };
