---
title: End-to-End Testing
sidebar_label: E2E Testing
---

When it comes to writing end-to-end tests using the Stencil Playwright adapter, the best advice we can give is to leverage
[Playwright documentation](https://playwright.dev/docs/writing-tests). The adapter is set up in a way so that developers will use the
same public APIs with as little Stencil nuances as possible.

## Writing Tests

As far as writing the actual tests goes, the most important thing to be aware of for tests to run correctly is to import the `test` function from
`@stencil/playwright`, **not** directly from `@playwright/test`:

```ts
// THIS IS CORRECT
import { test } from '@stencil/playwright';

// THIS IS NOT!!
// import { test } from '@playwright/test';
```

The adapter package extends Playwright's stock `test` function to provide additional fixtures and handle nuances related to web component hydration. More
information is available in the [API documentation](./03-api.md#test-function).

### Testing Patterns

#### `page.goto()`

The `goto()` method allows tests to load a pre-defined HTML template. This pattern is great if a test file has many tests to execute that all use the same HTML code
or if additional `script` or `style` tags need to be included in the HTML. However, with this pattern, developers are responsible for defining the necessary `script`
tags pointing to the Stencil entry code (so all web components are correctly loaded and registered).

For the following snippets, we'll imagine this is the simplified file structure for a Stencil project:

```tree
stencil-project-root
└── src
    └── components
        ├── my.component.tsx
        └── test <-- directory containing test files
            ├── my-component.e2e.ts
            └── my-component.e2e.html
```

```ts title="stencil.config.ts"
export const config: Config = {
  namespace: 'test-app',
  outputTargets: [
    {
      type: 'www',
      serviceWorker: null,
      copy: [{ src: '**/test/*.html' }, { src: '**/test/*.css' }],
    },
  ],
};
```

```html title="my-component.e2e.html"
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf8" />

    <!-- Replace with the path to your entrypoint -->
    <script src="../../../build/test-app.esm.js" type="module"></script>
    <script src="../../../build/test-app.js" nomodule></script>
  </head>
  <body>
    <my-component first="Stencil"></my-component>
  </body>
</html>
```

In the above snippet, where it says "replace with the path to your entrypoint", the `src` attributes for the `script` tags should be the _relative_ path from the `www` output
target's [output directory (`dir` option)](../../output-targets/www.md#config) to the namespaced entry file. The entry file will have the name
`<namespace>.esm.js` for ESM output and `<namespace>.js` for CJS output. The "namespace" value is the kebab-case value of the `namespace` from your
[Stencil config](../../config/01-overview.md#namespace).

```ts title="my-component.e2e.ts"
import { expect } from '@playwright/test';
import { test } from '@stencil/playwright';

test.describe('my-component', () => {
  test('should render the correct name', async ({ page }) => {
    // The path here is the path to the www output relative to the dev server root directory
    await page.goto('/components/my-component/test/my-component.e2e.html');

    // Rest of test
    const component = await page.locator('my-component');
    await expect(component).toHaveText(`Hello World! I’m Stencil`);
  });
});
```

In the above snippet, the path string passed to `page.goto()` should be the _absolute_ path to the HTML file from the
[dev server's served directory](../../config/dev-server.md#root).

#### `page.setContent()`

The `setContent()` method allows tests to define their own HTML code on a test-by-test basis. This pattern is helpful if the HTML for a test is small or to
avoid affecting other tests using the `page.goto()` pattern and modifying a shared HTML template file. With this pattern, the `script` tags pointing to Stencil
entry code will be automatically injected into the generated HTML.

```ts title="my-component.e2e.ts"
import { expect } from '@playwright/test';
import { test } from '@stencil/playwright';

test.describe('my-component', () => {
  test('should render the correct name', async ({ page }) => {
    await page.setContent('<my-component first="Stencil"></my-component>');

    // Rest of test
  });
});
```

#### `page.waitForChanges()`

The `waitForChanges()` method is a utility for waiting for Stencil components to rehydrate after an operation that results in a re-render:

```ts title="my-component.e2e.ts"
import { expect } from '@playwright/test';
import { test } from '@stencil/playwright';

test.describe('my-component', () => {
  test('should render the correct name', async ({ page }) => {
    // Assume we have a template setup with the `my-component` component and a `button`
    await page.goto('/my-component/my-component.e2e.html');

    const button = page.locator('button');
    // Assume clicking the button changes the `@Prop()` values on `my-component`
    button.click();
    await page.waitForChanges();
  });
});
```

## Running Tests

To run tests, either run `npx playwright test` from the **root** of the Stencil project, or update the project's `test` script in the `package.json` file to run the
Playwright command.

By default, the adapter will execute all tests in a project with a `.e2e.ts` file suffix. This can be modified by passing the
[`testDir`](https://playwright.dev/docs/api/class-testproject#test-project-test-dir) and/or [`testMatch`](https://playwright.dev/docs/api/class-testproject#test-project-test-match)
configuration options as overrides to `createConfig()`.

## Debugging

Playwright offers several strategies for debugging e2e tests. See their [debugging documentation](https://playwright.dev/docs/running-tests#debugging-tests)
for more information of the tools available.

Tests can also be launched in a headed mode. This is disabled by default, but can be enabled [in the Playwright config](https://playwright.dev/docs/api/class-testoptions#test-options-headless)
or with the `--headed` CLI flag. Running tests in a headed mode will open a browser tab for each test.

## Screenshot Testing

Playwright also has support for screenshot (or visual) testing. This functionality is available out of the box. Read the Playwright docs on
[screenshots](https://playwright.dev/docs/screenshots) and [performing visual comparisons](https://playwright.dev/docs/test-snapshots#generating-screenshots)
for more information on using these APIs.
