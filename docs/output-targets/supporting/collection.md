---
sidebar_position: 2
title: Collection Output Target
sidebar_label: collection
description: Transpiled source for downstream Stencil projects to re-compile
slug: /collection
---

# Collection Output Target

The `collection` output target contains your components' transpiled source, metadata, and build flags - not a bundle. It exists so a downstream Stencil project can re-compile and re-bundle your components with its own compiler, instead of treating your library as an opaque pre-built dependency the way [`loader-bundle`](../main/loader-bundle.md)/[`standalone`](../main/standalone.md) are consumed.

It's always generated in production builds unless you configure one explicitly - there's nothing to add to `outputTargets` for the common case.

```tsx
outputTargets: [
  {
    type: 'collection'
  }
]
```

:::note
Formerly the `dist-collection` sub-output of `dist` in Stencil v4, now a first-class output target.
:::

## Config

### dir

*default: `dist/collection`*

Where the transpiled source and manifest are written.

### empty

*default: `true`*

Setting this flag to `false` will keep the contents of [`dir`](#dir) between builds instead of emptying it first.

### skipInDev

*default: `true`*

Skips this output during development builds (`--dev`), since only downstream re-compilation needs it, to improve build times.

### transformAliasedImportPaths

*default: `true`*

Rewrites `tsconfig.json` path aliases to relative imports in the compiled output:

```ts
// tsconfig.json
{
  "paths": {
    "@utils/*": ["src/utils/*"]
  }
}

// source
import * as dateUtils from '@utils/date-utils';
// compiled output
import * as dateUtils from '../utils/date-utils';
```

Set to `false` to leave path aliases as-authored - only useful if the downstream project resolves the same aliases itself.

## Consuming

A downstream Stencil project discovers your collection through your package's `collection` field, which points at the generated manifest:

```json
{
  "collection": "./dist/collection/collection-manifest.json"
}
```

`component-starter`-scaffolded projects set this by default, so most libraries don't need to add it by hand.

The consuming project then opts in, either by listing your package in its [`collections`](../../config/01-overview.md#collections) config, or with a side-effect import anywhere in its source:

```ts
import 'my-library';
```

A named import (`import { x } from 'my-library'`) doesn't count. Either way, the consumer's compiler reads your manifest and transpiled source directly, with no registration call needed.
