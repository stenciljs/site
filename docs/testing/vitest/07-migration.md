---
title: Migration Guide
sidebar_label: Migration
description: Migrate from Stencil Test Runner to @stencil/vitest.
slug: /testing-vitest-migration
---

# Migration Guide

Stencil v5 removes the integrated test runner (`stencil test`, with Jest and Puppeteer). This guide moves its tests to [Vitest](https://vitest.dev/).

There are two ways to migrate spec tests, and one project can use both:

- **[Keep your `newSpecPage()` tests](#keeping-newspecpage-tests)** and run them under Vitest. This is the quickest route for a large existing suite.
- **[Move to `render()`](#moving-to-render)** from `@stencil/vitest`. Tests written this way run in real browsers as well as Node, and it's the recommended API for new tests.

E2E tests written with `newE2EPage()` become [browser tests](#e2e-tests).

## Keeping `newSpecPage()` Tests

`newSpecPage()` is still exported from `@stencil/core/testing`. The `stencilSpecPage()` plugin from `@stencil/unplugin` compiles your components so that it works under Vitest.

Install the dependencies:

```bash npm2yarn
npm install --save-dev vitest @stencil/unplugin @stencil/vitest
```

Then create a Vitest config:

```typescript title="vitest.config.ts"
import { stencilSpecPage } from '@stencil/unplugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [stencilSpecPage()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

`globals: true` provides `describe`, `it`, and `expect` without imports, as Jest did.

The setup file registers Stencil's matchers, such as `toEqualHtml()` and `toHaveClass()`, which the old runner registered for you:

```typescript title="vitest.setup.ts"
import '@stencil/vitest';
```

Your tests keep their `newSpecPage()` calls and imports. What does change is anything that used Jest's own API, which has a Vitest equivalent under `vi`:

| Jest | Vitest |
| ---- | ------ |
| `jest.fn()` | `vi.fn()` |
| `jest.spyOn()` | `vi.spyOn()` |
| `jest.mock()` | `vi.mock()` |
| `jest.useFakeTimers()` | `vi.useFakeTimers()` |

See Vitest's [guide to migrating from Jest](https://vitest.dev/guide/migration.html#jest) for the full list of differences.

## Moving to `render()`

Follow the [Quick Start](./01-overview.md#quick-start) to install and configure `@stencil/vitest`, then convert your tests.

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

import './my-component';

describe('my-component', () => {
  it('renders', async () => {
    const { root } = await render(<my-component />);
    await expect(root).toEqualHtml(`
      <my-component class="hydrated">
        <mock:shadow-root>
          <div>Hello, World!</div>
        </mock:shadow-root>
      </my-component>
    `);
  });
});
```

### E2E Tests

`newE2EPage()` and its Puppeteer browser are removed. The same `render()` tests run in a real browser when your Vitest config enables [browser mode](./02-configuration.md#browser-tests).

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

import './my-component';

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

To test whole pages, such as routing between them, use [`@stencil/playwright`](../playwright/01-overview.md) instead.

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
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

If you split your tests into [projects](./02-configuration.md#test-projects), run one with `vitest run --project browser`.

## Key Differences

### Components Are Imported

`render()` takes no list of component classes. Each test file imports the source files of the components it uses, which registers them:

```tsx
import './my-component';
```

A component that's rendered by another one needs importing too.

### JSX-Based Rendering

Use JSX directly instead of HTML strings (though HTML strings are still supported):

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

## Troubleshooting

### Components Not Rendering

An element that stays empty and never gets the `hydrated` class isn't registered. Check that the test file imports that component's source file.

### Waiting for Updates

Always await `waitForChanges()` after modifying component state:

```tsx
root.value = 'new value';
await waitForChanges();
```
