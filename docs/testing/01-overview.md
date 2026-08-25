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

Coming from Stencil v4's integrated test runner (`--spec`/`--e2e`, Jest and Puppeteer)? That runner is removed in v5 — see the [vitest migration guide](./vitest/07-migration.md).
