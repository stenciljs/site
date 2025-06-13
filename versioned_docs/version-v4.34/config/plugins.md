---
title: Plugin Config
sidebar_label: Plugins
description: Plugin Config
slug: /plugins
---

# Plugins

## Stencil plugins

By default, Stencil does not come with `Sass` or `PostCSS` support. However, either can be added using the `plugins` array.

```tsx
import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  plugins: [
    sass()
  ]
};
```

## Rollup plugins

The `rollupPlugins` config can be used to add your own [Rollup](https://rollupjs.org) plugins.
Under the hood, stencil ships with some built-in plugins including `node-resolve` and `commonjs`, since the execution order of rollup plugins is important, stencil provides an API to inject custom plugin **before node-resolve** and after **commonjs transform**:


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

### Related Plugins

- [@stencil/sass](https://www.npmjs.com/package/@stencil/sass)
- [@stencil-community/postcss](https://www.npmjs.com/package/@stencil-community/postcss)
- [@stencil-community/less](https://www.npmjs.com/package/@stencil-community/less)
- (Deprecated) [@stencil/stylus](https://www.npmjs.com/package/@stencil/stylus)


## Node Polyfills
See the [Node Polyfills in Module bundling](../guides/module-bundling.md#node-polyfills) for other examples.
