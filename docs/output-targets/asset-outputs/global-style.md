---
sidebar_position: 2
title: Global Style Output Target
sidebar_label: global-style
description: Compiles a project-wide stylesheet, and optionally injects it into every shadow root
slug: /global-style-output-target
---

# Global Style Output Target

The `global-style` output target compiles a stylesheet that applies to the whole page rather than to one component - theming, `@font-face`, resets, design tokens. It runs the file through the same minification, autoprefixing, and [plugins](../../config/plugins.md) as component styles, and writes the result to `dist/assets/`. See [Global styles](../../components/styling/global-styles.md) for when to use one.

A project with a `src/global.css` (or `.scss`, `.sass`, `.less`, `.pcss`, `.styl`, `.stylus`) file gets this target automatically. Configure it explicitly to use a different file, a different output name, or more than one global stylesheet:

```tsx
outputTargets: [
  {
    type: 'global-style',
    input: './src/theme.css',
  }
]
```

## Config

### input

*default: the auto-detected `src/global.*` file*

The stylesheet to compile.

### fileName

*default: the basename of `input` if set, otherwise `{namespace}.css`*

The name of the compiled file.

### dir

*default: `dist/assets`*

Where the compiled file is written. A copy is also written into every [`www`](../main/www.md) target's build directory, so the dev server can serve it.

### inject

*default: `'client'` for the zero-config `src/global.*` stylesheet, `'none'` when `input` is set*

Whether the stylesheet is also added to every component's shadow root, as a [constructable stylesheet](https://web.dev/constructable-stylesheets/):

| Value | Effect |
|---|---|
| `'none'` | Not injected. The stylesheet only reaches the light DOM, like any page-level `<link>`. |
| `'client'` | Injected in client builds only, keeping [`ssr`](../main/ssr.md) output smaller. |
| `'all'` | Injected in both client and `ssr` builds. |

The default depends on how the target was set up. The zero-config `src/global.css` target injects, but a target with an explicit `input` doesn't. If you move from the zero-config setup to an explicit `input` and still want the styles inside shadow roots, set `inject: 'client'`.

Injection affects shadow DOM components only. `scoped` and `none` components render into the light DOM, where a normal page-level stylesheet already reaches them.

See [Styling Shadow DOM Components](../../components/styling/global-styles.md#styling-shadow-dom-components) for what an injected stylesheet can do.

### copyToLoaderBrowser

*default: `true`*

When a [`loader-bundle`](../main/loader-bundle.md) target is also configured, writes a second copy of the compiled file to `dist/loader-bundle/{namespace}/{fileName}`, alongside the loader script. This keeps CDN consumers who link the stylesheet from the loader directory working. Set to `false` if nothing depends on that path.

### skipInDev

*default: `false`*

Runs in development builds (`--dev`) as well as production, since the dev server needs the styles too.

## Multiple Global Stylesheets

Each `global-style` target compiles its own `input` to its own file, with its own `inject` setting. Here the main stylesheet is also added to shadow roots, and the print stylesheet isn't (the default with an explicit `input`):

```tsx
outputTargets: [
  { type: 'global-style', input: './src/global.css', inject: 'client' },
  { type: 'global-style', input: './src/print.css' },
]
```

With more than one target, Stencil can't choose which file should hold the CSS it generates from your components, such as [`globalStyleUrl`](../../components/styling/global-styles.md#co-locating-styles-with-a-component) styles or [CSS-only components](../../components/css-only.md). The build fails with an error naming each placeholder that needs a home (for example `@import "stencil-component-globals";`). Add it to whichever input file should hold that CSS.
