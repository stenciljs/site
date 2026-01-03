---
title: Unit Testing
sidebar_label: Unit Testing
description: Unit Testing
slug: /unit-testing
---

# Unit Testing

Stencil makes it easy to unit test components and app utility functions using [Jest](https://jestjs.io/). Unit tests validate the code in isolation. Well written tests are fast, repeatable, and easy to reason about.

To run unit tests, run `stencil test --spec`. Files ending in `.spec.ts` will be executed.


## newSpecPage()

In order to unit test a component as rendered HTML, tests can use `newSpecPage()` imported from `@stencil/core/testing`. This testing utility method is similar to `newE2EPage()`, however, `newSpecPage()` is much faster since it does not require a full [Puppeteer](https://pptr.dev/) instance to be running. Please see the [newE2EPage()](./05-e2e-testing.md) docs for more information about complete End-to-end testing with Puppeteer.

Below is a simple example where `newSpecPage()` is given one component class which was imported, and the initial HTML to use for the test. In this example, when the component `MyCmp` renders it sets its text content as "Success!". The matcher `toEqualHtml()` is then used to ensure the component renders as expected.

```typescript
import { newSpecPage } from '@stencil/core/testing';
import { MyCmp } from '../my-cmp';

it('should render my component', async () => {
  const page = await newSpecPage({
    components: [MyCmp],
    html: `<my-cmp></my-cmp>`,
  });
  expect(page.root).toEqualHtml(`
    <my-cmp>Success!</my-cmp>
  `);
});
```

The example below uses the template option to test the component

```tsx title="mycmp.spec.tsx"
// Since the 'template' argument to `newSpecPage` is using jsx syntax, this should be in a .tsx file.
import { h } from '@stencil/core';
import { newSpecPage } from '@stencil/core/testing';
import { MyCmp } from '../my-cmp';

it('should render my component', async () => {
  const greeting = 'Hello World';
  const page = await newSpecPage({
    components: [MyCmp],
    template: () => (<my-cmp greeting={greeting}></my-cmp>),
  });
  expect(page.root).toEqualHtml(`
    <my-cmp>Hello World</my-cmp>
  `);
});
```

You render functional components without defining them in the `components` list, e.g.:

```tsx title="mycmp.spec.tsx"
import { Fragment, h } from '@stencil/core';
import { newSpecPage } from '@stencil/core/testing';
import { MyFunctionalComponent } from '../my-functional-cmp';

it('should render my component', async () => {
  /**
   * or define functional components directly in your test
   */
  const AnotherFunctionalComponent = (props: any, children: typeof Fragment) => (
    <section>{children}</section>
  );

  const page = await newSpecPage({
    components: [],
    template: () => (
      <AnotherFunctionalComponent>
        <MyFunctionalComponent>Hello World!</MyFunctionalComponent>
      </AnotherFunctionalComponent>
    ),
  });
  expect(page.root).toEqualHtml(`
    <section>
      <div>
        Hello World!
      </div>
    </section>
  `);
});
```

:::note

Declaring Stencil class components directly within class files is not supported. If you need such a component for your tests, we recommend to put this into an extra fixture file.

:::

### Spec Page Options

The `newSpecPage(options)` method takes an options argument to help write tests:

| Option | Description |
|--------|-------------|
| `components` | An array of components to test. Component classes can be imported into the spec file, then their reference should be added to the `component` array in order to be used throughout the test. Child components should also be imported. For example, if component Foo uses component Bar then both Foo and Bar should be imported *Required* |
| `html` | The initial HTML used to generate the test. This can be useful to construct a collection of components working together, and assign HTML attributes. This value sets the mocked `document.body.innerHTML`. |
| `template` | The initial JSX used to generate the test. Use `template` when you want to initialize a component using their properties, instead of their HTML attributes. It will render the specified template (JSX) into `document.body`. |
| `autoApplyChanges` | By default, any changes to component properties and attributes must call `page.waitForChanges()` in order to test the updates. As an option, `autoApplyChanges` continuously flushes the queue in the background. Defaults to  `false` |
| `cookie` | Sets the mocked `document.cookie`. |
| `direction` | Sets the mocked `dir` attribute on `<html>`. |
| `language` | Sets the mocked `lang` attribute on `<html>`. |
| `referrer` | Sets the mocked `document.referrer`. |
| `supportsShadowDom` | Manually set if the mocked document supports Shadow DOM or not. Defaults to `true` |
| `userAgent` | Sets the mocked `navigator.userAgent`. |
| `url` | Sets the mocked browser's `location.href`. |


### Spec Page Results

The returned "page" object from `newSpecPage()` contains the initial results from the first render. It's also important to note that the returned page result is a `Promise`, so for convenience it's recommended to use async/await.

The most useful property on the page results would be `root`, which is for convenience to find the first root component in the document. For example, if a component is nested in many `<div>` elements, the `root` property goes directly to the component being tested in order to skip the query selector boilerplate code.

| Result | Description |
|--------|-------------|
| `body` | Mocked testing `document.body`. |
| `doc` | Mocked testing `document`. |
| `root` | The first component found within the mocked `document.body`. If a component isn't found, then it'll return `document.body.firstElementChild`.  |
| `rootInstance` | Similar to `root`, except returns the component instance. If a root component was not found it'll return `null`. |
| `setContent(html)` | Convenience function to set `document.body.innerHTML` and `waitForChanges()`. Function argument should be an html string. |
| `waitForChanges()` | After changes have been made to a component, such as a update to a property or attribute, the test page does not automatically apply the changes. In order to wait for, and apply the update, call `await page.waitForChanges()`. |
| `win` | Mocked testing `window`. |


## Testing Component Class Logic

For simple logic only testing, unit tests can instantiate a component by importing the class and constructing it manually. Since Stencil components are plain JavaScript objects, you can create a new component and execute its methods directly.

```typescript
import { MyToggle } from '../my-toggle.tsx';

it('should toggle the checked property', () => {
  const toggle = new MyToggle();

  expect(toggle.checked).toBe(false);

  toggle.someMethod();

  expect(toggle.checked).toBe(true);
});
```
