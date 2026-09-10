---
title: Stencil Output Targets
sidebar_label: Overview
description: Stencil Output Targets
slug: /output-targets
---

# Output Targets

One of the more powerful features of the compiler is its ability to generate various builds depending on _"how"_ the components are going to be used. Stencil is able to take an app's source and compile it to numerous targets, such as a webapp to be deployed on an http server, as a third-party component lazy-loaded library to be distributed on [npm](https://www.npmjs.com/), or a vanilla custom elements bundle. By default, Stencil apps have an output target type of `loader-bundle`, which is best suited for design systems and component libraries — set `www` explicitly if you're building a full web app rather than a library.

## Output Target Types:
 - [`loader-bundle`: lazy-loaded bundle for CDN/npm distribution](./dist.md) (formerly `dist`)
 - [`standalone`: standalone custom element modules](./custom-elements.md) (formerly `dist-custom-elements`)
 - [`www`: Website](./www.md)
 - `collection`: transpiled source for downstream re-bundling, auto-generated in production (formerly the `dist-collection` sub-output of `dist`)
 - `types`: TypeScript type declarations, auto-generated in production (formerly a sub-output of `dist`/`dist-custom-elements`)
 - `global-style` and `assets`: first-class targets for global stylesheets and component assets
 - `ssr`: server-side rendering (formerly `dist-hydrate-script`) — see [SSR / SSG](./ssr/01-overview.md)
 - [Documentation generation targets](./documentation-generation/01-overview.md) (`docs-readme`, `docs-json`, `docs-custom-elements-manifest`, and others)

## Choosing Between `loader-bundle` and `standalone`

Both targets export your components for consumption elsewhere, but they suit different situations.

`loader-bundle` lazy-loads each component's full logic only once it's actually used on the page. Drop in a single script tag and the whole library is available, but the browser only downloads the components that actually render - useful when component usage can't be known ahead of time, like a CMS where content authors freely combine components per page. The trade-off is sequential loading through nested dependencies: if `CmpA` renders `CmpB`, which renders `CmpC`, the browser loads three scripts one after another before `CmpA` finishes rendering, which can show up as a rendering delay. It also requires your application to ship all your bundled components as static assets.

:::note
Stencil does some optimization to reduce the number of sequential loads (e.g. via statically analyzing component dependencies), but it can't eliminate them entirely.
:::

`standalone` builds each component as a direct class extending `HTMLElement` for you to import and register explicitly - on its own it doesn't bundle by default. It mainly suits projects that already use a bundler like [Vite](https://vitejs.dev/), [Webpack](https://webpack.js.org/), or [Rolldown](https://rolldown.rs/), where usage is static and known at build time.

:::note
The standalone output does ship an [auto-loader](../guides/publishing.md#auto-loader) for DOM-driven loading without a bundler however it is less performant than the dedicated `loader-bundle`.
:::

Both can be generated from the same source at the same time; it's up to the consumer which one they use. See [Publishing a Component Library](../guides/publishing.md) for how to wire each one up for consumers.

## Example:

```tsx
import { Config } from '@stencil/core';

export const config: Config = {
  outputTargets: [
    {
      type: 'loader-bundle'
    },
    {
      type: 'www'
    }
  ]
};
```

## Package.json Validation

Stencil validates that your `package.json` fields (`main`, `module`, `types`, etc.) point at real, configured output. As of Stencil v5, this validation is fully automatic — it runs whenever a distributable output target is configured, based on which outputs you have, with no config flag to enable or disable it and no per-target flag to mark one as "primary." Priority order for the root package export: `loader-bundle` takes priority over `standalone` if both are configured; types always come from the `types` output target.

:::note
Stencil v4 required setting `validatePrimaryPackageOutputTarget: true` plus an `isPrimaryPackageOutputTarget: true` flag on one output target. Both are removed in v5 — there's no replacement flag, since validation is now fully auto-detected. Run `stencil migrate --dry-run` to preview removing them from an existing config.
:::
