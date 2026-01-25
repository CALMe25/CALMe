# Suggestion: Add production build smoke test to CI

## Problem

The CI pipeline did not catch the production build runtime error where the app displayed a white page due to incorrect chunk splitting. The build succeeded, but the app failed at runtime with JavaScript errors like "Cannot set properties of undefined (setting 'Activity')".

## Root cause

Current CI only runs `npm run build` which verifies the build compiles, but doesn't verify the built assets actually work when loaded in a browser.

## Suggested solution

Add a production smoke test that:

1. Builds the app
2. Serves the production build
3. Loads the page in a headless browser
4. Checks for JavaScript errors
5. Verifies critical UI elements render

### Option 1: Playwright smoke test

```yaml
# .github/workflows/ci.yml
- name: Build
  run: npm run build

- name: Install Playwright
  run: npx playwright install chromium

- name: Smoke test production build
  run: npx playwright test tests/smoke.spec.ts
```

```typescript
// tests/smoke.spec.ts
import { test, expect } from '@playwright/test';

test('production build loads without errors', async ({ page }) => {
  const errors: string[] = [];

  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  await page.goto('/');

  // Wait for app to hydrate
  await expect(page.locator('h1')).toBeVisible();

  // Check no JavaScript errors
  expect(errors).toEqual([]);
});
```

### Option 2: Lightweight check with serve + curl

```yaml
- name: Smoke test production build
  run: |
    npm run preview &
    sleep 5
    # Check page returns 200 and has expected content
    curl -f http://localhost:4173 | grep -q "CALMe"
    # Check no inline script errors in HTML
    ! curl -s http://localhost:4173 | grep -q "undefined"
```

### Option 3: Vite preview with Puppeteer

```yaml
- name: Smoke test
  run: |
    npm run preview &
    npx wait-on http://localhost:4173
    node scripts/smoke-test.js
```

```javascript
// scripts/smoke-test.js
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const errors = [];
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:4173');
  await page.waitForSelector('h1');

  await browser.close();

  if (errors.length > 0) {
    console.error('JavaScript errors:', errors);
    process.exit(1);
  }

  console.log('Smoke test passed');
})();
```

## Recommendation

**Option 1 (Playwright)** is the best choice because:

- Already widely adopted for E2E testing
- Built-in support for error detection
- Can run in CI with minimal setup
- Can expand to full E2E test suite later

## Additional improvements

1. **Bundle analysis**: Add `rollup-plugin-visualizer` to track chunk sizes over time
2. **Build warnings as errors**: Fail CI on any Vite/Rollup warnings
3. **Chunk size limits**: Enforce maximum chunk sizes in CI

```yaml
- name: Check bundle sizes
  run: |
    npm run build
    # Fail if any chunk exceeds 500KB
    find dist/assets -name "*.js" -size +500k | grep -q . && exit 1 || exit 0
```
