import { useCallback, useEffect, useState } from 'react';

import * as api from '../api/todos';

const useTodos = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // The server owns the sort order, so every change re-fetches the list.
  const refresh = useCallback(async () => {
    try {
      setTodos(await api.fetchTodos());
      setError(null);
    } catch (err) {
      setError(`Failed to load tasks: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const mutate = async (action) => {
    await action();
    await refresh();
  };

  const guarded = async (action, message) => {
    try {
      await mutate(action);
    } catch (err) {
      setError(`${message}: ${err.message}`);
    }
  };

  // add and update reject so the form can show the validation message.
  const addTodo = (values) => mutate(() => api.createTodo(values));
  const updateTodo = (id, changes) => mutate(() => api.updateTodo(id, changes));
  const removeTodo = (id) => guarded(() => api.deleteTodo(id), 'Failed to delete task');
  const toggleCompleted = (todo) =>
    guarded(() => api.updateTodo(todo.id, { completed: !todo.completed }), 'Failed to update task');

  return { todos, loading, error, addTodo, updateTodo, removeTodo, toggleCompleted };
};

export default useTodos;
