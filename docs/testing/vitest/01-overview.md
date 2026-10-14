---
title: Vitest Overview
sidebar_label: Overview
description: First-class testing utilities for Stencil components powered by Vitest.
slug: /testing-vitest
---

# Overview

`@stencil/vitest` provides testing utilities for Stencil components, powered by [Vitest](https://vitest.dev/): a `render()` function, matchers for custom elements, and spies for events, methods, props, and lifecycle hooks.

Paired with `@stencil/unplugin`, which compiles your components as each test imports them, there's no Stencil build to run before your tests. The same test code runs in:

- **A real browser**, through Vitest's browser mode. Components get real layout, styling, and events, so this is the recommended setup.
- **Node**, with a simulated DOM (Stencil's mock-doc, jsdom, or happy-dom). Tests start faster and need no browser installed.

## Quick Start

The quickest way to set up is the wizard. Run it from your Stencil project:

```bash
stencil add @stencil/vitest
```

It asks whether your tests should run in a browser or in Node, and how components should be loaded, then installs the dependencies, writes `vitest.config.ts`, and adds `test` scripts to your `package.json`. Choose **Plugin (source)** when it asks how to load components, for the setup described on this page. The [`stencil init` wizard](../../getting-started/01-getting-started.md) offers the same steps when you create a project.

The rest of this section sets up browser tests by hand.

### 1. Install

```bash npm2yarn
npm install --save-dev @stencil/vitest @stencil/unplugin vitest @vitest/browser-playwright playwright
```

Then download the browser the tests run in:

```bash
npx playwright install chromium
```

### 2. Create `vitest.config.ts`

```typescript title="vitest.config.ts"
import { stencilVite } from '@stencil/unplugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [stencilVite()],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
  },
});
```

`stencilVite()` reads your `stencil.config.ts` and compiles each component when a test imports it.

### 3. Write Tests

Import the component's source file, then render it. Importing the file registers the custom element, so also import any other components that yours renders:

```tsx title="src/components/my-button/my-button.test.tsx"
import { render, h, describe, it, expect } from '@stencil/vitest';

import './my-button';

describe('my-button', () => {
  it('renders its label', async () => {
    const { root } = await render(<my-button label="Save" />);
    await expect(root).toEqualHtml(`
      <my-button class="hydrated">
        <mock:shadow-root>
          <button>SAVE</button>
        </mock:shadow-root>
      </my-button>
    `);
  });

  it('emits myPress when clicked', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(<my-button label="Save" />);
    const spy = spyOnEvent('myPress');

    root.shadowRoot?.querySelector('button')?.click();
    await waitForChanges();

    expect(spy).toHaveReceivedEventTimes(1);
  });
});
```

### 4. Run Tests

Add scripts to your `package.json`:

```json title="package.json"
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

## Next Steps

- [Configuration](./02-configuration.md): run tests in Node, in several browsers, or against your built output.
- [Writing Tests](./03-writing-tests.md) and the [API reference](./04-api.md).
- [Mocking & Spying](./05-mocking.md).

## Migration from Stencil Test Runner

If you're coming from the test runner built into Stencil v4, see the [Migration Guide](./07-migration.md). Existing `newSpecPage()` tests can keep running under Vitest.
