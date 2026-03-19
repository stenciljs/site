---
title: Module Bundling
sidebar_label: Bundling
description: Module Bundling
slug: /module-bundling
---

# Module Bundling

Stencil uses [Rollup](https://rollupjs.org/guide/en/) under the hood to bundle your components. This guide will explain and recommend certain workarounds for some of the most common bundling issues you might encounter.

## One Component Per Module

For Stencil to bundle your components most efficiently, you must declare a single component (class decorated with `@Component`) per *TypeScript* file, and the component itself **must** have a unique `export`. By doing so, Stencil is able to easily analyze the entire component graph within the app, and best understand how components should be bundled together. Under-the-hood it uses the Rollup bundler to efficiently bundled shared code together. Additionally, lazy-loading is a default feature of Stencil, so code-splitting is already happening automatically, and only dynamically importing components which are being used on the page.

Modules that contain a component are entry-points, which means that no other module should import anything from them.

The following example is **NOT** valid:

```tsx title="src/components/my-cmp.tsx"
// This module has a component, you cannot export anything else
export function someUtilFunction() {
  console.log('do stuff');
}

@Component({
  tag: 'my-cmp'
})
export class MyCmp {}
```

In this case, the compiler will emit an error that looks like this:

```bash
[ ERROR ]  src/components/my-cmp.tsx:4:1
        To allow efficient bundling, modules using @Component() can only have a single export which is the component
        class itself. Any other exports should be moved to a separate file. For further information check out:
        https://stenciljs.com/docs/module-bundling

  L4:  export function someUtilFunction() {
  L5:   console.log('do stuff');
```

The solution is to move any shared functions or classes to a different `.ts` file, like this:

```tsx title="src/utils.ts"
export function someUtilFunction() {
  console.log('do stuff');
}
```

```tsx title="src/components/my-cmp.tsx"
import { someUtilFunction } from '../utils.ts';

@Component({
  tag: 'my-cmp'
})
export class MyCmp {}
```

```tsx title="src/components/my-cmp-two.tsx"
import { someUtilFunction } from '../utils.ts';

@Component({
  tag: 'my-cmp-two'
})
export class MyCmpTwo {}
```


## CommonJS Dependencies

Rollup depends on [ES modules (ESM)](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/) to properly tree-shake the module graph, unfortunately, some third-party libraries ship their code using the [CommonJS](https://requirejs.org/docs/commonjs.html) module system, which is not ideal.

Since CommonJS libraries are still common today, Stencil comes with [`rollup-plugin-commonjs`](https://github.com/rollup/rollup-plugin-commonjs) already installed and configured.

At compiler-time, the `rollup-plugin-commonjs` plugin does a best-effort to **transform CommonJS into ESM**, but this is not always an easy task. CommonJS is dynamic by nature, while ESM is static by design.

For further information, check out the [rollup-plugin-commonjs docs](https://github.com/rollup/plugins/tree/master/packages/commonjs).



## Custom Rollup plugins

Stencil provides an API to pass custom rollup plugins to the bundling process in `stencil.config.ts`. Under the hood, stencil ships with some built-in plugins including `node-resolve` and `commonjs`, since the execution order of some rollup plugins is important, stencil provides an API to inject custom plugin **before node-resolve** and after **commonjs transform**:

```tsx
export const config = {
  rollupPlugins: {
    before: [
      // Plugins injected before rollupNodeResolve()
      resolvePlugin()
    ],
    after: [
      // Plugins injected after commonjs()
      nodePolyfills()
    ]
  }
}
```

As a rule of thumb, plugins that need to resolve modules, should be place in `before`, while code transform plugins like: `node-polyfills`, `replace`... should be placed in `after`. Follow the plugin's documentation to make sure it's executed in the right order.


## Node Polyfills

Depending on which libraries a project is dependent on, the [rollup-plugin-node-polyfills](https://www.npmjs.com/package/rollup-plugin-node-polyfills) plugin may be required. In such cases, an error message similar to the following will be displayed at build time.

```bash
[ ERROR ]  Bundling Node Builtin
           For the import "crypto" to be bundled from 'problematic-dep',
           ensure the "rollup-plugin-node-polyfills" plugin is installed
           and added to the stencil config plugins.
```

This is caused by some third-party dependencies that use [Node APIs](https://nodejs.org/dist/latest-v10.x/docs/api/) that are not available in the browser, the `rollup-plugin-node-polyfills` plugin works by transparently polyfilling this missing APIs in the browser.

### 1. Install `rollup-plugin-node-polyfills`:

```bash npm2yarn
npm install rollup-plugin-node-polyfills --save-dev
```

### 2. Update the `stencil.config.ts` file including the plugin:

```tsx
import { Config } from '@stencil/core';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export const config: Config = {
  namespace: 'mycomponents',
  rollupPlugins: {
    after: [
      nodePolyfills(),
    ]
  }
};
```

:::note
`rollup-plugin-node-polyfills` is a code-transform plugin, so it needs to run AFTER the commonjs transform plugin, that's the reason it's placed in the "after" array of plugins.
:::

## Strict Mode

ES modules are always parsed in strict mode. That means that certain non-strict constructs (like octal literals) will be treated as syntax errors when Rollup parses modules that use them. Some older CommonJS modules depend on those constructs, and if you depend on them your bundle will blow up. There's nothing we can do about that.

Luckily, there is absolutely no good reason not to use strict mode for everything — so the solution to this problem is to lobby the authors of those modules to update them.

*Source: [https://github.com/rollup/rollup-plugin-commonjs#strict-mode](https://github.com/rollup/rollup-plugin-commonjs#strict-mode)*
