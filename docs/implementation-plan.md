# Implementation Plan: TODO App

Plan to evolve the current generic "items" starter into the TODO app described in the [Functional Requirements](./functional-requirements.md), [UI Guidelines](./ui-guidelines.md), [Coding Guidelines](./coding-guidelines.md), and [Testing Guidelines](./testing-guidelines.md).

## Current State vs. Target

| Area | Today | Target |
|------|-------|--------|
| Data model | `items(id, name, created_at)` | `todos(id, title, due_date, completed, created_at)` |
| API | `GET/POST/DELETE /api/items` | `GET/POST/PUT/DELETE /api/todos` (FR API summary) |
| Seed data | 3 sample items inserted on startup | None (empty state shown) |
| Sorting | `created_at DESC` | `due_date ASC`, nulls last, then creation order |
| Frontend | Plain list, add and delete only | Add/edit form with due date, overdue highlight, empty state |
| UI | Default CRA styling | Dark Material-style theme, mobile-first |
| Tests | Unit tests for items only | Unit, integration, and 5-8 Playwright E2E tests |
| Tooling | No linter or formatter | Root ESLint + Prettier, Playwright config |

## Phase 1: Backend (FR-1, FR-2, FR-3, FR-4, FR-5, FR-6)

1. **Schema**: replace `items` with `todos`.
   - Columns: `id INTEGER PRIMARY KEY AUTOINCREMENT`, `title TEXT NOT NULL`, `due_date TEXT NULL` (`YYYY-MM-DD`), `completed INTEGER NOT NULL DEFAULT 0`, `created_at`.
   - Remove the seed data.
2. **Validation** (small helper module, e.g. `src/validation.js`, shared by POST and PUT):
   - Title: required, string, trimmed, non-empty. Add a max length (e.g. 200).
   - Due date: optional or `null`; must match `YYYY-MM-DD` and be a real calendar date.
   - Return `400` with `{ error: '<message>' }`.
3. **Endpoints**:
   - `GET /api/todos`: `ORDER BY due_date IS NULL, due_date ASC, id ASC`. The `id` tiebreaker preserves creation order.
   - `POST /api/todos`: create, return `201` with the new row.
   - `PUT /api/todos/:id`: partial update of `title` and/or `dueDate` (`null` clears it), re-validated. Return `404` if missing.
   - `DELETE /api/todos/:id`: `404` if missing.
   - Use parameterized prepared statements only. Validate `:id` as an integer.
4. **Response shape**: map `due_date` to `dueDate` in a single serializer (DRY).
5. **Structure**: if `app.js` grows, split into `routes/todos.js` and `db.js`. Do this only if it improves readability.
6. **Cleanup**: update the startup log in `index.js` to `/api/todos`. Keep `PORT = process.env.PORT || 3030`.

## Phase 2: Frontend (FR-1 to FR-6)

1. **Structure**: split `App.js` into small components and a data hook.
   - `TodoForm` (add and edit, shared validation display)
   - `TodoList`
   - `TodoItem` (view and inline-edit modes)
   - `useTodos` hook (fetch, add, update, delete, error state)
   - API calls in one module, `src/api/todos.js`. Use `axios`, which is already a dependency, or `fetch`, but pick one.
2. **Behavior**:
   - Add with title and optional due date. Show an inline validation message for an empty title.
   - Inline edit of title and due date with Save and Cancel.
   - Delete with an accessible icon button.
   - Empty state message.
   - Re-fetch or re-sort locally after every change so order always matches FR-4. Use one shared sort function if sorting client-side.
   - Display errors from the API in a user-friendly way. Do not swallow errors.
3. **Overdue**: highlight a task in red when `dueDate` is before today. Pair the color with text or an icon.

## Phase 3: UI and Styling

