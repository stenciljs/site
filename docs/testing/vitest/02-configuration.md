---
title: Vitest Configuration
sidebar_label: Configuration
description: Configure @stencil/vitest for your project.
slug: /testing-vitest-configuration
---

# Configuration

`@stencil/vitest` is configured through Vitest's own config file, `vitest.config.ts`. The [`stencil add @stencil/vitest` wizard](./01-overview.md#quick-start) writes one for you, from the options on this page. Refer to [Vitest's documentation](https://vitest.dev/config/) for every available option.

In each setup on this page, the `stencilVite()` plugin from `@stencil/unplugin` compiles your components as tests import them, so tests always run against your current source and no Stencil build is needed first.

## Browser Tests

Vitest's [browser mode](https://vitest.dev/guide/browser/) runs your tests in a real browser. Components get real layout, CSS, and events, which makes this the best choice for most component tests:

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

### Multiple Browsers

Add an entry to `instances` for each browser to test in:

```typescript
browser: {
  enabled: true,
  provider: playwright(),
  headless: true,
  instances: [
    { browser: 'chromium' },
    { browser: 'firefox' },
    { browser: 'webkit' },
  ],
},
```

## Node Tests

Tests can also run in Node, against a simulated DOM. They start faster than browser tests and need no browser installed, but a simulated DOM has no layout and only partial CSS support.

Set `environment` to `'stencil'`:

```typescript title="vitest.config.ts"
import { stencilVite } from '@stencil/unplugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [stencilVite()],
  test: {
    include: ['src/**/*.spec.{ts,tsx}'],
    environment: 'stencil',
  },
});
```

### Choosing a DOM Environment

The `stencil` environment uses Stencil's own mock-doc by default. Choose another DOM implementation with `environmentOptions`:

```typescript
test: {
  include: ['src/**/*.spec.{ts,tsx}'],
  environment: 'stencil',
  environmentOptions: {
    stencil: {
      domEnvironment: 'jsdom',
    },
  },
},
```

| Environment | Description |
| ----------- | ----------- |
| `mock-doc` | Stencil's own lightweight DOM implementation (default) |
| `jsdom` | Full-featured DOM implementation with good compatibility |
| `happy-dom` | Faster alternative to jsdom |

:::note
When using `jsdom` or `happy-dom`, make sure to install the respective packages:

```bash npm2yarn
npm install --save-dev jsdom
# or
npm install --save-dev happy-dom
```
:::

## Test Projects

Vitest's [projects](https://vitest.dev/guide/projects) let one config run several kinds of test, each with its own files and environment. A common split is plain unit tests for functions, Node tests, and browser tests:

```typescript title="vitest.config.ts"
import { stencilVite } from '@stencil/unplugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      // Functions and logic, with no DOM
      {
        test: {
          name: 'unit',
          include: ['src/**/*.unit.ts'],
          environment: 'node',
        },
      },
      // Components in a simulated DOM
      {
        plugins: [stencilVite()],
        test: {
          name: 'spec',
          include: ['src/**/*.spec.{ts,tsx}'],
          environment: 'stencil',
        },
      },
      // Components in a real browser
      {
        plugins: [stencilVite()],
        test: {
          name: 'browser',
          include: ['src/**/*.test.{ts,tsx}'],
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

Run a single project with `vitest --project browser`.

## Coverage

Because components are compiled from source, Vitest's [coverage](https://vitest.dev/guide/coverage) reports map straight to your component files. Install a provider:

```bash npm2yarn
npm install --save-dev @vitest/coverage-v8
```

Then run `vitest run --coverage`.

## TypeScript

For your editor and `tsc` to type-check the JSX in your tests, they need your project's `components.d.ts`. A Stencil build writes it, or `stencilVite()` can keep it up to date while tests run:

```typescript
plugins: [stencilVite({ types: true })],
```

## Testing Your Built Output

The setups above test components compiled from source. To test the files you publish instead, build first and load the build in a setup file. The `stencil-test` [CLI](./06-cli.md) does both steps, running a Stencil build and then Vitest.

Wrap your config in `defineVitestConfig`, which applies settings from your Stencil config, and add the setup file:

```typescript title="vitest.config.ts"
import { defineVitestConfig } from '@stencil/vitest/config';

export default defineVitestConfig({
  stencilConfig: './stencil.config.ts',
  test: {
    include: ['src/**/*.spec.{ts,tsx}'],
    environment: 'stencil',
    setupFiles: ['./vitest-setup.ts'],
  },
});
```

```typescript title="vitest-setup.ts"
// Load your components' lazy-loader build.
// The path is dist/loader-bundle/<namespace>/<namespace>.js
await import('./dist/loader-bundle/test-components/test-components.js');

export {};
```

Tests then use components without importing them, as the setup file has registered them all.

To load a [`standalone`](../../output-targets/main/standalone.md) output in a project that also has `loader-bundle`, set `skipInDev: false` on `standalone` in your Stencil config, or run `stencil-test --prod`. Development builds skip it otherwise. A project with only `standalone` builds it in development too.

`stencil-test` also defines a few [global variables](./06-cli.md#global-variables) for your tests. For their types, add `@stencil/vitest/globals` to your `tsconfig.json`:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "types": ["@stencil/vitest/globals"]
  }
}
```
