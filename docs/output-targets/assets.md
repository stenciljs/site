---
title: Assets Output Target
sidebar_label: assets
description: Unified output for component assets
slug: /assets-output-target
---

# Assets Output Target

The `assets` output target copies every component's [`assetsDirs`](../guides/assets.md#1-reference-assets-in-your-components) to one unified location, shared by every other output target you configure. It's always present - Stencil auto-generates it (in both dev and production builds) unless you configure one explicitly, so there's nothing to add to `outputTargets` for the common case.

```tsx
outputTargets: [
  {
    type: 'assets'
  }
]
```

The copy itself is a no-op if no component declares `assetsDirs` - configuring this target explicitly only matters if you want a directory other than the default.

## Config

### dir

*default: `dist/assets`*

Where component assets are copied to. `loader-bundle`, `standalone`, and `www` all resolve [`getAssetPath()`](../guides/assets.md#getassetpath)/[`setAssetPath()`](../guides/assets.md#setassetpath) against this directory automatically, so changing it doesn't require updating anything on those targets.

### skipInDev

*default: `false`*

Unlike most auto-generated output targets, `assets` also runs during development builds (`--dev`) by default, since a component's assets need to resolve correctly in the dev server too. Set this to `true` to skip it in dev.

See the [Assets guide](../guides/assets.md) for how to declare a component's assets and resolve their paths at runtime.
