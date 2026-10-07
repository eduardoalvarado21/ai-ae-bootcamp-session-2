const BACKEND_URL = `http://localhost:${process.env.BACKEND_PORT || 3030}`;

const resetTodos = async (request) => {
  const response = await request.get(`${BACKEND_URL}/api/todos`);
  const todos = await response.json();
  await Promise.all(todos.map((todo) => request.delete(`${BACKEND_URL}/api/todos/${todo.id}`)));
};

const seedTodo = async (request, todo) => {
  const response = await request.post(`${BACKEND_URL}/api/todos`, { data: todo });
  return response.json();
};

// Reads the backend directly so tests can verify stored state, not just the UI.
const listTodos = async (request) => {
  const response = await request.get(`${BACKEND_URL}/api/todos`);
  return response.json();
};

module.exports = { resetTodos, seedTodo, listTodos };
