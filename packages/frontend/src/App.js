import React from 'react';

import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import useTodos from './hooks/useTodos';

import './App.css';

function App() {
  const { todos, loading, error, addTodo, updateTodo, removeTodo, toggleCompleted } = useTodos();

  return (
    <div className="App">
      <header className="App-header">
        <h1>TODO App</h1>
      </header>

      <main className="App-main">
        <section className="card add-section">
          <h2>Add a task</h2>
          <TodoForm label="Add task" submitLabel="Add" onSubmit={addTodo} resetOnSubmit />
        </section>

        <section aria-label="Tasks">
          {error && (
            <p className="status-error" role="alert">
              {error}
            </p>
          )}
          {loading ? (
            <p className="status-message">Loading tasks...</p>
          ) : (
            <TodoList
              todos={todos}
              onToggle={toggleCompleted}
              onUpdate={updateTodo}
              onDelete={removeTodo}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
