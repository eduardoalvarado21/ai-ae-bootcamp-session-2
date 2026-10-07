import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TodoItem from '../components/TodoItem';

const baseTodo = { id: 1, title: 'Write tests', dueDate: '2099-01-01', completed: false };

const setup = (todo = {}) => {
  const handlers = {
    onToggle: jest.fn(),
    onUpdate: jest.fn().mockResolvedValue(),
    onDelete: jest.fn(),
  };
  render(
    <ul>
      <TodoItem todo={{ ...baseTodo, ...todo }} {...handlers} />
    </ul>
  );
  return { ...handlers, user: userEvent.setup() };
};

describe('TodoItem', () => {
  it('shows the title and due date', () => {
    setup();

    expect(screen.getByText('Write tests')).toBeInTheDocument();
    expect(screen.getByText(/Due: Jan 1, 2099/)).toBeInTheDocument();
  });

  it('highlights an overdue task with text, not just color', () => {
    setup({ dueDate: '2000-01-01' });

    expect(screen.getByText(/Overdue: Jan 1, 2000/)).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toHaveClass('overdue');
  });

  it('does not flag a completed task as overdue', () => {
    setup({ dueDate: '2000-01-01', completed: true });

    expect(screen.getByRole('listitem')).not.toHaveClass('overdue');
  });

  it('toggles completion and deletes', async () => {
    const { onToggle, onDelete, user } = setup();

    await user.click(screen.getByRole('button', { name: 'Mark Write tests as done' }));
    await user.click(screen.getByRole('button', { name: 'Delete Write tests' }));

    expect(onToggle).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('edits the title and due date', async () => {
    const { onUpdate, user } = setup();

    await user.click(screen.getByRole('button', { name: 'Edit Write tests' }));
    const title = screen.getByLabelText('Title');
    await user.clear(title);
    await user.type(title, 'Renamed');
    await user.clear(screen.getByLabelText('Due date'));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onUpdate).toHaveBeenCalledWith(1, { title: 'Renamed', dueDate: null });
    expect(await screen.findByText('Write tests')).toBeInTheDocument();
  });

  it('discards changes on cancel', async () => {
    const { onUpdate, user } = setup();

    await user.click(screen.getByRole('button', { name: 'Edit Write tests' }));
    await user.type(screen.getByLabelText('Title'), ' extra');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.getByText('Write tests')).toBeInTheDocument();
  });
});
