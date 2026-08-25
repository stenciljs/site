---
title: Playwright Overview
sidebar_label: Overview
---

:::note
The Stencil Playwright adapter is currently an experimental package. Breaking changes may be introduced at any time.

The Stencil Playwright adapter is designed to only work with **version 4.13.0 and higher** of Stencil!
:::

[Playwright](https://playwright.dev/) is an automated end-to-end testing framework built to run on all modern browser engines and operating systems.
Playwright leverages the DevTools protocol to provide reliable tests that run in actual browsers.

## Set Up

To add Playwright to an existing Stencil project, leverage the [Stencil Playwright testing adapter](https://www.npmjs.com/package/@stencil/playwright). This
is a tool built by the Stencil team to help Stencil and Playwright work better together. The best part is you'll write your tests using the same APIs
as defined and documented by Playwright. So, be sure to [check out their documentation](https://playwright.dev/docs/writing-tests) for help writing your first tests!

To install the Stencil Playwright adapter in an existing Stencil project, follow these steps:

1. Install the necessary dependencies:

   ```bash npm2yarn
   npm i @stencil/playwright @playwright/test --save-dev
   ```

1. Install the Playwright browser binaries:

   ```bash
   npx playwright install
   ```

1. Create a Playwright config at the root of your Stencil project:

   ```ts title="playwright.config.ts"
   import { expect } from '@playwright/test';
   import { matchers, createConfig } from '@stencil/playwright';

   // Add custom Stencil matchers to Playwright assertions
   expect.extend(matchers);

   export default createConfig({
     // Overwrite Playwright config options here
   });
   ```

   The `createConfig()` function is a utility that will create a default Playwright configuration based on your project's Stencil config. Read
   more about how to use this utility in the [API docs](./03-api.md#createconfig-function).

   :::note
   For `createConfig()` to work correctly, your Stencil config must be named either `stencil.config.ts` or `stencil.config.js`.
   :::

1. update your project's `tsconfig.json` to add the `ESNext.Disposable` option to the `lib` array:

   ```ts title="tsconfig.json"
   {
     lib: [
       ...,
       "ESNext.Disposable"
     ],
     ...
   }
   ```

   :::note
   This will resolve a build error related to `Symbol.asyncDispose`. If this is not added, tests may fail to run since the Stencil dev server will be unable
   to start due to the build error.
   :::

1. Ensure the Stencil project has a [`www` output target](../../output-targets/www.md). Playwright relies on pre-compiled output running in a dev server
   to run tests against. When using the `createConfig()` helper, a configuration for the dev server will be automatically created based on
   the Stencil project's `www` output target config and [dev server config](../../config/dev-server.md). If no `www` output target is specified,
   tests will not be able to run.

1. Add the `copy` option to the `www` output target config:

   ```ts title="stencil.config.ts"
   {
      type: 'www',
      serviceWorker: null,
      copy: [{ src: '**/*.html' }, { src: '**/*.css' }]
   }
   ```

   This will clone all HTML and CSS files to the `www` output directory so they can be served by the dev server. If you put all testing related
   files in specific directory(s), you can update the `copy` task glob patterns to only copy those files:

   ```ts title="stencil.config.ts"
   {
      type: 'www',
      serviceWorker: null,
      copy: [{ src: '**/test/*.html' }, { src: '**/test/*.css' }]
   }
   ```

   :::note
   If the `copy` property is not set, you will not be able to use the `page.goto` testing pattern!
   :::

1. Test away! Check out the [e2e testing page](./02-e2e-testing.md) for more help getting started writing tests.

## Migrating to Playwright

Coming from Stencil v4's integrated test runner (`stencil test --e2e`, Puppeteer-based)? That runner is removed in v5 — Playwright is now the e2e testing tool. Add a Playwright CLI call to your project's `package.json` test script:

```json title="package.json"
{
  "scripts": {
    "test.e2e": "playwright test"
  }
}
```
