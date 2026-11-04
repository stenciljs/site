---
title: Main Output Targets
sidebar_label: Overview
description: Choosing between loader-bundle and standalone, and how Stencil validates package.json
slug: /main-output-targets
sidebar_position: 0
---

# Main Output Targets

The main output targets build your components for use in a browser or on a server:

- [`loader-bundle`](./loader-bundle.md): your whole library behind one script, lazy-loading each component when it's first used. The default.
- [`standalone`](./standalone.md): one module per component, for consumers who import and bundle components themselves.
- [`ssr`](./ssr.md): a module that renders your components to HTML on a server.
- [`ssr-wasm`](./ssr-wasm.md): the `ssr` module compiled to WebAssembly, for servers in other languages.
- [`www`](./www.md): a complete web app.

See [Rendering Strategies](../../concepts/rendering-strategies.md) for when to render in the browser, on a server, or at build time.

## Choosing Between `loader-bundle` and `standalone`

Both targets export your components for consumption elsewhere, but they suit different situations.

`loader-bundle` lazy-loads each component's full logic only once it's actually used on the page. Drop in a single script tag and the whole library is available, but the browser only downloads the components that actually render. That's useful when component usage can't be known ahead of time, like a CMS where content authors freely combine components per page. The trade-off is sequential loading through nested dependencies: if `CmpA` renders `CmpB`, which renders `CmpC`, the browser loads three scripts one after another before `CmpA` finishes rendering, which can show up as a rendering delay. It also requires your application to ship all your bundled components as static assets.

:::note
Stencil does some optimization to reduce the number of sequential loads (via statically analyzing component dependencies), but it can't eliminate them entirely.
:::

`standalone` builds each component as a direct class extending `HTMLElement`, self-contained by default. You import and register each component explicitly, rather than dropping in a single script tag, which is exactly what a project's own bundler, like [Vite](https://vitejs.dev/), [Webpack](https://webpack.js.org/), or [Rollup](https://rollupjs.org/), resolves well when usage is static and known at build time.

:::note
The standalone output also ships an [auto-loader](../../guides/distribution/publishing.md#auto-loader) for DOM-driven loading without a bundler, but it's less performant than the dedicated `loader-bundle`.
:::

Both can be generated from the same source at the same time, and consumers choose which one to use:

```tsx title="stencil.config.ts"
import { Config } from '@stencil/core';

export const config: Config = {
  outputTargets: [{ type: 'loader-bundle' }, { type: 'standalone' }],
};
```

See [Publishing a Component Library](../../guides/distribution/publishing.md) for how to wire each one up for consumers.

## Package.json Validation

Stencil checks that your `package.json` fields (`main`, `module`, `types`, and so on) point at real, configured output. The check runs automatically whenever a distributable output target is configured, based on which outputs you have; there's no flag to turn it on or off, or to mark one target as "primary". For the root package export, `loader-bundle` takes priority over `standalone` if both are configured, and types always come from the [`types`](../supporting/types.md) output target.

:::note
Stencil v4 required setting `validatePrimaryPackageOutputTarget: true` plus an `isPrimaryPackageOutputTarget: true` flag on one output target. Both are removed in v5, with no replacement, since validation is now automatic. Run `stencil migrate` to remove them from an existing config.
:::
