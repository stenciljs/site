---
title: Vitest
position: 5
---

# Overview

[Vitest](https://vitest.dev/) is a popular and modern test framework for unit testing. You can use Vitest to test Stencil components in the browser using its [browser mode feature](https://vitest.dev/guide/browser.html).

:::caution
Vitest browser mode is an experimental feature and in early development. As such, it may not yet be fully optimized, and there may be some bugs or issues that have not yet been ironed out.
:::

## Set Up

To get started with Vitest, all you need to install it via:

```bash npm2yarn
npm install vitest @vitest/browser unplugin-stencil webdriverio
```

This command installs:

- `vitest`: the core test framework
- `@vitest/browser`: enables testing in browser environments
- `unplugin-stencil`: integrates Stencil's compiler with Vitest for seamless testing
- `webdriverio`: facilitates browser management for tests

Next, we create a Vitest configuration as following:

```ts title="vitest.config.ts"
import stencil from 'unplugin-stencil/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        browser: {
            enabled: true,
            headless: true,
            name: 'chrome'
        },
    },
    plugins: [stencil()]
})
```

This configuration enables tests to run in a headless Chrome browser.

## Writing Tests

Once you've setup Vitest you can start write your first test. In order to render a Stencil component into the browser, all you need to do is import the component and initiate an instance of the component on the page:

```ts title="src/components/my-component/my-component.test.ts"
import { expect, test } from 'vitest'

import '../src/components/my-component/my-component.js'

test('should render component correctly', async () => {
    const cmp = document.createElement('my-component')
    cmp.setAttribute('first', 'Stencil')
    cmp.setAttribute('last', `'Don't call me a framework' JS`)
    document.body.appendChild(cmp)

    await new Promise((resolve) => requestIdleCallback(resolve))
    expect(cmp.shadowRoot?.querySelector('div')?.innerText)
        .toBe(`Hello, World! I'm Stencil 'Don't call me a framework' JS`)
})
```

Lastly, let's add a Vitest script to our `package.json`:

```json
{
    "scripts": {
        "test": "vitest --run"
    },
}
```

Execute the tests using:

```bash npm2yarn
npm test
```

Expected output:

```
❯ npm test

> vitest@1.0.0 test
> vitest --run

The CJS build of Vite's Node API is deprecated. See https://vitejs.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.

 RUN  v1.5.0 /private/tmp/vitest
      Browser runner started at http://localhost:5173/

[19:39.9]  build, vitest, prod mode, started ...
[19:39.9]  transpile started ...
[19:40.0]  transpile finished in 72 ms
[19:40.0]  generate custom elements + source maps started ...
[19:40.1]  generate custom elements + source maps finished in 137 ms
[19:40.1]  build finished in 227 ms

 ✓ src/components/my-component/my-component.test.ts (1)
   ✓ should render component correctly

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  14:19:36
   Duration  3.19s (transform 0ms, setup 0ms, collect 721ms, tests 22ms, environment 0ms, prepare 0ms)

```

### Use JSX

The example above creates the Stencil instance using basic DOM primitives. If you prefer to use JSX also for rendering Stencil components in your test, just create a `jsx.ts` utility file with the following content:

```ts title="src/utils/jsx.ts"
export const createElement = (tag, props, ...children) => {
    if (typeof tag === 'function') {
        return tag(props, ...children)
    }
    const element = document.createElement(tag)

    Object.entries(props || {}).forEach(([name, value]) => {
        if (name.startsWith('on') && name.toLowerCase() in window) {
            element.addEventListener(name.toLowerCase().substr(2), value)
        } else {
            element.setAttribute(name, value.toString())
        }
    })

    children.forEach((child) => {
        appendChild(element, child)
    })

    return element
}

export const appendChild = (parent, child) => {
    if (Array.isArray(child)) {
        child.forEach((nestedChild) => appendChild(parent, nestedChild))
    } else {
        parent.appendChild(child.nodeType ? child : document.createTextNode(child))
    }
}

export const createFragment = (_, ...children) => {
    return children
}
```

Now update your test, import the `createElement` method and tell the JSX engine to use that method for rendering the JSX snippet. Our test should look as follows:

```tsx title="src/components/my-component/my-component.test.tsx"
/** @jsx createElement */
import { expect, test } from 'vitest'

import { createElement } from '../../utils/jsx'
import './my-component.js'

test('should render the component with jsx', async () => {
    const cmp = <my-component first="Stencil" last="'Don't call me a framework' JS"></my-component>
    document.body.appendChild(cmp)
    await new Promise((resolve) => requestIdleCallback(resolve))
    expect(cmp.shadowRoot?.querySelector('div')?.innerText)
        .toBe(`Hello, World! I'm Stencil 'Don't call me a framework' JS`)
})
```

__Note:__ the `/** @jsx createElement */` at the top of the file tells JSX which rendering function it should use to parse the JSX snippet.

## Limitations

Be aware of the following limitations, when using Vitest as test framework for testing Stencil components:

- __Mocking not yet supported__: you can't mock any files or dependencies when running with the Stencil browser feature
- __No auto-waits__: in order to ensure that the component is rendered, you have to manually wait via, e.g. calling `await new Promise((resolve) => requestIdleCallback(resolve))`