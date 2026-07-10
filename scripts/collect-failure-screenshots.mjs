/**
 * Collect PNG screenshots from Playwright test-results/.
 *
 * Usage:
 *   node scripts/collect-failure-screenshots.mjs --latest
 *   node scripts/collect-failure-screenshots.mjs "duplicate-name"
 */
import fs from 'fs';
import path from 'path';
import { testResultsDir } from './jira-config.mjs';

function walkPngs(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkPngs(fullPath, files);
    } else if (entry.name.toLowerCase().endsWith('.png')) {
      files.push(fullPath);
    }
  }

  return files;
}

const args = process.argv.slice(2);
const latest = args.includes('--latest');
const filter = args.find((arg) => arg !== '--latest');

let pngs = walkPngs(testResultsDir);

if (filter) {
  pngs = pngs.filter((filePath) => filePath.includes(filter));
}

if (latest && pngs.length > 0) {
  pngs.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  const newestDir = path.dirname(pngs[0]);
  pngs = pngs.filter((filePath) => path.dirname(filePath) === newestDir);
}

if (pngs.length === 0) {
  console.error(`No PNG screenshots found under ${testResultsDir}`);
  process.exit(1);
}

for (const filePath of pngs) {
  console.log(filePath);
}
