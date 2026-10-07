import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TodoForm from '../components/TodoForm';

const setup = (props = {}) => {
  const onSubmit = props.onSubmit || jest.fn().mockResolvedValue();
  render(<TodoForm label="Add task" submitLabel="Add" onSubmit={onSubmit} {...props} />);
  return { onSubmit, user: userEvent.setup() };
};

describe('TodoForm', () => {
  it('submits a trimmed title and due date', async () => {
    const { onSubmit, user } = setup();

    await user.type(screen.getByLabelText('Title'), '  Buy milk ');
    await user.type(screen.getByLabelText('Due date'), '2026-05-20');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(onSubmit).toHaveBeenCalledWith({ title: 'Buy milk', dueDate: '2026-05-20' });
  });

  it('submits a null due date when none is chosen', async () => {
    const { onSubmit, user } = setup();

    await user.type(screen.getByLabelText('Title'), 'No date');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(onSubmit).toHaveBeenCalledWith({ title: 'No date', dueDate: null });
  });

  it('shows a validation message for an empty title and does not submit', async () => {
    const { onSubmit, user } = setup();

    await user.type(screen.getByLabelText('Title'), '   ');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Title is required');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows the error when the submit handler rejects', async () => {
    const { user } = setup({ onSubmit: jest.fn().mockRejectedValue(new Error('Server says no')) });

    await user.type(screen.getByLabelText('Title'), 'Task');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Server says no');
  });

  it('clears the fields after submit when resetOnSubmit is set', async () => {
    const { user } = setup({ resetOnSubmit: true });

    await user.type(screen.getByLabelText('Title'), 'Task');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByLabelText('Title')).toHaveValue('');
  });

  it('calls onCancel and shows initial values when editing', async () => {
    const onCancel = jest.fn();
    const { user } = setup({
      initialTitle: 'Existing',
      initialDueDate: '2026-01-01',
      onCancel,
    });

    expect(screen.getByLabelText('Title')).toHaveValue('Existing');
    expect(screen.getByLabelText('Due date')).toHaveValue('2026-01-01');

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalled();
  });
});
