const { test, expect } = require('@playwright/test');

const { TodoPage } = require('./pages/TodoPage');
const { resetTodos, seedTodo, listTodos } = require('./support/api');

let todoPage;

test.beforeEach(async ({ page, request }) => {
  await resetTodos(request);
  todoPage = new TodoPage(page);
});

test.afterEach(async ({ request }) => {
  await resetTodos(request);
});

test.describe('todo workflow', () => {
  test('adds a task with a due date', async ({ request }) => {
    await todoPage.goto();
    await expect(todoPage.emptyState).toBeVisible();

    await todoPage.addTask('Buy milk', '2099-02-03');

    await expect(todoPage.item('Buy milk')).toContainText('Feb 3, 2099');
    await expect(todoPage.emptyState).toBeHidden();
    await expect(todoPage.addTitleInput).toHaveValue('');
    expect(await listTodos(request)).toEqual([
      expect.objectContaining({ title: 'Buy milk', dueDate: '2099-02-03', completed: false }),
    ]);
  });

  test('rejects a task with an empty title', async ({ request }) => {
    await todoPage.goto();

    await todoPage.addTask('   ');

    await expect(todoPage.formError).toHaveText(/Title is required/);
    await expect(todoPage.items).toHaveCount(0);
    expect(await listTodos(request)).toEqual([]);
  });

  test('shows the server error for a title that is too long and stores nothing', async ({
    request,
  }) => {
    await todoPage.goto();

    await todoPage.addTask('a'.repeat(201));

    await expect(todoPage.formError).toHaveText(/at most 200 characters/);
    await expect(todoPage.items).toHaveCount(0);
    expect(await listTodos(request)).toEqual([]);
  });

  test('edits the title and due date of a task', async ({ request }) => {
    const seeded = await seedTodo(request, { title: 'Old title', dueDate: '2099-01-01' });
    await todoPage.goto();

    await todoPage.editTask('Old title', { title: 'New title', dueDate: '2099-03-15' });

    await expect(todoPage.item('New title')).toContainText('Mar 15, 2099');
    await expect(todoPage.item('Old title')).toHaveCount(0);
    expect(await listTodos(request)).toEqual([
      expect.objectContaining({ id: seeded.id, title: 'New title', dueDate: '2099-03-15' }),
    ]);
  });

  test('keeps the edit form open with an error when the new title is empty', async ({
    request,
  }) => {
    await seedTodo(request, { title: 'Keep me', dueDate: '2099-01-01' });
    await todoPage.goto();

    const form = await todoPage.startEdit('Keep me');
    await form.getByLabel('Title').fill('  ');
    await form.getByRole('button', { name: 'Save' }).click();

    await expect(form.getByRole('alert')).toHaveText(/Title is required/);
    expect(await listTodos(request)).toEqual([expect.objectContaining({ title: 'Keep me' })]);
  });

  test('cancelling an edit leaves the task unchanged', async ({ request }) => {
    await seedTodo(request, { title: 'Keep me', dueDate: '2099-01-01' });
    await todoPage.goto();

    await todoPage.cancelEdit('Keep me', 'Changed');

    await expect(todoPage.item('Keep me')).toContainText('Jan 1, 2099');
    await expect(todoPage.item('Changed')).toHaveCount(0);
    expect(await listTodos(request)).toEqual([
      expect.objectContaining({ title: 'Keep me', dueDate: '2099-01-01' }),
    ]);
  });

  test('marks a task done and back to not done', async ({ request }) => {
    await seedTodo(request, { title: 'Finish report', dueDate: '2000-01-01' });
    await todoPage.goto();
    await expect(todoPage.item('Finish report')).toContainText('Overdue');

    await todoPage.markDone('Finish report');

    await expect(todoPage.item('Finish report')).toHaveClass(/completed/);
    await expect(todoPage.item('Finish report')).not.toContainText('Overdue');
    expect(await listTodos(request)).toEqual([expect.objectContaining({ completed: true })]);

    await todoPage.markNotDone('Finish report');

    await expect(todoPage.item('Finish report')).not.toHaveClass(/completed/);
    await expect(todoPage.item('Finish report')).toContainText('Overdue');
    expect(await listTodos(request)).toEqual([expect.objectContaining({ completed: false })]);
  });

  test('deletes a task and shows the empty state', async ({ request }) => {
    await seedTodo(request, { title: 'Remove me' });
    await todoPage.goto();

    await todoPage.deleteTask('Remove me');

    await expect(todoPage.items).toHaveCount(0);
    await expect(todoPage.emptyState).toBeVisible();
    expect(await listTodos(request)).toEqual([]);
  });

  test('deleting one task leaves the others', async ({ request }) => {
    await seedTodo(request, { title: 'Stay' });
    await seedTodo(request, { title: 'Go' });
    await todoPage.goto();

    await todoPage.deleteTask('Go');

    await expect(todoPage.items).toHaveCount(1);
    expect((await listTodos(request)).map((todo) => todo.title)).toEqual(['Stay']);
  });

  test('keeps the task and shows an error when the delete request fails', async ({
    page,
    request,
  }) => {
    await seedTodo(request, { title: 'Sticky' });
    await page.route('**/api/todos/*', (route) =>
      route.request().method() === 'DELETE'
        ? route.fulfill({ status: 500, json: { error: 'Failed to delete todo' } })
        : route.continue()
    );
    await todoPage.goto();

    await todoPage.deleteTask('Sticky');

    await expect(todoPage.errorBanner).toContainText('Failed to delete task');
    await expect(todoPage.item('Sticky')).toHaveCount(1);
    expect(await listTodos(request)).toHaveLength(1);
  });

  test('completes a full journey and persists it across reloads', async ({ page, request }) => {
    await todoPage.goto();

    await todoPage.addTask('Plan trip', '2099-05-01');
    await expect(todoPage.item('Plan trip')).toContainText('May 1, 2099');

    await todoPage.editTask('Plan trip', { title: 'Book trip', dueDate: '2099-06-01' });
    await expect(todoPage.item('Book trip')).toContainText('Jun 1, 2099');

    await todoPage.markDone('Book trip');
    await expect(todoPage.item('Book trip')).toHaveClass(/completed/);
    expect(await listTodos(request)).toEqual([
      expect.objectContaining({ title: 'Book trip', dueDate: '2099-06-01', completed: true }),
    ]);

    await page.reload();
    await todoPage.goto();
    await expect(todoPage.item('Book trip')).toHaveClass(/completed/);
    await expect(todoPage.item('Book trip')).toContainText('Jun 1, 2099');

    await todoPage.deleteTask('Book trip');
    await expect(todoPage.emptyState).toBeVisible();
    expect(await listTodos(request)).toEqual([]);

    await page.reload();
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
