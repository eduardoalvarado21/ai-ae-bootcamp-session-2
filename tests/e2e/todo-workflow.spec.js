const { test, expect } = require('@playwright/test');

const { TodoPage } = require('./pages/TodoPage');
const { resetTodos, seedTodo } = require('./support/api');

let todoPage;

test.beforeEach(async ({ page, request }) => {
  await resetTodos(request);
  todoPage = new TodoPage(page);
});

test.afterEach(async ({ request }) => {
  await resetTodos(request);
});

test.describe('todo workflow', () => {
  test('adds a task with a due date', async () => {
    await todoPage.goto();
    await expect(todoPage.emptyState).toBeVisible();

    await todoPage.addTask('Buy milk', '2099-02-03');

    await expect(todoPage.item('Buy milk')).toContainText('Feb 3, 2099');
    await expect(todoPage.emptyState).toBeHidden();
    await expect(todoPage.addTitleInput).toHaveValue('');
  });

  test('rejects a task with an empty title', async () => {
    await todoPage.goto();

    await todoPage.addTask('   ');

    await expect(todoPage.formError).toHaveText(/Title is required/);
    await expect(todoPage.items).toHaveCount(0);
  });

  test('edits the title and due date of a task', async ({ request }) => {
    await seedTodo(request, { title: 'Old title', dueDate: '2099-01-01' });
    await todoPage.goto();

    await todoPage.editTask('Old title', { title: 'New title', dueDate: '2099-03-15' });

    await expect(todoPage.item('New title')).toContainText('Mar 15, 2099');
    await expect(todoPage.item('Old title')).toHaveCount(0);
  });

  test('cancelling an edit leaves the task unchanged', async ({ request }) => {
    await seedTodo(request, { title: 'Keep me', dueDate: '2099-01-01' });
    await todoPage.goto();

    await todoPage.cancelEdit('Keep me', 'Changed');

    await expect(todoPage.item('Keep me')).toContainText('Jan 1, 2099');
    await expect(todoPage.item('Changed')).toHaveCount(0);
  });

  test('deletes a task and shows the empty state', async ({ request }) => {
    await seedTodo(request, { title: 'Remove me' });
    await todoPage.goto();

    await todoPage.deleteTask('Remove me');

    await expect(todoPage.items).toHaveCount(0);
    await expect(todoPage.emptyState).toBeVisible();
  });

  test('sorts by due date with undated tasks last', async ({ request }) => {
    await seedTodo(request, { title: 'No date' });
    await seedTodo(request, { title: 'Later', dueDate: '2099-12-01' });
    await seedTodo(request, { title: 'Sooner', dueDate: '2099-01-01' });
    await todoPage.goto();

    await expect.poll(() => todoPage.titles()).toEqual(['Sooner', 'Later', 'No date']);

    await todoPage.addTask('Middle', '2099-06-01');

    await expect.poll(() => todoPage.titles()).toEqual(['Sooner', 'Middle', 'Later', 'No date']);
  });

  test('highlights an overdue task with text', async ({ request }) => {
    await seedTodo(request, { title: 'Late task', dueDate: '2000-01-01' });
    await seedTodo(request, { title: 'Future task', dueDate: '2099-01-01' });
    await todoPage.goto();

    await expect(todoPage.item('Late task')).toContainText('Overdue');
    await expect(todoPage.item('Late task')).toHaveClass(/overdue/);
    await expect(todoPage.item('Future task')).not.toContainText('Overdue');
  });

  test('fits a mobile viewport without horizontal scrolling', async ({ page, request }) => {
    await seedTodo(request, {
      title: 'A fairly long task title that must wrap on small screens without overflow',
      dueDate: '2099-01-01',
    });
    await page.setViewportSize({ width: 360, height: 640 });
    await todoPage.goto();

    await expect(todoPage.items).toHaveCount(1);
    expect(await todoPage.hasHorizontalScroll()).toBe(false);
  });
});
