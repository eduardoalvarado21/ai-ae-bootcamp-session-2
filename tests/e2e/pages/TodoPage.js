class TodoPage {
  constructor(page) {
    this.page = page;
    this.addForm = page.getByRole('form', { name: 'Add task' });
    this.addTitleInput = this.addForm.getByLabel('Title');
    this.addDueDateInput = this.addForm.getByLabel('Due date');
    this.addButton = this.addForm.getByRole('button', { name: 'Add' });
    this.formError = page.getByRole('alert');
    this.items = page.getByRole('listitem');
    this.emptyState = page.getByText('No tasks yet');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.getByRole('heading', { name: 'TODO App' }).waitFor();
  }

  async addTask(title, dueDate) {
    await this.addTitleInput.fill(title);
    if (dueDate) {
      await this.addDueDateInput.fill(dueDate);
    }
    await this.addButton.click();
  }

  item(title) {
    return this.items.filter({ hasText: title });
  }

  async titles() {
    return this.page.locator('.todo-title').allTextContents();
  }

  async startEdit(title) {
    await this.page.getByRole('button', { name: `Edit ${title}` }).click();
    return this.page.getByRole('form', { name: 'Edit task' });
  }

  async editTask(currentTitle, { title, dueDate }) {
    const form = await this.startEdit(currentTitle);
    await form.getByLabel('Title').fill(title);
    await form.getByLabel('Due date').fill(dueDate);
    await form.getByRole('button', { name: 'Save' }).click();
  }

  async cancelEdit(currentTitle, newTitle) {
    const form = await this.startEdit(currentTitle);
    await form.getByLabel('Title').fill(newTitle);
    await form.getByRole('button', { name: 'Cancel' }).click();
  }

  async deleteTask(title) {
    await this.page.getByRole('button', { name: `Delete ${title}` }).click();
  }

  async hasHorizontalScroll() {
    return this.page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
  }
}

module.exports = { TodoPage };
