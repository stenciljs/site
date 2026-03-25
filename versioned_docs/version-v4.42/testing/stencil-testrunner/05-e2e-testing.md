---
title: End-to-end Testing
sidebar_label: End-to-end Testing
description: End-to-end Testing
slug: /end-to-end-testing
---

# End-to-end Testing

E2E tests verify your components in a real browser. For example, when `my-component` has the X attribute, the child component then renders the text Y, and expects to receive the event Z. By using Puppeteer for rendering tests (rather than a Node environment simulating how a browser works), your end-to-end tests are able to run within an actual browser in order to give better results.

Stencil provides many utility functions to help test [Jest](https://jestjs.io/) and [Puppeteer](https://pptr.dev/). For example, a component's shadow dom can be queried and tested with the Stencil utility functions built on top of Puppeteer. Tests can not only be provided mock HTML content, but they can also go to URLs of your app which Puppeteer is able to open up and test on Stencil's dev server.

End-to-end tests require a fresh build, dev-server, and puppeteer browser instance created before the tests can actually run. With the added build complexities, the `stencil test` command is able to organize the build requirements beforehand.

To run E2E tests, run `stencil test --e2e`. By default, files ending in `.e2e.ts` will be executed.

Stencil's E2E test are provided with the following API, available via `@stencil/core/testing`.
Most methods are async and return Promises. Use `async` and `await` to declutter your tests.

- `newE2EPage`: Should be invoked at the start of each test to instantiate a new `E2EPage` object

`E2EPage` is a wrapper utility to Puppeteer to simplify writing tests. Some helpful methods on `E2EPage` include:

- `find(selector: string)`: Find an element that matches the selector. Similar to `document.querySelector`.
- `setContent(html: string)`: Sets the content of a page. This is where you would include the markup of the component under test.
- `goto(url: string)`: open a page served by the dev server. URL has to start with `/`.
- `setViewport(viewport: Viewport)`: Updates the page to emulate a device display. This is helpful for testing a component's behavior in different orientations and viewport sizes.
- `waitForChanges()`: Both Stencil and Puppeteer have an asynchronous architecture, which is a good thing for performance. Since all calls are async, it's required that `await page.waitForChanges()` is called when changes are made to components.

An example E2E test might have the following boilerplate:

```typescript
import { newE2EPage } from '@stencil/core/testing';

describe('example', () => {
  it('should render a foo-component', async () => {
    const page = await newE2EPage();
    await page.setContent(`<foo-component></foo-component>`);
    const el = await page.find('foo-component');
    expect(el).not.toBeNull();
  });
});
```

## Options

The `newE2EPage` accepts the following options:

- `html`: a HTML template, e.g. containing your Stencil component to be rendered in the browser (same as calling `page.setContent('...')`)
- `url`: opens a url to open a page served by the dev server (option will be ignored if `html` is set, same as calling `page.goto('...')`)
- `failOnConsoleError`: If set to `true`, Stencil will throw an error if a console error occurs (default: `false`)
- `failOnNetworkError`: If set to `true`, Stencil will throw an error if a network request fails (default: `false`)
- `logFailingNetworkRequests`: If set to `true`, Stencil will log failing network requests (default: `false`)

## Example End-to-end Test

```typescript
import { newE2EPage } from '@stencil/core/testing';

it('should create toggle, unchecked by default', async () => {
  const page = await newE2EPage();

  await page.setContent(`
    <ion-toggle class="pretty-toggle"></ion-toggle>
  `);

  const ionChange = await page.spyOnEvent('ionChange');

  const toggle = await page.find('ion-toggle');

  expect(toggle).toHaveClasses(['pretty-toggle', 'hydrated']);

  expect(toggle).not.toHaveClass('toggle-checked');

  toggle.setProperty('checked', true);

  await page.waitForChanges();

  expect(toggle).toHaveClass('toggle-checked');

  expect(ionChange).toHaveReceivedEventDetail({
    checked: true,
    value: 'on'
  });
});
```

## E2E Testing Recipes

### Find an element in the Shadow DOM

Use the "piercing" selector `>>>` to query for an object inside a component's shadow root:

```typescript
const el = await page.find('foo-component >>> .close-button');
```

By default Stencil will look into all shadow roots to find the element. However if you want to restrict your query by specifying the shadow root of a particular component, you can chain multiple deep selectors within the same query, e.g.:

```typescript
const el = await page.find('foo-component >>> div bar-component >>> div');
```

### Set a @Prop() on a component

Use `page.$eval` (part of the Puppeteer API) to set props or otherwise manipulate a component:

```typescript
// create a new puppeteer page
// load the page with html content
await page.setContent(`
      <prop-cmp></prop-cmp>
    `);

// select the "prop-cmp" element
// and run the callback in the browser's context
await page.$eval('prop-cmp', (elm: any) => {
  // within the browser's context
  // let's set new property values on the component
  elm.first = 'Marty';
  elm.lastName = 'McFly';
});

// we just made a change and now the async queue need to process it
// make sure the queue does its work before we continue
await page.waitForChanges();
```

### Set a @Prop() on a component using an external reference

Because `page.$eval` has an isolated scope, you’ll have to explicitly pass in outside references otherwise you’ll an encounter an `undefined` error. This is useful in case you’d like to import data from another file, or re-use mock data across multiple tests in the same file.

```typescript
const props = {
  first: 'Marty',
  lastName: 'McFly',
};

await page.setContent(`<prop-cmp></prop-cmp>`);

await page.$eval('prop-cmp',
  (elm: any, { first, lastName }) => {
    elm.first = first;
    elm.lastName = lastName;
  },
  props 
);

await page.waitForChanges();
```


### Call a @Method() on a component

```typescript
const elm = await page.find('method-cmp');
elm.setProperty('someProp', 88);
const methodRtnValue = await elm.callMethod('someMethod');
```

### Type inside an input field

```typescript
const page = await newE2EPage({
  html: `
      <dom-interaction></dom-interaction>
    `
});

const input = await page.find('dom-interaction >>> .input');

let value = await input.getProperty('value');
expect(value).toBe('');

await input.press('8');
await input.press('8');
await input.press(' ');

await page.keyboard.down('Shift');
await input.press('KeyM');
await input.press('KeyP');
await input.press('KeyH');
await page.keyboard.up('Shift');
```

### Checking the text of a rendered component

```typescript
await page.setContent(`
      <prop-cmp first="Marty" last-name="McFly"></prop-cmp>
    `);

const elm = await page.find('prop-cmp >>> div');
expect(elm).toEqualText('Hello, my name is Marty McFly');
```

### Checking a component's HTML

For shadowRoot content:

```typescript
        expect(el.shadowRoot).toEqualHtml(`<div>
        <div class=\"nav-desktop\">
          <slot></slot>
        </div>
      </div>`);
    });
```

For non-shadow content:

```typescript
        expect(el).toEqualHtml(`<div>
        <div class=\"nav-desktop\">
          <slot></slot>
        </div>
      </div>`);
    });
```

### Emulate a display

If you need to test how a component behaves with a particular viewport you can set the viewport width and height like so:

```ts
const page = await new E2EPage();

await page.setViewport({
  width: 900,
  height: 600
});

// Query an element that is hidden by a media query when width < 901px
const el = await page.find('.desktop');
expect(el).not.toBeDefined();
```

### Asynchronous Global Script

If you are using an asynchronous [global script](/config/01-overview.md#globalscript), it may happen that your Stencil components haven't been hydrated at the time you are trying to interact with them. In this case it is recommend to wait for the hydration flag to be set on the component, e.g.:

```ts
const page = await newE2EPage();
await page.setContent(`<my-cmp></my-cmp>`);
await page.waitForSelector('.hydrated')
```

__Note:__ the hydrate selector may be different depending on whether you have a custom [`hydratedFlag`](/config/01-overview.md#hydratedflag) options set.

## Caveat about e2e tests automation on CD/CI

As it is a fairly common practice, you might want to automatically run your end-to-end tests on your Continuous Deployment/Integration (CD/CI) system. However, some environments might need you to tweak your configuration at times. If so, the `config` object in your `stencil.config.ts` file has a `testing` attribute that accepts parameters to modify how Headless Chrome is actually used in your pipeline.

Example of a config you might need in a Gitlab CI environment :

```typescript
export const config: Config = {
  namespace: 'Foo',
  testing: {
    /**
     * Gitlab CI doesn't allow sandbox, therefor this parameters must be passed to your Headless Chrome
     * before it can run your tests
     */
    browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
  outputTargets: [
    { type: 'dist' },
    {
      type: 'www',
    },
  ],
};
```

Check [the testing config docs](./02-config.md) to learn more about the possibilities on this matter. 
