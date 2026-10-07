import React, { useState } from 'react';

import { formatDate, isOverdue } from '../utils/dates';

import { CheckIcon, DeleteIcon, EditIcon, WarningIcon } from './Icons';
import TodoForm from './TodoForm';

const TodoItem = ({ todo, onToggle, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="todo-item editing">
        <TodoForm
          label="Edit task"
          initialTitle={todo.title}
          initialDueDate={todo.dueDate || ''}
          submitLabel="Save"
          onSubmit={async (values) => {
            await onUpdate(todo.id, values);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  const overdue = !todo.completed && isOverdue(todo.dueDate);
  const classes = ['todo-item', todo.completed && 'completed', overdue && 'overdue'];

  return (
    <li className={classes.filter(Boolean).join(' ')}>
      <button
        type="button"
        className="icon-btn icon-success"
        aria-label={
          todo.completed ? `Mark ${todo.title} as not done` : `Mark ${todo.title} as done`
        }
        aria-pressed={todo.completed}
        onClick={() => onToggle(todo)}
      >
        <CheckIcon />
      </button>
      <div className="todo-content">
        <span className="todo-title">{todo.title}</span>
        {todo.dueDate && (
          <span className="todo-due">
            {overdue && <WarningIcon />}
            {overdue ? 'Overdue: ' : 'Due: '}
            {formatDate(todo.dueDate)}
          </span>
        )}
      </div>
      <button
        type="button"
        className="icon-btn icon-edit"
        aria-label={`Edit ${todo.title}`}
        onClick={() => setEditing(true)}
      >
        <EditIcon />
      </button>
      <button
        type="button"
        className="icon-btn icon-danger"
        aria-label={`Delete ${todo.title}`}
        onClick={() => onDelete(todo.id)}
      >
        <DeleteIcon />
      </button>
    </li>
  );
};

export default TodoItem;
