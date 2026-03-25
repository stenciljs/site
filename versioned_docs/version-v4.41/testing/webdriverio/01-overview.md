---
title: WebdriverIO Overview
sidebar_label: Overview
---

# Overview

WebdriverIO is a progressive automation framework built to automate modern web and mobile applications. It simplifies the interaction with your project and provides a set of plugins that help you create a scalable, robust and stable test suite.

Testing with WebdriverIO has the following advantages:

- __Cross Browser Support__: WebdriverIO is designed to support all platforms, either on desktop or mobile. You can run tests on actual browser your users are using, including covering different versions of them.
- __Real User Interaction__: Interaction with elements in WebdriverIO through the WebDriver protocol is much closer to native user-triggered interactions than what can be achieved with emulated DOM environments (such as JSDom or Stencil's own Mock-Doc).
- __Web Platform Support__: Running tests in actual browsers allows you to tap into the latest Web Platform features for testing your components, often not available when using virtual DOM environments.
- __Real Environments__: Run your tests in an environment that your users are using and not somewhere that re-implements web standards with polyfills like JSDOM.

## Set Up

To get started with WebdriverIO, all you need to do is to run their project starter:

```bash npm2yarn
npm init wdio@latest .
```

This will initiate WebdriverIO's configuration wizard that walks you through the setup. Make sure you select the following options when walking through it:

- __What type of testing would you like to do?__ Select either:
  - `Component or Unit Testing - in the browser` if you are interested adding unit tests for your components
  - `E2E Testing - of Web or Mobile Applications` if you like to test your whole application 
  
  You can always add either of them later on
- __Which framework do you use for building components?__: if you select _Component or Unit Testing_ make sure to select `StencilJS` as preset so WebdriverIO knows how to compile your components properly

The following questions can be answered as desired. Once setup the wizard has created a `wdio.conf.ts` file and a `wdio` script to run your tests.

:::info CJS vs. ESM

WebdriverIO's generated config and test files use ESM syntax for imports. If you generated a project via the [`create-stencil`](https://www.npmjs.com/package/create-stencil) starter package your project is likely setup for CommonJS. To avoid any incompatibility issues, we recommend to rename your `wdio.conf.ts` to `wdio.conf.mts` and update the `wdio` script in your `package.json`.

:::

:::info Type Clashes

It's possible that you run into TypeScript issues as WebdriverIO uses Mocha for component testing and Stencil Jest. Both register the same globals, e.g. `it` which causes type clashes. To fix these we recommend to add the following to your `tsconfig.json`:

```json
  "types": ["jest"]
```

This will ensure that Jest types will be preferred.

:::

You should be able to run your first test on the auto-generated test file via:

```bash npm2yarn
npm run wdio
```

More information on setting up WebdriverIO can be found in their [documentation](https://webdriver.io/docs/component-testing/stencil).

## Integration with Stencil

If you have been using Stencil's test runner for unit or end-to-end tests to can continue to do so. For basic implementation details that don't require any web platform features, running tests through the Stencil test runner might still be the faster choice, since no browser needs to be spawned. However you can also migrate over to only one single framework one test at a time.

We recommend to create a new NPM script for running both, Stencil and WebdriverIO tests, starting with Stencil tests first as they are likely to run faster. In your `package.json` this can be structured like so:

```json title="package.json"
{
    "scripts:": {
        "test.e2e": "stencil test && wdio run wdio.conf.ts"
    }
}
```

Make sure that each test runner picks up their respective tests by defining the `testRegex` property in your Stencil config, e.g.:

```ts title="stencil.config.ts"
import { Config } from '@stencil/core';

export const config: Config = {
  // ...
  testing: {
    testRegex: '(/__tests__/.*|\\.?(spec))\\.(ts|js)$',
  },
};
```

This will make Stencil pick up all files ending with `.spec.ts` or `.spec.js` while WebdriverIO picks up tests ending with `.test.ts`.