1. Add Roboto and a Material icon source in `index.html`. Update the page title and description to "TODO App". Keep the viewport meta tag.
2. Define the palette as CSS custom properties in `index.css` (`--bg #0D1B2A`, `--surface #1B263B`, `--primary #1E3A8A`, `--success #2E7D32`, `--danger #C62828`, `--text #E0E6ED`, `--text-secondary #9FB0C3`).
3. Components: outlined text fields with labels, filled buttons, card-style list items with elevation and hover feedback, and icon buttons (edit in blue, delete in red, complete in green).
4. Responsive: mobile-first with breakpoints at 600px and 1024px. The form is stacked on mobile and inline on larger screens. Content is centered with a max width of about 800px. Touch targets are at least 44x44px and there is no horizontal scroll.
5. Accessibility: visible focus outlines, `aria-label` on icon-only buttons, semantic HTML (`main`, `form`, `ul/li`, `label`), and a contrast check (WCAG AA) on all text and background pairs.

## Phase 4: Tooling

1. Add root ESLint and Prettier config (single quotes, semicolons, 2 spaces, trailing commas, 100 columns). Keep the CRA rules for the frontend.
2. Add `npm run lint` and `npm run format` scripts at the root.
3. Add `playwright.config.js` at the root:
   - Chromium only.
   - `testDir: tests/e2e`.
   - `webServer` entries for backend and frontend, with ports taken from `PORT` env vars and defaults 3030 and 3000.

## Phase 5: Tests

Follow the testing guidelines: each test is isolated, with setup and teardown, and repeatable.

1. **Backend unit** (`packages/backend/__tests__/`): validation helper (`validation.test.js`), serializer and sort behavior. Replace the items tests in `app.test.js`.
2. **Backend integration** (`packages/backend/__tests__/integration/todos-api.test.js`, Jest + Supertest):
   - Create with and without a due date.
   - Reject an empty title and an invalid date.
   - Update the title, update the due date, and clear the due date.
   - `404` on update and delete of a missing id.
   - Sort order: dated tasks ascending, undated tasks last, creation order on ties.
   - Reset the DB in `beforeEach` (`DELETE FROM todos` and reset the sequence).
3. **Frontend unit** (`packages/frontend/src/__tests__/`): one file per component and hook (`TodoForm.test.js`, `TodoItem.test.js`, `TodoList.test.js`, `useTodos.test.js`, `App.test.js`) with a mocked API module. Cover validation messages, edit and cancel, the empty state, and the overdue indicator.
4. **E2E** (`tests/e2e/`, Playwright, Page Object Model in `tests/e2e/pages/TodoPage.js`), 5-8 tests:
   1. Add a task with a due date and see it in the list.
   2. Reject an empty title with a validation message.
   3. Edit a title and due date.
   4. Cancel an edit and nothing changes.
   5. Delete a task and the empty state appears.
   6. List ordering by due date, with undated tasks last.
   7. Overdue task is highlighted.
   8. Layout works at a mobile viewport (no horizontal scroll).
   - Each test creates its own data (via the API) and cleans up after itself.

## Phase 6: Documentation

- Update `project-overview.md` and `README.md` for the TODO app, the `/api/todos` endpoints, and the new scripts.
- Keep `.github/copilot-instructions.md` links current, adding this plan if it is kept.

## Suggested Delivery Order

Each step is a small, focused commit with its tests passing.

1. Tooling (lint and format config).
2. Backend schema, validation, and endpoints, with unit and integration tests.
3. Frontend components, hook, and unit tests.
4. Theme and responsive styling.
5. Playwright config, page object, and E2E tests.
6. Docs updates.

## Open Questions for Review

1. **Completion**: the UI guidelines mention a green "complete" action and FR-1 says tasks are "not completed by default", but no functional requirement covers toggling completion. Should it be added as FR-7 with `PUT` support for `completed`? The plan assumes yes (the `completed` column and a toggle), pending confirmation.
2. **Persistence**: the DB is `:memory:`, so data resets on restart. Is that acceptable, or should it use a file-based SQLite DB?
3. **Sort control**: the UI guidelines mention a sort control, but FR-4 defines a fixed sort. Is a fixed ascending sort enough?
4. **HTTP client**: use `axios` (already installed) or native `fetch` (current code)?
5. **Date logic**: should "overdue" use the browser's local date? The plan assumes yes.
6. **Breaking change**: removing `/api/items` and its tests. Is that acceptable?
