const request = require('supertest');
const { app, db } = require('../../src/app');

beforeEach(() => {
  db.exec("DELETE FROM todos; DELETE FROM sqlite_sequence WHERE name = 'todos';");
});

afterAll(() => {
  db.close();
});

const createTodo = async (body) => {
  const response = await request(app).post('/api/todos').send(body);
  expect(response.status).toBe(201);
  return response.body;
};

const listTodos = async () => (await request(app).get('/api/todos')).body;

// Makes every statement fail with a real SQLite error, then restores the table.
const withBrokenTable = async (callback) => {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  db.exec('ALTER TABLE todos RENAME TO todos_backup');
  try {
    await callback();
  } finally {
    db.exec('ALTER TABLE todos_backup RENAME TO todos');
    errorSpy.mockRestore();
  }
};

describe('TODO API', () => {
  describe('GET /api/todos', () => {
    it('returns an empty list when there are no todos', async () => {
      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('sorts by due date ascending, undated last, then creation order', async () => {
      await createTodo({ title: 'undated first' });
      await createTodo({ title: 'late', dueDate: '2026-12-01' });
      await createTodo({ title: 'early', dueDate: '2026-01-01' });
      await createTodo({ title: 'late tie', dueDate: '2026-12-01' });
      await createTodo({ title: 'undated second' });

      const response = await request(app).get('/api/todos');

      expect(response.body.map((todo) => todo.title)).toEqual([
        'early',
        'late',
        'late tie',
        'undated first',
        'undated second',
      ]);
    });
  });

  describe('POST /api/todos', () => {
    it('creates a todo with a due date', async () => {
      const todo = await createTodo({ title: '  Write plan  ', dueDate: '2026-05-20' });

      expect(todo).toMatchObject({
        title: 'Write plan',
        dueDate: '2026-05-20',
        completed: false,
      });
      expect(todo).toHaveProperty('id');
      expect(await listTodos()).toEqual([todo]);
    });

    it('accepts a title of exactly the maximum length', async () => {
      const title = 'a'.repeat(200);

      const todo = await createTodo({ title });

      expect(todo.title).toBe(title);
    });

    it('rejects a title over the maximum length without storing it', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'a'.repeat(201) });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/at most 200/);
      expect(await listTodos()).toEqual([]);
    });

    it.each([['2026-01-01'], 20260101, { date: '2026-01-01' }])(
      'rejects a non-string due date %p',
      async (dueDate) => {
        const response = await request(app).post('/api/todos').send({ title: 'Bad', dueDate });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/valid date/);
        expect(await listTodos()).toEqual([]);
      }
    );

    it('returns 400 for malformed JSON', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Content-Type', 'application/json')
        .send('{"title":');

      expect(response.status).toBe(400);
      expect(await listTodos()).toEqual([]);
    });

    it('creates a todo without a due date', async () => {
      const todo = await createTodo({ title: 'No date' });

      expect(todo.dueDate).toBeNull();
    });

    it.each([{}, { title: '' }, { title: '   ' }, { title: 5 }])(
      'rejects an invalid title %p',
      async (body) => {
        const response = await request(app).post('/api/todos').send(body);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Title is required');
      }
    );

    it('rejects an invalid due date', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'Bad date', dueDate: '2026-02-30' });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/valid date/);
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('updates the title and due date', async () => {
      const todo = await createTodo({ title: 'Old', dueDate: '2026-01-01' });

      const response = await request(app)
        .put(`/api/todos/${todo.id}`)
        .send({ title: 'New', dueDate: '2026-03-03' });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ title: 'New', dueDate: '2026-03-03' });
      expect(await listTodos()).toEqual([response.body]);
    });

    it('keeps the due date and completed state when only the title changes', async () => {
      const todo = await createTodo({ title: 'Original', dueDate: '2026-04-04' });
      await request(app).put(`/api/todos/${todo.id}`).send({ completed: true });

      await request(app).put(`/api/todos/${todo.id}`).send({ title: 'Renamed' });

      expect(await listTodos()).toEqual([
        expect.objectContaining({
          id: todo.id,
          title: 'Renamed',
          dueDate: '2026-04-04',
          completed: true,
        }),
      ]);
    });

    it('keeps the title when only completed changes', async () => {
      const todo = await createTodo({ title: 'Stay', dueDate: '2026-04-04' });

      await request(app).put(`/api/todos/${todo.id}`).send({ completed: true });

      expect(await listTodos()).toEqual([
        expect.objectContaining({ title: 'Stay', dueDate: '2026-04-04', completed: true }),
      ]);
    });

    it('marks a completed todo as not completed again', async () => {
      const todo = await createTodo({ title: 'Toggle' });
      await request(app).put(`/api/todos/${todo.id}`).send({ completed: true });

      await request(app).put(`/api/todos/${todo.id}`).send({ completed: false });

      expect((await listTodos())[0].completed).toBe(false);
    });

    it('rejects an over-long title and leaves the stored todo unchanged', async () => {
      const todo = await createTodo({ title: 'Keep', dueDate: '2026-01-01' });

      const response = await request(app)
        .put(`/api/todos/${todo.id}`)
        .send({ title: 'a'.repeat(201) });

      expect(response.status).toBe(400);
      expect(await listTodos()).toEqual([todo]);
    });

    it('clears the due date with null', async () => {
      const todo = await createTodo({ title: 'Dated', dueDate: '2026-01-01' });

      const response = await request(app).put(`/api/todos/${todo.id}`).send({ dueDate: null });

      expect(response.status).toBe(200);
      expect(response.body.dueDate).toBeNull();
      expect(response.body.title).toBe('Dated');
    });

    it('toggles completed', async () => {
      const todo = await createTodo({ title: 'Finish' });

      const response = await request(app).put(`/api/todos/${todo.id}`).send({ completed: true });

      expect(response.body.completed).toBe(true);
    });

    it('rejects an empty title and an invalid date', async () => {
      const todo = await createTodo({ title: 'Keep' });

      const emptyTitle = await request(app).put(`/api/todos/${todo.id}`).send({ title: ' ' });
      const badDate = await request(app).put(`/api/todos/${todo.id}`).send({ dueDate: 'nope' });
      const badCompleted = await request(app)
        .put(`/api/todos/${todo.id}`)
        .send({ completed: 'yes' });

      expect(emptyTitle.status).toBe(400);
      expect(badDate.status).toBe(400);
      expect(badCompleted.status).toBe(400);
      expect((await listTodos())[0]).toMatchObject({ title: 'Keep', completed: false });
    });

    it('returns 404 for a missing todo', async () => {
      const response = await request(app).put('/api/todos/999').send({ title: 'x' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Todo not found');
    });

    it('returns 400 for an invalid id', async () => {
      const response = await request(app).put('/api/todos/abc').send({ title: 'x' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('deletes a todo', async () => {
      const todo = await createTodo({ title: 'Remove me' });

      const response = await request(app).delete(`/api/todos/${todo.id}`);
      const list = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Todo deleted successfully', id: todo.id });
      expect(list.body).toEqual([]);
    });

    it('returns 404 for a missing todo', async () => {
      const response = await request(app).delete('/api/todos/999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Todo not found');
    });

    it('returns 400 for an invalid id', async () => {
      const response = await request(app).delete('/api/todos/abc');

      expect(response.status).toBe(400);
    });

    it('removes only the requested todo', async () => {
      const keep = await createTodo({ title: 'Keep' });
      const remove = await createTodo({ title: 'Remove' });

      await request(app).delete(`/api/todos/${remove.id}`);

      expect(await listTodos()).toEqual([keep]);
    });
  });

  describe('database failures', () => {
    it('returns 500 on every route when the database fails', async () => {
      const todo = await createTodo({ title: 'Doomed' });

      await withBrokenTable(async () => {
        const responses = await Promise.all([
          request(app).get('/api/todos'),
          request(app).post('/api/todos').send({ title: 'x' }),
          request(app).put(`/api/todos/${todo.id}`).send({ title: 'y' }),
          request(app).delete(`/api/todos/${todo.id}`),
        ]);

        expect(responses.map((response) => response.status)).toEqual([500, 500, 500, 500]);
        expect(responses[0].body).toEqual({ error: 'Failed to fetch todos' });
      });

      expect(await listTodos()).toEqual([todo]);
    });
  });
});
