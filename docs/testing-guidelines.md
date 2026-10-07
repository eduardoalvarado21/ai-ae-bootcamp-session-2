# Testing Guidelines

## General Principles

- All new features should include appropriate tests
- Tests should be maintainable and follow best practices
- All tests must be isolated and independent - each test should set up its own data and not rely on other tests
- Setup and teardown hooks are required - tests must succeed on multiple runs

## Unit Tests

- Use Jest to test individual functions and React components in isolation
- Use the naming convention `*.test.js` or `*.test.ts`
- Backend unit tests go in `packages/backend/__tests__/`
- Frontend unit tests go in `packages/frontend/src/__tests__/`
- Name test files to match what they test (e.g., `app.test.js` for testing `app.js`)

## Integration Tests

- Use Jest + Supertest to test **backend API endpoints** with real HTTP requests
- Place integration tests in `packages/backend/__tests__/integration/`
- Use the naming convention `*.test.js` or `*.test.ts`
- Name files based on what they test (e.g., `todos-api.test.js` for TODO API endpoints)

## End-to-End (E2E) Tests

- Use Playwright (the required framework) to test **complete UI workflows** through browser automation
- Place E2E tests in `tests/e2e/`
- Use the naming convention `*.spec.js` or `*.spec.ts`
- Name files based on the user journey they test (e.g., `todo-workflow.spec.js`)
- Playwright tests must use one browser only
- Playwright tests must use the Page Object Model (POM) pattern for maintainability
- Limit E2E tests to 5-8 critical user journeys - focus on happy paths and key edge cases, not exhaustive coverage

## Port Configuration

Always use environment variables with sensible defaults for port configuration. This allows CI/CD workflows to dynamically detect ports.

- Backend: `const PORT = process.env.PORT || 3030;`
- Frontend: React's default port is 3000, but can be overridden with the `PORT` environment variable
