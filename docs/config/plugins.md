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

## Rolldown plugins

The `rolldownPlugins` config can be used to add your own [Rolldown](https://rolldown.rs/) plugins (renamed from `rollupPlugins` in Stencil v5, which replaced Rollup with Rolldown as its bundler — run `stencil migrate --dry-run` to preview renaming an existing config automatically).
Under the hood, stencil ships with some built-in plugins including `node-resolve` and `commonjs`, since the execution order of these plugins is important, stencil provides an API to inject custom plugins **before node-resolve** and after **commonjs transform**:


```tsx
export const config = {
  rolldownPlugins: {
    before: [
      // Plugins injected before node-resolve
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
