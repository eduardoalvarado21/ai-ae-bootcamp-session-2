import { createTodo, deleteTodo, fetchTodos, updateTodo } from '../api/todos';

const mockResponse = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: body === undefined ? () => Promise.reject(new Error('no body')) : async () => body,
});

beforeEach(() => {
  global.fetch = jest.fn();
});

describe('todos api', () => {
  it('fetches the list from /api/todos', async () => {
    const list = [{ id: 1, title: 'Task' }];
    global.fetch.mockResolvedValue(mockResponse(200, list));

    await expect(fetchTodos()).resolves.toEqual(list);

    expect(global.fetch).toHaveBeenCalledWith('/api/todos', undefined);
  });

  it('posts a new todo as JSON', async () => {
    global.fetch.mockResolvedValue(mockResponse(201, { id: 1 }));

    await createTodo({ title: 'New', dueDate: '2099-01-01' });

    expect(global.fetch).toHaveBeenCalledWith('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New', dueDate: '2099-01-01' }),
    });
  });

  it('puts changes to the todo URL as JSON', async () => {
    global.fetch.mockResolvedValue(mockResponse(200, { id: 7 }));

    await updateTodo(7, { completed: true });

    expect(global.fetch).toHaveBeenCalledWith('/api/todos/7', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    });
  });

  it('sends a DELETE to the todo URL', async () => {
    global.fetch.mockResolvedValue(mockResponse(200, { id: 7 }));

    await deleteTodo(7);

    expect(global.fetch).toHaveBeenCalledWith('/api/todos/7', { method: 'DELETE' });
  });

  it('throws the server error message on a failed request', async () => {
    global.fetch.mockResolvedValue(mockResponse(400, { error: 'Title is required' }));

    await expect(createTodo({ title: '' })).rejects.toThrow('Title is required');
  });

  it('falls back to the status code when the error body is not JSON', async () => {
    global.fetch.mockResolvedValue(mockResponse(502));

    await expect(fetchTodos()).rejects.toThrow('Request failed with status 502');
  });

  it('propagates network failures', async () => {
    global.fetch.mockRejectedValue(new Error('Failed to fetch'));

    await expect(fetchTodos()).rejects.toThrow('Failed to fetch');
  });
});
