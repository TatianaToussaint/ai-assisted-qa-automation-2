#!/usr/bin/env node
/**
 * GitHub-compatible entry point. Delegates to delete-all-didaxis-programs.mjs.
 * Dry run: node scripts/delete-all-programs.mjs
 * Delete:  node scripts/delete-all-programs.mjs --confirm
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2).map((arg) => (arg === '--confirm' ? '--yes' : arg));
const forwarded = args.length > 0 ? args : ['--dry-run'];

const result = spawnSync(process.execPath, [path.join(__dirname, 'delete-all-didaxis-programs.mjs'), ...forwarded], {
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
