# Playwright Tests

This directory contains end-to-end tests using Playwright for the English Learning Platform.

## Prerequisites

1. **Backend must be running**: The backend Django server should be running on `http://localhost:8000`
2. **Frontend will start automatically**: The test configuration will automatically start the Next.js dev server

## Running Tests

### Run all tests (headless)
```bash
npm run test
# or
yarn test
```

### Run tests with UI mode (interactive)
```bash
npm run test:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Debug tests
```bash
npm run test:debug
```

## Test Files

- `login.spec.ts` - Tests for the login and registration functionality
  - Login form display
  - Invalid credentials handling
  - Successful login with username
  - Login with email (backend supports email login)
  - Registration form validation

## Test Credentials

The tests use the following credentials:
- **Username**: `tutor`
- **Password**: `Maitland@2025`
- **Email**: `test@gmail.com` (for email-based login test)

## Configuration

The Playwright configuration is in `playwright.config.ts` at the project root. It:
- Automatically starts the dev server before tests
- Uses Chromium by default
- Takes screenshots on failure
- Collects traces when retrying failed tests

## Viewing Test Results

After running tests, view the HTML report:
```bash
npx playwright show-report
```

## Writing New Tests

Create new test files in the `tests/` directory following the pattern:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/your-page');
    // Your test code
  });
});
```
