---
title: Bundler Plugin
sidebar_label: Bundler Plugin
description: Compile Stencil components inside a Vite, webpack, Rspack, Rollup or esbuild build with @stencil/unplugin
slug: /bundler-plugin
sidebar_position: 3
---

# Bundler Plugin

`@stencil/unplugin` compiles Stencil components inside another bundler's build: Vite, webpack, Rspack, Rollup or esbuild. Each component file becomes a custom element that registers itself when it's imported, with no separate Stencil build. Use it to write Stencil components directly in an app, such as a framework app built with Vite or webpack.

The [Vitest integration](../../testing/vitest/01-overview.md) uses the same plugin, to compile components as tests import them.

:::note
The bundler plugin is new in Stencil v5, and hasn't been used as widely as a Stencil build. If a component behaves differently with the plugin than in a Stencil build, please [open an issue](https://github.com/stenciljs/core/issues).
:::

The plugin doesn't run [output targets](../../output-targets/01-overview.md), so it doesn't generate framework wrappers, server rendering or the other outputs of a component library. To publish a library, build it with Stencil.

## Setup

Install the plugin alongside Stencil:

```bash npm2yarn
npm install --save-dev @stencil/unplugin @stencil/core
```

Add it to your bundler's config. For Vite:

```ts title="vite.config.ts"
import { defineConfig } from 'vite';
import { stencilVite } from '@stencil/unplugin';

export default defineConfig({
  plugins: [stencilVite()],
});
```

For the other bundlers, use `stencilWebpack`, `stencilRspack`, `stencilRollup` or `stencilEsbuild` in the same way.

## Import Every Component You Render

A component registers its tag when its file is imported. Import each component the page renders, including the ones other components render:

```ts title="src/main.ts"
import './components/my-card';
import './components/my-badge'; // rendered inside my-card
```

A tag whose file isn't imported stays an unknown element and renders nothing.

## In a Framework App

Frameworks render Stencil components the way they render any custom element. Some need to be told which tags are custom elements. For what custom elements can and can't do in each framework, see [Framework Integration](../../framework-integration/01-overview.md).

## Styles

A component's `styleUrl` stylesheet goes through the same steps as in a Stencil build. Sass (`.scss`, `.sass`) and Less work once `sass` or `less` is installed, and a `postcss.config.*` in your project is applied. `scoped` components get their scoped selectors.

## Configuration

The plugin reads the transpile-related settings from your `stencil.config.ts`, such as [`signalBacking`](../../config/01-overview.md#signalbacking), when there is one. Its own options are all optional:

| Option | Default | Description |
|---|---|---|
| `include` | `[/\.tsx?$/]` | Files to compile. Only files that use Stencil decorators are changed. |
| `exclude` | `['node_modules/**']` | Files to skip. |
| `dev` | `true` in Vite's dev server, otherwise `false` | Hot-update components when their files change. Set it to `true` for webpack or Rspack dev servers. |
| `types` | `false` | Write `components.d.ts`, the same component types a Stencil build generates, and keep it current. |
| `docs` | `false` | Collect component docs. The [Custom Elements Manifest](../../output-targets/documentation-generation/docs-custom-elements-manifest.md) is then the default export of `@stencil/unplugin/docs`. |
| `transpileOptions.componentExport` | `'customelement'` | `'module'` exports each component class without registering a tag, so you call `customElements.define()` yourself. |
| `stencilConfig` | from `stencil.config.ts` | Override the settings read from `stencil.config.ts`. |

With `componentExport: 'module'`, register the components yourself, for example under other names or in a [scoped registry](../distribution/tag-name-clashes/scoped-registries.md):

```ts title="src/main.ts"
import { MyBadge } from './components/my-badge';
import { MyCard } from './components/my-card';

customElements.define('my-badge', MyBadge);
customElements.define('my-card', MyCard);
```
