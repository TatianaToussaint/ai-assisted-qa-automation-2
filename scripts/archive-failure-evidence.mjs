/**
 * Archive latest failure screenshots under test-evidence/<story-key>/.
 *
 * Usage:
 *   node scripts/archive-failure-evidence.mjs DS-2 --latest
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { testEvidenceDir } from './jira-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const collectScript = path.join(__dirname, 'collect-failure-screenshots.mjs');

const args = process.argv.slice(2);
const storyKey = args.find((arg) => /^DS-\d+$/i.test(arg));
const latest = args.includes('--latest');

if (!storyKey) {
  console.error('Usage: node scripts/archive-failure-evidence.mjs DS-N [--latest]');
  process.exit(1);
}

const collectArgs = latest ? '--latest' : '';
let output = '';

try {
  output = execSync(`node "${collectScript}" ${collectArgs}`, { encoding: 'utf8' }).trim();
} catch {
  console.error('No screenshots to archive.');
  process.exit(1);
}

const sourcePaths = output
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.endsWith('.png') && fs.existsSync(line));

if (sourcePaths.length === 0) {
  console.error('No valid PNG paths to archive.');
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const destDir = path.join(testEvidenceDir, storyKey.toUpperCase(), stamp);
fs.mkdirSync(destDir, { recursive: true });

for (const sourcePath of sourcePaths) {
  const destPath = path.join(destDir, path.basename(sourcePath));
  fs.copyFileSync(sourcePath, destPath);
  console.log(`Archived ${sourcePath} -> ${destPath}`);
}

console.log(destDir);
