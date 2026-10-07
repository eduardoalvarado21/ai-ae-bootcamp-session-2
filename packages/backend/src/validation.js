const MAX_TITLE_LENGTH = 200;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isValidDate = (value) => {
  if (!DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const validateTitle = (title) => {
  if (typeof title !== 'string' || title.trim() === '') {
    return 'Title is required';
  }
  if (title.trim().length > MAX_TITLE_LENGTH) {
    return `Title must be at most ${MAX_TITLE_LENGTH} characters`;
  }
  return null;
};

const validateDueDate = (dueDate) => {
  if (dueDate === undefined || dueDate === null || dueDate === '') return null;
  if (typeof dueDate !== 'string' || !isValidDate(dueDate)) {
    return 'Due date must be a valid date in YYYY-MM-DD format';
  }
  return null;
};

const normalizeDueDate = (dueDate) => (dueDate ? dueDate : null);

module.exports = { validateTitle, validateDueDate, normalizeDueDate, MAX_TITLE_LENGTH };
