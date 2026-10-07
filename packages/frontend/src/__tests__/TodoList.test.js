import React from 'react';
import { render, screen } from '@testing-library/react';

import TodoList from '../components/TodoList';

const handlers = { onToggle: jest.fn(), onUpdate: jest.fn(), onDelete: jest.fn() };

describe('TodoList', () => {
  it('shows the empty state when there are no tasks', () => {
    render(<TodoList todos={[]} {...handlers} />);

    expect(screen.getByText(/No tasks yet/)).toBeInTheDocument();
  });

  it('renders tasks in the order given', () => {
    const todos = [
      { id: 1, title: 'First', dueDate: '2099-01-01', completed: false },
      { id: 2, title: 'Second', dueDate: null, completed: false },
    ];

    render(<TodoList todos={todos} {...handlers} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('First');
    expect(items[1]).toHaveTextContent('Second');
  });
});
