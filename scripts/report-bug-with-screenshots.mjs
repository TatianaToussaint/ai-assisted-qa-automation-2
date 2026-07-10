/**
 * Re-run a failing Playwright test and attach screenshots to an existing Jira issue.
 *
 * Usage:
 *   node scripts/report-bug-with-screenshots.mjs DS-173 tests/ds2-edit-program.spec.ts "TC-DS2-010"
 */
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { projectRoot } from './jira-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const attachScript = path.join(__dirname, 'jira-attach-screenshots.mjs');
const collectScript = path.join(__dirname, 'collect-failure-screenshots.mjs');

const [issueKey, specFile, testGrep] = process.argv.slice(2);

if (!issueKey || !specFile || !testGrep) {
  console.error(
    'Usage: node scripts/report-bug-with-screenshots.mjs ISSUE-KEY spec-file.ts "test grep"',
  );
  process.exit(1);
}

const specPath = path.resolve(projectRoot, specFile);
const testCmd = `npx playwright test "${specPath}" -g "${testGrep}" --workers=1`;

console.log(`Running: ${testCmd}`);
let testFailed = false;

try {
  execSync(testCmd, { cwd: projectRoot, stdio: 'inherit' });
} catch {
  testFailed = true;
}

if (!testFailed) {
  console.error('Test passed — no failure screenshots to attach.');
  process.exit(1);
}

const screenshots = execSync(`node "${collectScript}" --latest`, { encoding: 'utf8' })
  .trim()
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.endsWith('.png'));

if (screenshots.length === 0) {
  console.error('Test failed but no PNG screenshots were found in test-results/.');
  process.exit(1);
}

execSync(`node "${attachScript}" ${issueKey} ${screenshots.map((p) => `"${p}"`).join(' ')}`, {
  cwd: projectRoot,
  stdio: 'inherit',
});

console.log(`Uploaded ${screenshots.length} screenshot(s) to ${issueKey}`);
