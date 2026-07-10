/**
 * Smoke-test @playwright/mcp browser launch (same env as .cursor/mcp.json).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

process.env.PLAYWRIGHT_BROWSERS_PATH = '0';

const require = createRequire(import.meta.url);
const playwrightPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../node_modules/@playwright/mcp/node_modules/playwright',
);
const { chromium } = require(playwrightPath);

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.goto('https://test.didaxis.studio/login', { waitUntil: 'domcontentloaded' });
const title = await page.title();
await browser.close();

console.log(JSON.stringify({ ok: true, title, browsersPath: process.env.PLAYWRIGHT_BROWSERS_PATH }));
