import { renderHook, act, waitFor } from '@testing-library/react';

import * as api from '../api/todos';
import useTodos from '../hooks/useTodos';

jest.mock('../api/todos');

const todo = { id: 1, title: 'Task', dueDate: null, completed: false };

beforeEach(() => {
  api.fetchTodos.mockResolvedValue([todo]);
  api.createTodo.mockResolvedValue(todo);
  api.updateTodo.mockResolvedValue(todo);
  api.deleteTodo.mockResolvedValue({});
});

describe('useTodos', () => {
  it('loads todos on mount', async () => {
    const { result } = renderHook(() => useTodos());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.todos).toEqual([todo]);
  });

  it('reports a load failure', async () => {
    api.fetchTodos.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useTodos());

    await waitFor(() => expect(result.current.error).toBe('Failed to load tasks: boom'));
  });

  it('re-fetches after adding and updating', async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.addTodo({ title: 'New', dueDate: null }));
    await act(() => result.current.updateTodo(1, { title: 'Changed' }));

    expect(api.createTodo).toHaveBeenCalledWith({ title: 'New', dueDate: null });
    expect(api.updateTodo).toHaveBeenCalledWith(1, { title: 'Changed' });
    expect(api.fetchTodos).toHaveBeenCalledTimes(3);
  });

  it('lets add errors reach the caller', async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));
    api.createTodo.mockRejectedValue(new Error('Title is required'));

    await expect(result.current.addTodo({ title: '' })).rejects.toThrow('Title is required');
  });

  it('toggles completion and reports delete failures', async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.toggleCompleted(todo));
    expect(api.updateTodo).toHaveBeenCalledWith(1, { completed: true });

    api.deleteTodo.mockRejectedValue(new Error('gone'));
    await act(() => result.current.removeTodo(1));
    expect(result.current.error).toBe('Failed to delete task: gone');
  });
});
