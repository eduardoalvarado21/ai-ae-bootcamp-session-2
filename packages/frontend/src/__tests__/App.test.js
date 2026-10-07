import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import * as api from '../api/todos';
import App from '../App';

jest.mock('../api/todos');

let todos;

beforeEach(() => {
  todos = [];
  api.fetchTodos.mockImplementation(async () => [...todos]);
  api.createTodo.mockImplementation(async (values) => {
    todos.push({ id: todos.length + 1, completed: false, ...values });
  });
  api.deleteTodo.mockImplementation(async (id) => {
    todos = todos.filter((item) => item.id !== id);
  });
});

describe('App', () => {
  it('shows the empty state after loading', async () => {
    render(<App />);

    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
    expect(await screen.findByText(/No tasks yet/)).toBeInTheDocument();
  });

  it('adds a task and shows it in the list', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText(/No tasks yet/);

    await user.type(screen.getByLabelText('Title'), 'Buy milk');
    await user.type(screen.getByLabelText('Due date'), '2099-02-03');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    const item = await screen.findByRole('listitem');
    expect(within(item).getByText('Buy milk')).toBeInTheDocument();
    expect(within(item).getByText(/Feb 3, 2099/)).toBeInTheDocument();
  });

  it('deletes a task', async () => {
    todos = [{ id: 1, title: 'Remove me', dueDate: null, completed: false }];
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'Delete Remove me' }));

    expect(await screen.findByText(/No tasks yet/)).toBeInTheDocument();
  });

  it('shows an error when loading fails', async () => {
    api.fetchTodos.mockRejectedValue(new Error('offline'));

    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to load tasks: offline');
  });
});
