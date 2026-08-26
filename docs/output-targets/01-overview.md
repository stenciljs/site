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
