const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

const { validateTitle, validateDueDate, normalizeDueDate } = require('./validation');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const db = new Database(':memory:');

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    due_date TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

const statements = {
  list: db.prepare('SELECT * FROM todos ORDER BY due_date IS NULL, due_date ASC, id ASC'),
  get: db.prepare('SELECT * FROM todos WHERE id = ?'),
  insert: db.prepare('INSERT INTO todos (title, due_date) VALUES (?, ?)'),
  update: db.prepare('UPDATE todos SET title = ?, due_date = ?, completed = ? WHERE id = ?'),
  remove: db.prepare('DELETE FROM todos WHERE id = ?'),
};

const toTodo = (row) => ({
  id: row.id,
  title: row.title,
  dueDate: row.due_date,
  completed: row.completed === 1,
  createdAt: row.created_at,
});

const parseId = (value) => (/^\d+$/.test(value) ? Number(value) : null);

const validateCompleted = (completed) =>
  typeof completed === 'boolean' ? null : 'Completed must be a boolean';

// Only fields present in a PUT body are validated.
const validateUpdate = ({ title, dueDate, completed }) =>
  (title !== undefined && validateTitle(title)) ||
  (dueDate !== undefined && validateDueDate(dueDate)) ||
  (completed !== undefined && validateCompleted(completed)) ||
  null;

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

app.get('/api/todos', (req, res) => {
  try {
    res.json(statements.list.all().map(toTodo));
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

app.post('/api/todos', (req, res) => {
  try {
    const { title, dueDate } = req.body;

    const validationError = validateTitle(title) || validateDueDate(dueDate);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const result = statements.insert.run(title.trim(), normalizeDueDate(dueDate));
    res.status(201).json(toTodo(statements.get.get(result.lastInsertRowid)));
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

app.put('/api/todos/:id', (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const existing = statements.get.get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const validationError = validateUpdate(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { title, dueDate, completed } = req.body;
    statements.update.run(
      title !== undefined ? title.trim() : existing.title,
      dueDate !== undefined ? normalizeDueDate(dueDate) : existing.due_date,
      completed !== undefined ? Number(completed) : existing.completed,
      id
    );
    res.json(toTodo(statements.get.get(id)));
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

app.delete('/api/todos/:id', (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const result = statements.remove.run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully', id });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

module.exports = { app, db };
