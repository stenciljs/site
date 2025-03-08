---
title: Mocking
sidebar_label: Mocking
description: Mocking
slug: /mocking
---

# Mocking

Since Stencil's testing capabilities are built on top of Jest, the mocking features of Jest can be utilized to mock out libraries or certain parts of your code. For further information have a look at the [Jest docs](https://jestjs.io/docs/en/manual-mocks).

## Mocking a Library

To create a mock for a library that is imported from `node_modules`, you can simply create a folder `__mocks__` on the same directory level as `node_modules` (usually in your project's root folder), then create a file in there with the same name as the package you want to mock, and that mock will automatically be applied.

For example, if you want to mock `md5`, you'd create a file `__mocks__/md5.ts` with the following content:

```ts
export default () => 'fakehash';
```

:::note
If you want to mock a scoped package like `@capacitor/core`, you'll have to create the file as `__mocks__/@capacitor/core.ts`.
:::

## Mocking Your Own Code

To create a mock for some of your own code, you'll have to create the mocks folder on a different layer.

Let's say you have a file `src/helpers/utils.ts` that exposes a `getRandomInt` helper, and a service that provides a function which uses this helper.

```tsx
// src/helpers/utils.ts

export const getRandomInt = (min: number, max: number) =>
  Math.round(Math.random() * (max - min)) + min;
```

```tsx
// src/services/foo.ts

import { getRandomInt } from '../helpers/utils';

export const bar = () => getRandomInt(0, 10);
```

To mock this function, you create a file `src/helpers/__mocks__/utils.ts` and write your mock in that file.

```tsx
// src/helpers/__mocks__/utils.ts

export const getRandomInt = () => 42;
```

Because Jest only auto-mocks node modules, you'll also have to let your test know that you want it to apply that mock, by calling `jest.mock()`.

```tsx
// src/foo.spec.ts

jest.mock('./helpers/utils');

import { bar } from './services/foo';

describe('Foo', () => {
  it('bar()', () => {
    expect(bar()).toBe(42);
  });
});
```

:::note
It's important that you call `jest.mock('...')` before your import.
:::

Instead of creating a file in a `__mocks__` folder, there is an alternative approach of providing a mock: the `jest.mock()` function takes a module factory function as an optional second argument. The following test will work the same as the one before, without having to create a `src/helpers/__mocks__/utils.ts` file.

```tsx
// src/foo.spec.ts

jest.mock('./helpers/utils', () => ({
	getRandomInt: () => 42,
}));

import { foo } from './services/foo';

describe('Foo', () => {
  it('bar()', () => {
    expect(bar()).toBe(42);
  });
});
```

## Mocking in E2E Tests

If you use `newE2EPage` in an end-to-end test, your component's code will be executed in a browser context (Stencil will launch a headless Chromium instance using Puppeteer). However your mocks will only be registered in the Node.js context, which means that your component will still call the original implementation. If you need to mock something in the browser context, you can either have a look at [using Jest with Puppeteer](https://jestjs.io/docs/en/puppeteer), or possibly switch to using `newSpecPage`, which creates a virtual (mocked) DOM in the node context.

```tsx
// src/components/foo/foo.tsx

import { h, Component, Method } from '@stencil/core';
import { getRandomInt } from '../../helpers/utils';

@Component({ tag: 'foo-component' })
export class Foo {
	@Method()
	async bar() {
		return getRandomInt(0, 10);
	}

	render() {
		return <div />;
	}
}
```

```tsx
// src/foo.e2e.ts

jest.mock('./helpers/utils', () => ({
	getRandomInt: () => 42,
}));

import { newSpecPage } from '@stencil/core/testing';
import { Foo } from './components/foo/foo';

describe('Foo', () => {
	it('bar()', async () => {
		const page = await newSpecPage({
			components: [Foo],
			html: '<foo-component></foo-component>',
		});
		const foo = page.body.querySelector('foo-component');

		if (!foo) {
			throw new Error('Could not find Foo component');
		}

		expect(await foo.bar()).toBe(42);
	});
});
```
