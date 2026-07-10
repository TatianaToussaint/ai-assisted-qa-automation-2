import { test, expect, Page } from '@playwright/test';

const TODO_URL = 'https://demo.playwright.dev/todomvc/#/';

async function openEmptyTodoPage(page: Page): Promise<void> {
  await page.goto(TODO_URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

async function addTodo(page: Page, text: string): Promise<void> {
  const input = page.getByPlaceholder('What needs to be done?');
  await input.fill(text);
  await input.press('Enter');
}

function todoListItems(page: Page) {
  return page.getByRole('list').first().getByRole('listitem');
}

function todoItem(page: Page, label: string) {
  return todoListItems(page).filter({ hasText: label });
}

function todoCheckbox(page: Page, label: string, index = 0) {
  return todoItem(page, label).nth(index).getByRole('checkbox', { name: 'Toggle Todo' });
}

async function completeTodo(page: Page, label: string, index = 0): Promise<void> {
  await todoCheckbox(page, label, index).check();
}

async function deleteTodo(page: Page, label: string, index = 0): Promise<void> {
  const item = todoItem(page, label).nth(index);
  await item.hover();
  await item.getByRole('button', { name: 'Delete' }).click();
}

test.describe('Positive Flows', () => {
  test.beforeEach(async ({ page }) => {
    await openEmptyTodoPage(page);
  });

  test('TC-001: new todo appears in the list after submission', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');

    await input.fill('Buy groceries');
    await input.press('Enter');

    await expect(page.getByText('Buy groceries')).toBeVisible();
    await expect(page.getByText('1 item left')).toBeVisible();
    await expect(input).toHaveValue('');
  });

  test('TC-002: multiple todos can be added sequentially', async ({ page }) => {
    await addTodo(page, 'Walk the dog');
    await addTodo(page, 'Pay electric bill');
    await addTodo(page, 'Call dentist');

    const items = todoListItems(page);
    await expect(items).toHaveCount(3);
    await expect(items.nth(0)).toContainText('Walk the dog');
    await expect(items.nth(1)).toContainText('Pay electric bill');
    await expect(items.nth(2)).toContainText('Call dentist');
    await expect(page.getByText('3 items left')).toBeVisible();

    await expect(todoCheckbox(page, 'Walk the dog')).not.toBeChecked();
    await expect(todoCheckbox(page, 'Pay electric bill')).not.toBeChecked();
    await expect(todoCheckbox(page, 'Call dentist')).not.toBeChecked();
  });

  test('TC-003: todo is marked completed when toggle is checked', async ({ page }) => {
    await addTodo(page, 'Write test plan');

    await completeTodo(page, 'Write test plan');

    const item = todoItem(page, 'Write test plan');
    await expect(todoCheckbox(page, 'Write test plan')).toBeChecked();
    await expect(item).toHaveClass(/completed/);
    await expect(page.getByText('0 items left')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear completed' })).toBeVisible();
  });

  test('TC-004: completed todo can be toggled back to active', async ({ page }) => {
    await addTodo(page, 'Review pull request');
    await completeTodo(page, 'Review pull request');

    await todoCheckbox(page, 'Review pull request').uncheck();

    const item = todoItem(page, 'Review pull request');
    await expect(todoCheckbox(page, 'Review pull request')).not.toBeChecked();
    await expect(item).not.toHaveClass(/completed/);
    await expect(page.getByText('1 item left')).toBeVisible();
  });

  test('TC-005: todo is removed from the list when delete control is used', async ({ page }) => {
    await addTodo(page, 'Schedule team meeting');
    await addTodo(page, 'Send status update');

    await deleteTodo(page, 'Schedule team meeting');

    await expect(page.getByText('Schedule team meeting')).not.toBeVisible();
    await expect(page.getByText('Send status update')).toBeVisible();
    await expect(page.getByText('1 item left')).toBeVisible();
  });

  test('TC-006: completed todo can be deleted', async ({ page }) => {
    await addTodo(page, 'Archive old emails');
    await completeTodo(page, 'Archive old emails');

    await deleteTodo(page, 'Archive old emails');

    await expect(page.getByText('Archive old emails')).not.toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Toggle Todo' })).toHaveCount(0);
    await expect(page.getByText(/items left/)).not.toBeVisible();
  });

  test('TC-007: Clear completed removes all completed items at once', async ({ page }) => {
    await addTodo(page, 'Buy milk');
    await addTodo(page, 'Read documentation');
    await addTodo(page, 'Update changelog');

    await completeTodo(page, 'Read documentation');
    await completeTodo(page, 'Update changelog');

    await page.getByRole('button', { name: 'Clear completed' }).click();

    await expect(page.getByText('Read documentation')).not.toBeVisible();
    await expect(page.getByText('Update changelog')).not.toBeVisible();
    await expect(page.getByText('Buy milk')).toBeVisible();
    await expect(page.getByText('1 item left')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear completed' })).not.toBeVisible();
  });
});

test.describe('Negative Flows', () => {
  test.beforeEach(async ({ page }) => {
    await openEmptyTodoPage(page);
  });

  test('TC-008: empty submission does not create a todo', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');

    await input.focus();
    await input.press('Enter');

    await expect(page.getByRole('checkbox', { name: 'Toggle Todo' })).toHaveCount(0);
    await expect(page.getByText(/items left/)).not.toBeVisible();
  });

  test('TC-009: whitespace-only input does not create a todo', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');

    await input.fill('   ');
    await input.press('Enter');

    await expect(page.getByRole('checkbox', { name: 'Toggle Todo' })).toHaveCount(0);
    await expect(todoListItems(page)).toHaveCount(0);
  });

  test('TC-010: delete control on one item does not remove other items', async ({ page }) => {
    await addTodo(page, 'Item A');
    await addTodo(page, 'Item B');
    await addTodo(page, 'Item C');

    await deleteTodo(page, 'Item B');

    await expect(page.getByText('Item A')).toBeVisible();
    await expect(page.getByText('Item B')).not.toBeVisible();
    await expect(page.getByText('Item C')).toBeVisible();
    await expect(page.getByText('2 items left')).toBeVisible();
  });

  test('TC-011: toggling complete on a deleted item has no effect', async ({ page }) => {
    await addTodo(page, 'Temporary task');
    await deleteTodo(page, 'Temporary task');

    await expect(page.getByText('Temporary task')).not.toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Toggle Todo' })).toHaveCount(0);
    await expect(page.getByText(/items left/)).not.toBeVisible();
  });

  test('TC-012: Active filter hides completed items without deleting them', async ({ page }) => {
    await addTodo(page, 'Active task');
    await addTodo(page, 'Done task');
    await completeTodo(page, 'Done task');

    await page.getByRole('link', { name: 'Active' }).click();

    await expect(page.getByText('Active task')).toBeVisible();
    await expect(page.getByText('Done task')).not.toBeVisible();

    await page.getByRole('link', { name: 'All' }).click();

    await expect(page.getByText('Active task')).toBeVisible();
    await expect(page.getByText('Done task')).toBeVisible();
  });
});

test.describe('Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await openEmptyTodoPage(page);
  });

  test('TC-013: duplicate todo titles are allowed as separate entries', async ({ page }) => {
    await addTodo(page, 'Buy milk');
    await addTodo(page, 'Buy milk');

    await expect(page.getByText('Buy milk')).toHaveCount(2);
    await expect(page.getByText('2 items left')).toBeVisible();

    await completeTodo(page, 'Buy milk', 0);

    await expect(todoCheckbox(page, 'Buy milk', 0)).toBeChecked();
    await expect(todoCheckbox(page, 'Buy milk', 1)).not.toBeChecked();
    await expect(page.getByText('1 item left')).toBeVisible();
  });

  test('TC-014: todo text containing special characters is preserved', async ({ page }) => {
    const specialText = 'Pay $50 & tip 15% — due @5pm!';

    await addTodo(page, specialText);

    await expect(page.getByText(specialText)).toBeVisible();

    await completeTodo(page, specialText);
    await expect(todoCheckbox(page, specialText)).toBeChecked();

    await deleteTodo(page, specialText);
    await expect(page.getByText(specialText)).not.toBeVisible();
  });

  test('TC-015: very long todo text is accepted and displayed', async ({ page }) => {
    const longText = 'a'.repeat(500);

    await addTodo(page, longText);

    await expect(page.getByText(longText)).toBeVisible();

    await completeTodo(page, longText);
    await expect(todoCheckbox(page, longText)).toBeChecked();

    await deleteTodo(page, longText);
    await expect(page.getByText(longText)).not.toBeVisible();
  });

  test('TC-016: single-character todo is accepted', async ({ page }) => {
    await addTodo(page, 'X');

    await expect(page.getByText('X', { exact: true })).toBeVisible();
    await expect(page.getByText('1 item left')).toBeVisible();
  });

  test('TC-017: leading and trailing spaces are trimmed on add', async ({ page }) => {
    await addTodo(page, '  Trim test  ');

    await expect(page.getByText('Trim test')).toBeVisible();
    await expect(todoListItems(page)).toHaveCount(1);

    await completeTodo(page, 'Trim test');
    await expect(todoCheckbox(page, 'Trim test')).toBeChecked();

    await page.reload();
    await expect(page.getByText('Trim test')).toBeVisible();
    await expect(todoCheckbox(page, 'Trim test')).toBeChecked();
  });

  test('TC-018: completing all items shows zero items left and Clear completed', async ({ page }) => {
    await addTodo(page, 'Task one');
    await addTodo(page, 'Task two');

    await completeTodo(page, 'Task one');
    await completeTodo(page, 'Task two');

    await expect(page.getByText('0 items left')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear completed' })).toBeVisible();

    await page.getByRole('link', { name: 'Completed' }).click();

    await expect(page.getByText('Task one')).toBeVisible();
    await expect(page.getByText('Task two')).toBeVisible();
  });

  test('TC-019: todo list persists after page reload', async ({ page }) => {
    await addTodo(page, 'Persist me');
    await completeTodo(page, 'Persist me');

    await page.reload();

    await expect(page.getByText('Persist me')).toBeVisible();
    await expect(todoCheckbox(page, 'Persist me')).toBeChecked();

    await deleteTodo(page, 'Persist me');
    await page.reload();

    await expect(page.getByRole('checkbox', { name: 'Toggle Todo' })).toHaveCount(0);
    await expect(page.getByText(/items left/)).not.toBeVisible();
  });

  test('TC-020: Unicode and emoji characters in todo text', async ({ page }) => {
    const unicodeText = 'Réunion 📝 日本語';

    await addTodo(page, unicodeText);

    await expect(page.getByText(unicodeText)).toBeVisible();

    await completeTodo(page, unicodeText);
    await expect(todoCheckbox(page, unicodeText)).toBeChecked();

    await deleteTodo(page, unicodeText);
    await expect(page.getByText(unicodeText)).not.toBeVisible();
  });
});
