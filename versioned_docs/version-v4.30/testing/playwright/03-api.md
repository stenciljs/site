---
title: Playwright Adapter API
sidebar_label: API
---

## `createConfig` Function

**Signature:** `createConfig(overrides?: Partial<PlaywrightTestConfig>): Promise<PlaywrightTestConfig>`

Returns a [Playwright test configuration](https://playwright.dev/docs/test-configuration#introduction).

`overrides`, as the name implies, will overwrite the default configuration value(s) if supplied. These values can include any valid Playwright config option. Changing
option values in a nested object will use a "deep merge" to combine the default and overridden values. So, creating a config like the following:

```ts title="playwright.config.ts"
import { expect } from '@playwright/test';
import { matchers, createConfig } from '@stencil/playwright';

expect.extend(matchers);

export default createConfig({
  // Change which test files Playwright will execute
  testMatch: '*.spec.ts',

  webServer: {
    // Only wait max 30 seconds for server to start
    timeout: 30000,
  },
});
```

Will result in:

```ts
{
  testMatch: '*.spec.ts',
  use: {
    baseURL: 'http://localhost:3333',
  },
  webServer: {
    command: 'stencil build --dev --watch --serve --no-open',
    url: 'http://localhost:3333/ping',
    reuseExistingServer: !process.env.CI,
    // Only timeout gets overridden, not the entire object
    timeout: 30000,
  },
}
```

:::caution
Although any valid Playwright config option can be overridden, there are a few properties that may cause issues with tests if changed. In particular,
these are the [`webServer`](https://playwright.dev/docs/api/class-testconfig#test-config-web-server) and [`baseUrl`](https://playwright.dev/docs/test-webserver#adding-a-baseurl)
options. These properties are automatically generated based on the Stencil project's config (analyzing the output targets and dev server configuration),
so be cautious when overriding these values as it can result in issues with Playwright connecting to the Stencil dev server.
:::

## `test` Function

`test` designates which tests will be executed by Playwright. See the [Playwright API documentation](https://playwright.dev/docs/api/class-test#test-call) regarding usage.

This package modifies the [`page` fixture](#page-fixture) and offers a [`skip` utility](#skip-function) as discussed below.

## `page` Fixture

The page fixture is a class that allows interacting with the current test's browser tab. In addition to the [default Playwright Page API](https://playwright.dev/docs/api/class-page),
Stencil extends the class with a few additional methods:

- `waitForChanges()`: Waits for Stencil components to re-hydrate before continuing.
- `spyOnEvent()`: Creates a new EventSpy and listens on the window for an event to emit.

## `skip` Function

The `skip()` function is used to skip test execution for certain browsers or [component modes](https://stenciljs.com/docs/styling#style-modes):

```ts
test('my-test', ({ page, skip }) => {
    // Skip tests for certain browsers
    skip.browser('firefox', 'This behavior is not available on Firefox');

    // Skip tests for certain modes
    skip.mode('md', 'This behavior is not available in Material Design');

    ...
})
```

## Matchers

Playwright comes with [a set of matchers to do test assertions](https://playwright.dev/docs/test-assertions). However, the Stencil Playwright adapter
has additional custom matchers.

| Assertion                      | Description                                                                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `toHaveFirstReceivedEvent`     | Ensures that the first event received matches a specified [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail) payload. |
| `toHaveNthReceivedEventDetail` | Ensures that the nth event received matches a specified [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail) payload.   |
| `toHaveReceivedEvent`          | Ensures an event has been received at least once.                                                                                                            |
| `toHaveReceviedEventDetail`    | Ensures an event has been received with a specified [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail) payload.       |
| `toHaveReceivedEventTimes`     | Ensures an event has been received a certain number of times.                                                                                                |
