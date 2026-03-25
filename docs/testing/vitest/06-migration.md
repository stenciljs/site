---
title: Migration Guide
sidebar_label: Migration
description: Migrate from Stencil Test Runner to @stencil/vitest.
slug: /testing-vitest-migration
---

# Migration Guide

This guide helps you migrate from the Stencil Test Runner to `@stencil/vitest`.

## Why Migrate?

The integrated Stencil Test Runner is deprecated as of Stencil v4.43 and will be removed in Stencil v5. The `@stencil/vitest` package offers several advantages:

- **Flexible DOM environments**: Choose between mock-doc, jsdom, or happy-dom
- **True browser testing**: Run tests in real browsers, not just Puppeteer
- **Modern test runner**: Vitest provides faster test execution and better DX
- **Better isolation**: Test against actual build outputs rather than internal compilation
- **Active maintenance**: Vitest is actively developed with regular updates

## Installation

First, install the new dependencies:

```bash npm2yarn
npm install --save-dev @stencil/vitest vitest
```

For browser testing:

```bash npm2yarn
npm install --save-dev @vitest/browser-playwright
```

## Configuration Changes

### Before: stencil.config.ts

```typescript
// stencil.config.ts
export const config: Config = {
  testing: {
    testPathIgnorePatterns: ['node_modules'],
    setupFilesAfterEnv: ['./test-setup.ts'],
  },
};
```

### After: vitest.config.ts

```typescript
// vitest.config.ts
import { defineVitestConfig } from '@stencil/vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineVitestConfig({
  stencilConfig: './stencil.config.ts',
  test: {
    projects: [
      {
        test: {
          name: 'spec',
          include: ['src/**/*.spec.{ts,tsx}'],
          environment: 'stencil',
          setupFiles: ['./vitest-setup.ts'],
        },
      },
      {
        test: {
          name: 'browser',
          include: ['src/**/*.e2e.{ts,tsx}'],
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

## Test File Changes

### Spec Tests

**Before:**

```tsx
import { newSpecPage } from '@stencil/core/testing';
import { MyComponent } from './my-component';

describe('my-component', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MyComponent],
      html: '<my-component></my-component>',
    });
    expect(page.root).toEqualHtml(`
      <my-component>
        <mock:shadow-root>
          <div>Hello, World!</div>
        </mock:shadow-root>
      </my-component>
    `);
  });
});
```

**After:**

```tsx
import { render, h, describe, it, expect } from '@stencil/vitest';

describe('my-component', () => {
  it('renders', async () => {
    const { root } = await render(<my-component />);
    await expect(root).toEqualHtml(`
      <my-component>
        <mock:shadow-root>
          <div>Hello, World!</div>
        </mock:shadow-root>
      </my-component>
    `);
  });
});
```

### E2E Tests

**Before:**

```tsx
import { newE2EPage } from '@stencil/core/testing';

describe('my-component e2e', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<my-component></my-component>');

    const element = await page.find('my-component');
    expect(element).toHaveClass('hydrated');
  });

  it('handles click', async () => {
    const page = await newE2EPage();
    await page.setContent('<my-component></my-component>');

    const spy = await page.spyOnEvent('myEvent');
    const button = await page.find('my-component >>> button');
    await button.click();

    expect(spy).toHaveReceivedEvent();
  });
});
```

**After:**

```tsx
import { render, h, describe, it, expect } from '@stencil/vitest';

describe('my-component e2e', () => {
  it('renders', async () => {
    const { root } = await render(<my-component />);
    expect(root).toHaveClass('hydrated');
  });

  it('handles click', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(<my-component />);

    const spy = spyOnEvent('myEvent');
    const button = root.shadowRoot?.querySelector('button');
    button?.click();
    await waitForChanges();

    expect(spy).toHaveReceivedEvent();
  });
});
```

## API Mapping

### Test Setup

| Stencil Test Runner | @stencil/vitest |
| ------------------- | --------------- |
| `newSpecPage({ components, html })` | `render(<component />)` |
| `newE2EPage()` | `render(<component />)` with browser project |
| `page.setContent(html)` | `render(<component />)` |
| `page.waitForChanges()` | `waitForChanges()` |

### Element Access

| Stencil Test Runner | @stencil/vitest |
| ------------------- | --------------- |
| `page.root` | `root` |
| `page.find('selector')` | `root.querySelector('selector')` |
| `page.find('component >>> shadow')` | `root.shadowRoot?.querySelector('shadow')` |
| `page.findAll('selector')` | `root.querySelectorAll('selector')` |

### Events

| Stencil Test Runner | @stencil/vitest |
| ------------------- | --------------- |
| `page.spyOnEvent('event')` | `spyOnEvent('event')` |
| `spy.events` | `spy.events` |
| `spy.firstEvent` | `spy.firstEvent` |
| `spy.lastEvent` | `spy.lastEvent` |

### Matchers

Most matchers work the same way:

| Matcher | Notes |
| ------- | ----- |
| `toEqualHtml()` | Same API |
| `toEqualLightHtml()` | Same API |
| `toEqualText()` | Same API |
| `toHaveClass()` | Same API |
| `toHaveClasses()` | Same API |
| `toHaveAttribute()` | Same API |
| `toHaveReceivedEvent()` | Same API |
| `toHaveReceivedEventTimes()` | Same API |
| `toHaveReceivedEventDetail()` | Same API |

## Package.json Scripts

### Before

```json
{
  "scripts": {
    "test": "stencil test --spec",
    "test:watch": "stencil test --spec --watchAll",
    "test:e2e": "stencil test --e2e"
  }
}
```

### After

```json
{
  "scripts": {
    "test": "stencil-test",
    "test:watch": "stencil-test --watch",
    "test:spec": "stencil-test --project spec",
    "test:e2e": "stencil-test --project browser"
  }
}
```

## Key Differences

### No Component Registration

With `@stencil/vitest`, you don't need to pass component classes to the render function. Components are loaded via your setup file:

```typescript
// vitest-setup.ts
await import('./dist/test-components/test-components.esm.js');
```

### JSX-Based Rendering

Use JSX directly instead of HTML strings:

```tsx
// Before
const page = await newSpecPage({
  components: [MyComponent],
  html: '<my-component first="John" last="Doe"></my-component>',
});

// After
const { root } = await render(<my-component first="John" last="Doe" />);
```

### Shadow DOM Queries

Use standard DOM APIs instead of special selectors:

```tsx
// Before
const button = await page.find('my-component >>> button');

// After
const button = root.shadowRoot?.querySelector('button');
```

### Async Assertions

Some assertions are now async:

```tsx
// Before
expect(element).toEqualHtml('...');

// After
await expect(element).toEqualHtml('...');
```

## Troubleshooting

### Components Not Rendering

Ensure your setup file imports the correct build output:

```typescript
// Check that the path matches your actual build output
await import('./dist/test-components/test-components.esm.js');
```

### TypeScript Errors

Add the type definitions to your tsconfig.json:

```json
{
  "compilerOptions": {
    "types": ["@stencil/vitest/globals"]
  }
}
```

### Shadow DOM Access

Remember to use optional chaining when accessing shadow DOM:

```tsx
const button = root.shadowRoot?.querySelector('button');
```

### Waiting for Updates

Always await `waitForChanges()` after modifying component state:

```tsx
root.value = 'new value';
await waitForChanges();
```
