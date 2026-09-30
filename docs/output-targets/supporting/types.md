---
sidebar_position: 1
title: Types Output Target
sidebar_label: types
description: TypeScript declarations shared by every distributable output target
slug: /types-output-target
---

# Types Output Target

The `types` output target writes your library's TypeScript declaration (`.d.ts`) files to one shared directory, used by every other distributable output target you configure. Stencil generates it automatically in production builds, so there's nothing to add to `outputTargets` for the common case. Configure it explicitly only to change one of the options below.

```tsx
outputTargets: [
  {
    type: 'types'
  }
]
```

:::note
Formerly a sub-output of `dist` and `dist-custom-elements` in Stencil v4, now a first-class output target.
:::

## Output

| File | Contents |
|---|---|
| `components.d.ts` | Types for every component: its props, events, and methods, its `HTMLElement` interface, and JSX typings for `<my-component>` |
| `components/**/*.d.ts` | One declaration file per component class, mirroring your `src/components/` structure |
| `index.d.ts` | Declarations for your `src/index.ts`, if you have one |
| `loader.d.ts` | The [`loader-bundle`](../main/loader-bundle.md) entry point (`defineCustomElements()`, `setNonce()`, and so on), if that target is configured |
| `standalone.d.ts` | The [`standalone`](../main/standalone.md) runtime helpers, if that target is configured |

Point your `package.json` `types` field at the entry file that matches your package's main entry point. If it's missing, the build warns with the recommended path. See [Publishing](../../guides/publishing.md) for full `package.json` examples.

## Config

### dir

*default: `dist/types`*

Where the declaration files are written.

### empty

*default: `true`*

Setting this flag to `false` will keep the contents of [`dir`](#dir) between builds instead of emptying it first.

### skipInDev

*default: `true`*

Skips this output during development builds (`--dev`), to improve build times.
