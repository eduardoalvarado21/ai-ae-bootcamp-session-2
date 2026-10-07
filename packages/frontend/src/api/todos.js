const BASE_URL = '/api/todos';

const request = async (url, options) => {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.error || `Request failed with status ${response.status}`);
  }
  return body;
};

const jsonOptions = (method, payload) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

export const fetchTodos = () => request(BASE_URL);

export const createTodo = (values) => request(BASE_URL, jsonOptions('POST', values));

export const updateTodo = (id, changes) =>
  request(`${BASE_URL}/${id}`, jsonOptions('PUT', changes));

export const deleteTodo = (id) => request(`${BASE_URL}/${id}`, { method: 'DELETE' });
