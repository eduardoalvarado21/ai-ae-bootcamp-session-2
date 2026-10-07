const pad = (value) => String(value).padStart(2, '0');

export const todayString = (now = new Date()) =>
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

// Compares ISO date strings, which sort lexicographically.
export const isOverdue = (dueDate, today = todayString()) => Boolean(dueDate) && dueDate < today;

export const formatDate = (dueDate) => {
  const [year, month, day] = dueDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
