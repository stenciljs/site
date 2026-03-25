---
title: Testing
sidebar_label: Overview
description: Testing overview.
slug: /testing-overview
---

# Testing

In order to ensure that your Stencil components work in the way you expect, Stencil supports a number of tools enabling unit, spec, component and end-to-end testing.

## Library Support

Stencil supports the following for testing components:

- [@stencil/vitest](./vitest/01-overview.md): First-class testing utilities for Stencil components powered by Vitest. Supports unit tests, spec tests with your choice of node DOM (jsdom, happy-dom, mock-doc), and browser tests with screenshot capabilities. **This is the recommended testing solution for most Stencil projects.**
- [@stencil/playwright](./playwright/01-overview.md): An automated end-to-end testing framework that can run across all major browsers. Use this for full application testing, routing tests, and scenarios requiring proper browser initialization.
- [Stencil Test Runner](./stencil-testrunner/01-overview.md) *(Deprecated)*: The legacy built-in test runner based on Jest v27-v29 and Puppeteer. This will be removed in Stencil v5. See the [migration guide](#migrating-from-stencil-test-runner) below.

## Migrating from Stencil Test Runner

The integrated Stencil Test Runner is deprecated as of Stencil v4.43 and will be removed in Stencil v5. We recommend migrating to the new testing tools:

- **For `--spec` style tests**: Migrate to [@stencil/vitest](./vitest/01-overview.md). It has a similar API to the current Jest integration but gives you far greater control. You can test against different bundles/outputs, test in a real browser (for accessibility tests, visual regressions, etc.), or pick your node-dom of choice (jsdom, happy-dom, or mock-doc). See the [migration guide](./vitest/07-migration.md) for detailed instructions.

- **For `--e2e` style tests**: Many library authors actually want "component" tests—isolated testing of components that run in a browser. For this, use [@stencil/vitest](./vitest/01-overview.md) with browser mode. For true end-to-end tests (routing, full applications, proper onload initialization), use [@stencil/playwright](./playwright/01-overview.md).
