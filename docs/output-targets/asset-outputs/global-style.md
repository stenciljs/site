---
sidebar_position: 2
title: Global Style Output Target
sidebar_label: global-style
description: Compiles a project-wide stylesheet, and optionally injects it into every shadow root
slug: /global-style-output-target
---

# Global Style Output Target

The `global-style` output target compiles a stylesheet that applies to the whole page rather than to one component - theming, `@font-face`, resets, design tokens. It runs the file through the same minification, autoprefixing, and [plugins](../../config/plugins.md) as component styles, and writes the result to `dist/assets/`. See [Global styles](../../components/styling.md#global-styles) for when to use one.

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
| `'client'` | Injected in client builds only, keeping [`ssr`](../main/ssr/01-overview.md) output smaller. |
| `'all'` | Injected in both client and `ssr` builds. |

The default depends on how the target was set up. The zero-config `src/global.css` target injects, but a target with an explicit `input` doesn't. If you move from the zero-config setup to an explicit `input` and still want the styles inside shadow roots, set `inject: 'client'`.

Injection affects shadow DOM components only. `scoped` and `none` components render into the light DOM, where a normal page-level stylesheet already reaches them.

### copyToLoaderBrowser

*default: `true`*

When a [`loader-bundle`](../main/loader-bundle.md) target is also configured, writes a second copy of the compiled file to `dist/loader-bundle/{namespace}/{fileName}`, alongside the loader script. This keeps CDN consumers who link the stylesheet from the loader directory working. Set to `false` if nothing depends on that path.

### skipInDev

*default: `false`*

Runs in development builds (`--dev`) as well as production, since the dev server needs the styles too.

## Styling Shadow DOM Components From a Global Stylesheet

With `inject` enabled, a global stylesheet can reach inside shadow roots. The `:host()` pseudo-class, given a tag name, targets every instance of that component:

```css title="src/global.css"
:host(my-button) {
  --button-border-radius: 8px;
  display: inline-block;
}

:host(my-card) {
  --card-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 16px 0;
}

:host(my-input[type="password"]) {
  --input-font-family: monospace;
}
```

This is useful for setting default CSS custom properties per component type, applying consistent spacing to every instance of a component, or theming components by tag name or attribute.

For `scoped` and `none` components, use a plain tag selector (`my-button { ... }`) instead. `:host()` only matches inside a shadow root.

## Multiple Global Stylesheets

Each `global-style` target compiles its own `input` to its own file:

```tsx
outputTargets: [
  { type: 'global-style', input: './src/theme-light.css' },
  { type: 'global-style', input: './src/theme-dark.css' },
  { type: 'global-style', input: './src/print.css', inject: 'none' },
]
```

With more than one target, Stencil can't choose which file should hold the CSS it generates from your components, such as [`globalStyleUrl`](../../components/styling.md#co-locating-styles-with-a-component) styles or [CSS-only components](../../components/css-only.md). The build fails with an error naming each placeholder that needs a home (for example `@import "stencil-component-globals";`). Add it to whichever input file should hold that CSS.
