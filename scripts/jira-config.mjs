/**
 * Shared Jira Cloud credentials for attachment scripts.
 * Supports ATLASSIAN_* (primary) and JIRA_* (skill doc) env var names.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

export const projectRoot = path.resolve(__dirname, '..');
export const testResultsDir = path.join(projectRoot, 'test-results');
export const testEvidenceDir = path.join(projectRoot, 'test-evidence');

export function getJiraAuthConfig() {
  const email = process.env.ATLASSIAN_EMAIL || process.env.JIRA_LOGIN_EMAIL;
  const token = process.env.ATLASSIAN_API_TOKEN || process.env.JIRA_API_TOKEN;
  const site = (process.env.JIRA_SITE || 'legionqaschool.atlassian.net').replace(/^https?:\/\//, '');
  const baseUrl =
    process.env.ATLASSIAN_BASE_URL?.replace(/\/$/, '') || `https://${site}`;

  if (!email || !token) {
    throw new Error(
      'Missing Jira credentials. Set ATLASSIAN_EMAIL + ATLASSIAN_API_TOKEN (or JIRA_LOGIN_EMAIL + JIRA_API_TOKEN) in .env',
    );
  }

  return { baseUrl, email, token, auth: Buffer.from(`${email}:${token}`).toString('base64') };
}
