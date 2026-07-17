import { expect, type TestInfo } from '@playwright/test';
import type { Result, AxeResults } from 'axe-core';

/**
 * Accessibility scan policy:
 * - Do not call `.disableRules()` to make tests pass when the app has real violations.
 * - When axe reports violations, attach evidence to the test report for bug-reporter triage.
 * - `.disableRules()` is only acceptable with an inline comment documenting a known false
 *   positive or an out-of-scope third-party widget — never to silence a product defect.
 *
 * Example (comment required on the same line or line above):
 *   .disableRules('color-contrast') // third-party chart library; not Didaxis-owned UI
 */

export function summarizeAxeViolations(violations: Result[]): string {
  if (violations.length === 0) {
    return 'No axe violations.';
  }

  return violations
    .map((violation) => {
      const targets = violation.nodes
        .map((node) => node.target.join(' > '))
        .slice(0, 5)
        .join('\n    ');
      const truncated =
        violation.nodes.length > 5 ? `\n    … and ${violation.nodes.length - 5} more node(s)` : '';

      return [
        `[${violation.impact ?? 'unknown'}] ${violation.id}`,
        `  ${violation.help}`,
        `  ${violation.helpUrl}`,
        `  nodes (${violation.nodes.length}):`,
        `    ${targets}${truncated}`,
      ].join('\n');
    })
    .join('\n\n');
}

export async function attachAxeViolations(
  testInfo: TestInfo,
  results: AxeResults,
  label = 'axe-scan',
): Promise<void> {
  if (results.violations.length === 0) {
    return;
  }

  await testInfo.attach(`${label}-violations.json`, {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });

  await testInfo.attach(`${label}-violations.txt`, {
    body: summarizeAxeViolations(results.violations),
    contentType: 'text/plain',
  });
}

export async function expectNoAxeViolations(
  results: AxeResults,
  testInfo: TestInfo,
  label = 'axe-scan',
): Promise<void> {
  await attachAxeViolations(testInfo, results, label);
  await expect(results.violations, summarizeAxeViolations(results.violations)).toEqual([]);
}
