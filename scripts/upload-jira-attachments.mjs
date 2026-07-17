/**
 * Upload screenshot attachments to Jira issues.
 * Usage: node scripts/upload-jira-attachments.mjs DS-164 tests/smoke/evidence/ds2-duplicate-name-on-edit.png
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const [issueKey, ...filePaths] = process.argv.slice(2);
if (!issueKey || filePaths.length === 0) {
  console.error('Usage: node upload-jira-attachments.mjs ISSUE-KEY file1 [file2 ...]');
  process.exit(1);
}

const baseUrl = process.env.ATLASSIAN_BASE_URL?.replace(/\/$/, '');
const email = process.env.ATLASSIAN_EMAIL;
const token = process.env.ATLASSIAN_API_TOKEN;

if (!baseUrl || !email || !token) {
  console.error('Missing ATLASSIAN_BASE_URL, ATLASSIAN_EMAIL, or ATLASSIAN_API_TOKEN in .env');
  process.exit(1);
}

const auth = Buffer.from(`${email}:${token}`).toString('base64');

for (const filePath of filePaths) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`File not found: ${resolved}`);
    process.exit(1);
  }

  const fileName = path.basename(resolved);
  const fileBuffer = fs.readFileSync(resolved);
  const boundary = `----FormBoundary${Date.now()}`;
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\n`),
    Buffer.from(`Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`),
    Buffer.from('Content-Type: application/octet-stream\r\n\r\n'),
    fileBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const response = await fetch(`${baseUrl}/rest/api/3/issue/${issueKey}/attachments`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'X-Atlassian-Token': 'no-check',
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Failed to attach ${fileName} to ${issueKey}: ${response.status} ${text}`);
    process.exit(1);
  }

  const result = await response.json();
  console.log(`Attached ${fileName} to ${issueKey} (id: ${result[0]?.id})`);
}
