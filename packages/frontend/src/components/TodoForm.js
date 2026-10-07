import React, { useId, useState } from 'react';

const TodoForm = ({
  initialTitle = '',
  initialDueDate = '',
  submitLabel,
  label,
  onSubmit,
  onCancel,
  resetOnSubmit = false,
}) => {
  const id = useId();
  const [title, setTitle] = useState(initialTitle);
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (title.trim() === '') {
      setError('Title is required');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), dueDate: dueDate || null });
      setError(null);
      if (resetOnSubmit) {
        setTitle('');
        setDueDate('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit} aria-label={label} noValidate>
      <div className="field">
        <label htmlFor={`${id}-title`}>Title</label>
        <input
          id={`${id}-title`}
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      <div className="field">
        <label htmlFor={`${id}-due`}>Due date</label>
        <input
          id={`${id}-due`}
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-text" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
};

export default TodoForm;
