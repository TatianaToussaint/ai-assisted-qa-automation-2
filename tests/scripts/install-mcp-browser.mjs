/**
 * Install Playwright browsers for @playwright/mcp (hermetic path in node_modules).
 * Run: npm run mcp:install-browser
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cli = path.resolve(
  __dirname,
  '../node_modules/@playwright/mcp/node_modules/playwright/cli.js',
);

process.env.PLAYWRIGHT_BROWSERS_PATH = '0';

const result = spawnSync(
  process.execPath,
  [cli, 'install', 'chrome', 'chromium', 'chromium-headless-shell'],
  { stdio: 'inherit', env: process.env },
);

process.exit(result.status ?? 1);
