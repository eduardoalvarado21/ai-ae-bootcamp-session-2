import { formatDate, isOverdue, todayString } from '../utils/dates';

describe('todayString', () => {
  it('formats a date as zero-padded YYYY-MM-DD in local time', () => {
    expect(todayString(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('isOverdue', () => {
  it('is true for a date before today', () => {
    expect(isOverdue('2026-01-04', '2026-01-05')).toBe(true);
  });

  it.each(['2026-01-05', '2026-01-06'])('is false for %s', (dueDate) => {
    expect(isOverdue(dueDate, '2026-01-05')).toBe(false);
  });

  it('is false without a due date', () => {
    expect(isOverdue(null, '2026-01-05')).toBe(false);
  });
});

describe('formatDate', () => {
  it('formats a date without timezone shifts', () => {
    expect(formatDate('2026-03-01')).toBe('Mar 1, 2026');
  });
});
