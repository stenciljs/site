---
title: Vitest Configuration
sidebar_label: Configuration
description: Configure @stencil/vitest for your project.
slug: /testing-vitest-configuration
---

# Configuration

`@stencil/vitest` uses Vitest's configuration system with additional Stencil-specific options. Refer to [Vitest's documentation](https://vitest.dev/config/) for all available configuration options.

## Basic Configuration

Create a `vitest.config.ts` file in your project root:

```typescript title="vitest.config.ts"
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
    ],
  },
});
```

## Test Projects

The recommended approach is to use Vitest's projects feature to separate different types of tests:

### Unit Tests

For testing pure functions and logic without DOM:

```typescript
{
  test: {
    name: 'unit',
    include: ['src/**/*.unit.{ts,tsx}'],
    environment: 'node',
  },
}
```

### Spec Tests

For testing components in a simulated DOM environment:

```typescript
{
  test: {
    name: 'spec',
    include: ['src/**/*.spec.{ts,tsx}'],
    environment: 'stencil',
    setupFiles: ['./vitest-setup.ts'],
  },
}
```

### Browser Tests

For testing components in a real browser:

```typescript
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
}
```

## Choosing a Node DOM Environment

For spec tests, you can choose between different DOM implementations using `environmentOptions`:

```typescript
{
  test: {
    name: 'spec',
    include: ['src/**/*.spec.{ts,tsx}'],
    environment: 'stencil',
    environmentOptions: {
      stencil: {
        // *note: jsdom and happy-dom require additional dependencies*
        domEnvironment: 'jsdom'
      },
    },
  },
}
```

### Available DOM Environments

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

## Multiple Browser Testing

Test across multiple browsers in your browser project:

```typescript
{
  test: {
    name: 'browser',
    include: ['src/**/*.test.{ts,tsx}'],
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
  },
}
```

## Setup Files

The setup file is used to load your Stencil components before tests run:

```typescript title="vitest-setup.ts"
// Load Stencil components.
// Adjust according to your build output of choice
await import('./dist/test-components/test-components.esm.js');

export {};
```

### Build Output Options

Depending on your Stencil configuration, you may need to adjust how components are loaded:

- **Default (lazy-load)**: Works with the standard dev build
- **Production build**: Use `--prod` flag to generate production bundles
- **Custom elements**: If using the `dist-custom-elements` output target, adjust the setup file accordingly. If you wish to test this output in `--watch` mode, set `buildDist: true` in your stencil.config

## TypeScript Configuration

Add the global type definitions to your `tsconfig.json`:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "types": ["@stencil/vitest/globals"]
  }
}
```

This provides type definitions for global variables like `__STENCIL_PROD__`, `__STENCIL_SERVE__`, and `__STENCIL_PORT__`.
