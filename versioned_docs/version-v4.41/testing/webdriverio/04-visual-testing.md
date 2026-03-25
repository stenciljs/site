---
title: Visual Testing
sidebar_label: Visual Testing
description: Visual Testing
slug: /testing/webdriverio/visual-testing
---

# Visual Testing

WebdriverIO supports [visual testing capabilities](https://webdriver.io/docs/visual-testing) out of the box through a plugin called [`@wdio/visual-service`](https://www.npmjs.com/package/@wdio/visual-service). It uses [ResembleJS](https://github.com/Huddle/Resemble.js) under the hood to do pixel perfect comparisons.

## Adding Visual Testing to your Setup

If you don't have a WebdriverIO project set up yet, please take a look at the set up instructions we provide on the [WebdriverIO Overview](./01-overview.md) page.

Once you are set up, add the visual plugin to your project via:

```bash npm2yarn
npm install --save-dev @wdio/visual-service
```

A plugin, also called [service](https://webdriver.io/docs/customservices) in WebdriverIO, has access to a variety of test lifecycle hooks to enable new functionality or integrate with another platform. To use a service, add it to your services list in your `wdio.conf.ts`:

```ts reference title="wdio.conf.ts"
https://github.com/webdriverio/component-testing-examples/blob/2de295ab568b5163e67d716156221578b6536d9d/stencil-component-starter/wdio.conf.ts#L119-L126)
```

As shown in the [Visual Testing](https://webdriver.io/docs/visual-testing/writing-tests/) WebdriverIO documentation, the service adds 4 new matchers to visually assert your application:

- `toMatchScreenSnapshot`: captures and compares the whole browser screen
- `toMatchElementSnapshot`: captures and compares the visual difference within the element boundaries
- `toMatchFullPageSnapshot`: captures and compares the whole document
- `toMatchTabbablePageSnapshot`: same as `toMatchFullPageSnapshot` with tab marks for accessibility testing

In the context of testing StencilJS components the best choice is to use `toMatchElementSnapshot` to verify a single component visually. Such a test may appear as follows:

```ts reference title="src/components/my-component/my-component.test.tsx"
https://github.com/webdriverio/component-testing-examples/blob/2de295ab568b5163e67d716156221578b6536d9d/stencil-component-starter/src/components/my-component/my-component.test.tsx#L20-L28
```

The screenshots will be generated locally and the baseline should be checked into your project, so that everyone running the tests visually, compare against the same assumptions. If a test is failing, e.g. we set the color of the text to a different color, WebdriverIO will let the test fail with the following message:

```
Expected image to have a mismatch percentage of 0%, but was 6.488%
Please compare the images manually and update the baseline if the new screenshot is correct.

Baseline: /stencil-project/__snapshots__/MyComponent-chrome-1200x1551-dpr-2.png
Actual Screenshot: /stencil-project/__snapshots__/.tmp/actual/MyComponent-chrome-1200x1551-dpr-2.png
Difference: /stencil-project/__snapshots__/.tmp/diff/MyComponent-chrome-1200x1551-dpr-2.png

See https://webdriver.io/docs/api/visual-regression.html for more information.
```

You can see the visual differences highlighted in `/stencil-project/__snapshots__/.tmp/diff` which can look as following:

![Example of visual difference](/img/testing/diff-example.png)

If you believe the visual changes are correct, update the baseline by moving the image from `stencil-project/__snapshots__/.tmp/actual` into the baseline directory.

For further information on Visual Testing in WebdriverIO visit their [documentation page](https://webdriver.io/docs/visual-testing).