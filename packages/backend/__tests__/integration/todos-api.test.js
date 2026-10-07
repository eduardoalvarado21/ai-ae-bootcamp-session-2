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
  });
});
