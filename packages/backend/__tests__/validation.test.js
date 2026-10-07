const {
  validateTitle,
  validateDueDate,
  normalizeDueDate,
  MAX_TITLE_LENGTH,
} = require('../src/validation');

describe('validateTitle', () => {
  it('accepts a normal title', () => {
    expect(validateTitle('Buy milk')).toBeNull();
  });

  it.each([undefined, null, '', '   ', 42])('rejects %p', (value) => {
    expect(validateTitle(value)).toBe('Title is required');
  });

  it('rejects titles longer than the maximum', () => {
    expect(validateTitle('a'.repeat(MAX_TITLE_LENGTH + 1))).toMatch(/at most/);
  });
});

describe('validateDueDate', () => {
  it.each([undefined, null, '', '2026-02-28', '2024-02-29'])('accepts %p', (value) => {
    expect(validateDueDate(value)).toBeNull();
  });

  it.each(['2026-13-01', '2026-02-30', '2025-02-29', '26-01-01', 'tomorrow', 20260101])(
    'rejects %p',
    (value) => {
      expect(validateDueDate(value)).toMatch(/valid date/);
    }
  );
});

describe('normalizeDueDate', () => {
  it('turns empty values into null', () => {
    expect(normalizeDueDate('')).toBeNull();
    expect(normalizeDueDate(undefined)).toBeNull();
  });

  it('keeps a date string', () => {
    expect(normalizeDueDate('2026-01-01')).toBe('2026-01-01');
  });
});
