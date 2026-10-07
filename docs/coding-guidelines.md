# Coding Guidelines

This document summarizes the coding style and quality principles for the project. The goal is code that is consistent, readable, and easy to change.

## General Formatting

The codebase is JavaScript throughout: CommonJS in the backend (`packages/backend`) and ES modules with React function components in the frontend (`packages/frontend`). Follow the style already present in the existing files:

- Use 2 spaces for indentation, with no tabs.
- Use single quotes for strings, and template literals when interpolating or writing multi-line strings (such as SQL).
- Always end statements with semicolons.
- Use trailing commas in multi-line objects and arrays where it keeps diffs small.
- Keep lines reasonably short (around 100 characters) and break long expressions across lines.
- Use `const` by default, `let` only when reassignment is needed, and never `var`.
- Prefer arrow functions for callbacks and `async`/`await` over promise chains.
- Name variables and functions in `camelCase`, React components in `PascalCase`, and constants in `UPPER_SNAKE_CASE` only when they are true module-level constants.
- Use descriptive names. A name should explain intent so that a comment is not needed.

## Import Organization

Group imports so that a file's dependencies are easy to scan:

1. Third-party packages (`react`, `express`, `cors`, ...).
2. Local modules (other files in the same package).
3. Side-effect and asset imports, such as stylesheets (`./App.css`), last.

Leave a blank line between groups. Import only what is used, and remove unused imports. In the frontend use ES `import` syntax. In the backend use `require` consistently, and do not mix the two styles within a package. Backend `require` calls belong at the top of the file.

## Linting

No linter is configured in the repository yet. When one is added, ESLint is the expected choice, with these rules for its use:

- Run the linter before committing and fix all errors. Do not silence rules with blanket `eslint-disable` comments. If a disable is unavoidable, scope it to a single line and explain why.
- Treat warnings as work to be resolved, not noise to be ignored.
- The frontend already ships with the Create React App ESLint rules, which should remain enabled.
- Pair the linter with an automatic formatter (such as Prettier) so that style is not debated in reviews.
- Any new configuration is shared at the repository root so that both packages follow the same rules.

## Code Quality Principles

### DRY (Don't Repeat Yourself)

Every piece of knowledge should have a single, authoritative home. When the same logic, query, or constant appears in more than one place, extract it into a function or shared constant. Avoid abstracting too early, though: wait until duplication appears a second or third time and the shared shape is clear, so that the abstraction fits real use.

### Keep Functions Small and Focused

A function should do one thing and be named for it. Prefer early returns over deep nesting. In React, split large components into smaller ones, and move data fetching or reusable stateful logic into helpers or custom hooks.

### Simplicity Over Cleverness

Write the simplest code that satisfies the requirement (KISS), and do not build for hypothetical future needs (YAGNI). Clear, boring code is easier to review, test, and debug than clever code.

### Error Handling

Handle errors at system boundaries: HTTP handlers, database access, and network calls in the UI. Return meaningful status codes and messages from the API, and show user-friendly error states in the interface. Do not swallow errors silently, and do not add defensive checks for conditions that cannot occur.

### Comments

Comments explain why, not what. Do not restate what the code already says. Delete commented-out code, since version control keeps the history.

### Security

Validate and sanitize all input from clients. Use parameterized queries for every database statement (as the existing `better-sqlite3` prepared statements do), never string concatenation. Do not commit secrets or credentials.

### Tests

New behavior and bug fixes come with tests, following the [Testing Guidelines](./testing-guidelines.md). Keep the test suite passing before every commit.

## Applying These Guidelines

When modifying existing code, match the surrounding style rather than reformatting unrelated lines. Keep commits and pull requests focused, so that style changes do not obscure functional changes.
