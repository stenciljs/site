---
title: Vitest Overview
sidebar_label: Overview
description: First-class testing utilities for Stencil components powered by Vitest.
slug: /testing-vitest
---

# Overview

`@stencil/vitest` provides first-class testing utilities for Stencil components, powered by [Vitest](https://vitest.dev/).

This package offers a comprehensive testing solution that supports:
- **Unit tests** in a Node environment for testing pure functions and logic
- **Spec tests** using a Node DOM of your choice (mock-doc, jsdom, or happy-dom)
- **Browser tests** using real browsers via Playwright or WebdriverIO for true integration testing, accessibility tests, and visual regression testing

## Quick Start

### 1. Install

```bash npm2yarn
npm install --save-dev @stencil/vitest vitest
```

For browser testing, also install a browser provider:

```bash npm2yarn
npm install --save-dev @vitest/browser-playwright
# or
npm install --save-dev @vitest/browser-webdriverio
```

### 2. Create `vitest.config.ts`

```typescript title="vitest.config.ts"
import { defineVitestConfig } from '@stencil/vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineVitestConfig({
  stencilConfig: './stencil.config.ts',
  test: {
    projects: [
      // Unit tests - node environment for functions / logic
      {
        test: {
          name: 'unit',
          include: ['src/**/*.unit.{ts,tsx}'],
          environment: 'node',
        },
      },
      // Spec tests - via a node DOM of your choice
      {
        test: {
          name: 'spec',
          include: ['src/**/*.spec.{ts,tsx}'],
          environment: 'stencil',
          setupFiles: ['./vitest-setup.ts'],
        },
      },
      // Browser tests
      {
        test: {
          name: 'browser',
          include: ['src/**/*.test.{ts,tsx}'],
          setupFiles: ['./vitest-setup.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
```

### 3. Load Your Components

Create a setup file to load your Stencil components:

```typescript title="vitest-setup.ts"
// Load Stencil components.
// Adjust according to your build output of choice
await import('./dist/test-components/test-components.esm.js');

export {};

// Note: you may need `buildDist: true` in your stencil.config
// or `--prod` to use an output other than the browser lazy-loader
```

### 4. Write Tests

```tsx title="src/components/my-button/my-button.spec.tsx"
import { render, h, describe, it, expect } from '@stencil/vitest';

describe('my-button', () => {
  it('renders with text', async () => {
    const { root, waitForChanges } = await render(<my-button label="Click me" />);
    root.click();
    await waitForChanges();
    await expect(root).toEqualHtml(`
      <my-button class="hydrated">
        <mock:shadow-root>
          <button class="button button--secondary button--small" type="button">
            <slot></slot>
          </button>
        </mock:shadow-root>
        Small
      </my-button>
    `);
  });
});
```

### 5. Run Tests

Add the following scripts to your `package.json`:

```json title="package.json"
{
  "scripts": {
    "test": "stencil-test",
    "test:watch": "stencil-test --watch",
    "test:e2e": "stencil-test --project browser",
    "test:spec": "stencil-test --project spec"
  }
}
```

## Migration from Stencil Test Runner

If you're migrating from the Stencil Test Runner, see the [Migration Guide](./07-migration.md) for detailed instructions on updating your tests.
