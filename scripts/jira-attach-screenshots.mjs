/**
 * Upload screenshot attachments to a Jira issue.
 *
 * Usage:
 *   node scripts/jira-attach-screenshots.mjs DS-173 path/to/test-failed-1.png
 *   node scripts/jira-attach-screenshots.mjs DS-173 $(node scripts/collect-failure-screenshots.mjs --latest)
 */
import fs from 'fs';
import path from 'path';
import { getJiraAuthConfig } from './jira-config.mjs';

const [issueKey, ...filePaths] = process.argv.slice(2);

if (!issueKey || filePaths.length === 0) {
  console.error('Usage: node scripts/jira-attach-screenshots.mjs ISSUE-KEY file1 [file2 ...]');
  process.exit(1);
}

const { baseUrl, auth } = getJiraAuthConfig();

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
