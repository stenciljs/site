---
title: CLI
sidebar_label: CLI
description: Using the stencil-test CLI for running tests.
slug: /testing-vitest-cli
---

# CLI

The `stencil-test` CLI wraps both Stencil builds with Vitest testing, providing a seamless testing experience.

## Setup

Add the following scripts to your `package.json`:

```json title="package.json"
{
  "scripts": {
    "test": "stencil-test",
    "test:watch": "stencil-test --watch",
    "test:e2e": "stencil-test --project browser",
    "test:spec": "stencil-test --project spec",
    "test:coverage": "stencil-test --coverage"
  }
}
```

## Usage

### Basic Commands

```bash
# Build once, test once
stencil-test

# Watch mode (rebuilds on component changes, interactive Vitest)
stencil-test --watch

# Watch mode with dev server
stencil-test --watch --serve

# Production build before testing
stencil-test --prod

# Test with coverage
stencil-test --coverage

# Test specific files
stencil-test button.spec.ts

# Test specific project
stencil-test --project browser
```

### Running Specific Test Projects

If you have multiple test projects configured (unit, spec, browser), you can run them individually:

```bash
# Run only spec tests
stencil-test --project spec

# Run only browser tests
stencil-test --project browser

# Run only unit tests
stencil-test --project unit
```

### Watch Mode

Watch mode provides an interactive testing experience:

```bash
# Basic watch mode
stencil-test --watch

# Watch with dev server (useful for browser tests)
stencil-test --watch --serve
```

In watch mode:
- Component changes trigger automatic rebuilds
- Test file changes trigger automatic re-runs
- Vitest's interactive mode allows filtering and re-running tests

### Production Builds

Test against production builds to ensure your components work correctly when optimized:

```bash
stencil-test --prod
```

## CLI Options

The `stencil-test` CLI supports most Stencil CLI options and all Vitest CLI options.

### Stencil Options

| Option | Description |
| ------ | ----------- |
| `--prod` | Run a production build before testing |
| `--serve` | Start a dev server alongside tests |
| `--port <number>` | Specify the dev server port |

For full Stencil CLI options, see the [Stencil CLI documentation](../../core/cli.md).

### Vitest Options

| Option | Description |
| ------ | ----------- |
| `--watch` | Enable watch mode |
| `--coverage` | Enable code coverage |
| `--project <name>` | Run specific test project |
| `--reporter <name>` | Specify test reporter |

For full Vitest CLI options, see the [Vitest CLI documentation](https://vitest.dev/guide/cli.html).

## Global Variables

The `stencil-test` CLI exposes global variables that can be accessed in your tests:

| Global | Type | Description |
| ------ | ---- | ----------- |
| `__STENCIL_PROD__` | `boolean` | `true` when `--prod` flag is passed |
| `__STENCIL_SERVE__` | `boolean` | `true` when `--serve` flag is passed |
| `__STENCIL_PORT__` | `string` | Port number when `--port` is specified |

### Using Global Variables

```tsx
describe('my-component', () => {
  it('works in production build', async () => {
    if (__STENCIL_PROD__) {
      console.log('Running tests against production build');
    }
    // ... test code
  });
});
```

```tsx
describe('integration tests', () => {
  it('can fetch from dev server', async () => {
    if (__STENCIL_SERVE__) {
      const baseUrl = `http://localhost:${__STENCIL_PORT__ || '3333'}`;
      const response = await fetch(`${baseUrl}/api/data`);
      // ... assertions
    }
  });
});
```

### TypeScript Support

Add to your `tsconfig.json` for type definitions:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "types": ["@stencil/vitest/globals"]
  }
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml title=".github/workflows/test.yml"
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test -- --coverage
      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
```

### Running Browser Tests in CI

For browser tests, ensure you have the necessary browser dependencies:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
```
