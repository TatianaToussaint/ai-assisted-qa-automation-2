/**
 * Delete all Didaxis programs via REST API.
 *
 * Usage:
 *   node scripts/delete-all-didaxis-programs.mjs --dry-run
 *   node scripts/delete-all-didaxis-programs.mjs --yes
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function apiBaseUrl() {
  return requireEnv('DIDAXIS_URL').replace(/\/$/, '');
}

function extractToken(payload) {
  if (!payload || typeof payload !== 'object') return undefined;
  const data = payload.data;
  return (
    payload.token ||
    payload.accessToken ||
    payload.access_token ||
    data?.token ||
    data?.accessToken ||
    data?.access_token
  );
}

async function getAuthToken() {
  const envToken = process.env.DIDAXIS_API_TOKEN?.trim();
  if (envToken) return envToken;

  const response = await fetch(`${apiBaseUrl()}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: requireEnv('DIDAXIS_EMAIL'),
      password: requireEnv('DIDAXIS_PASSWORD'),
    }),
  });

  if (!response.ok) {
    throw new Error(`API login failed with status ${response.status}`);
  }

  const token = extractToken(await response.json());
  if (!token) {
    throw new Error('API login succeeded but no bearer token was found in the response');
  }
  return token;
}

async function fetchAllPrograms(token) {
  const response = await fetch(`${apiBaseUrl()}/api/programs`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`GET /api/programs failed with status ${response.status}`);
  }

  const payload = await response.json();
  const items = payload.data ?? payload;
  if (!Array.isArray(items)) {
    throw new Error('GET /api/programs returned an unexpected payload');
  }

  return items.map((item) => ({
    id: item.id,
    name: item.name ?? '(unnamed)',
  }));
}

async function deleteProgram(token, uuid) {
  const response = await fetch(`${apiBaseUrl()}/api/programs/${uuid}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.ok || response.status === 404) {
    return { uuid, status: response.status, ok: true };
  }

  return { uuid, status: response.status, ok: false };
}

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run'),
    yes: argv.includes('--yes'),
  };
}

async function main() {
  const { dryRun, yes } = parseArgs(process.argv.slice(2));

  if (!dryRun && !yes) {
    console.error(
      'Refusing to delete programs without confirmation.\n' +
        '  Preview: node scripts/delete-all-didaxis-programs.mjs --dry-run\n' +
        '  Delete:  node scripts/delete-all-didaxis-programs.mjs --yes',
    );
    process.exit(1);
  }

  const token = await getAuthToken();
  const programs = await fetchAllPrograms(token);

  console.log(`Target: ${apiBaseUrl()}`);
  console.log(`Programs found: ${programs.length}`);

  if (programs.length === 0) {
    console.log('Nothing to delete.');
    return;
  }

  if (dryRun) {
    console.log('\nDry run — programs that would be deleted:');
    for (const program of programs) {
      console.log(`  ${program.id}  ${program.name}`);
    }
    return;
  }

  let deleted = 0;
  let failed = 0;

  for (const program of programs) {
    const result = await deleteProgram(token, program.id);
    if (result.ok) {
      deleted += 1;
      console.log(`Deleted ${program.id} (${program.name}) -> ${result.status}`);
    } else {
      failed += 1;
      console.error(`Failed ${program.id} (${program.name}) -> ${result.status}`);
    }
  }

  const remaining = await fetchAllPrograms(token);
  console.log(`\nDone. Deleted: ${deleted}, Failed: ${failed}, Remaining: ${remaining.length}`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
