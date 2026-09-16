---
title: Assets
sidebar_label: Assets
description: Bundle and resolve static assets for your components
slug: /assets
---

# Assets

Assets are static files a component needs - images, fonts etc. (CSS is handled differently; see [Styling](../components/styling.md).)

Getting an asset from your source code onto a page a consumer actually loads takes up to four steps:

1. [Reference assets in your components](#1-reference-assets-in-your-components)
2. [Bundle assets with your library](#2-bundle-assets-with-your-library)
3. [Make assets available in consuming applications](#3-make-assets-available-in-consuming-applications)
4. [Point your components at the new location](#4-point-your-components-at-the-new-location)

If you're building an app rather than a library for others to install (a `www` project), or only making your components available via cdn `<script>` - steps 1 and 2 are all you need. Steps 3 and 4 only come up once someone else `npm install`s your published library into their own app.

## 1. Reference assets in your components

List the component's asset directory with [`assetsDirs`](../components/component.md#component-options), then build the URL to a specific file with `getAssetPath()`:

```
src/
└── components/
    └── my-component/
        ├── assets/
        │   ├── beach.jpg
        │   └── sunset.jpg
        └── my-component.tsx
```

```tsx
// file: my-component.tsx
import { Component, Prop, getAssetPath, h } from '@stencil/core';

@Component({
  tag: 'my-component',
  assetsDirs: ['assets'], // 1. declares the sibling `assets` directory
})
export class MyComponent {
  @Prop() image = 'sunset.jpg';

  render() {
    // 2. builds the URL to the actual file at build time
    const imageSrc = getAssetPath(`./assets/${this.image}`);
    return <img src={imageSrc} />;
  }
}
```

`assetsDirs` alone doesn't make the asset resolvable - it's what step 2 copies. `getAssetPath()` alone doesn't copy anything either - it just builds the URL, assuming the file ends up where step 2 puts it. You need both.

:::note
Files not tied to a specific component - or that need a destination other than the unified `assets` output from step 2 - use a [Stencil `copy` task](../output-targets/copy-tasks.md) instead, available on `loader-bundle`, `standalone`, and `www`.
:::

## 2. Bundle assets with your library

Every component's `assetsDirs` are copied automatically to one unified `dist/assets/` directory, regardless of which output targets you configure - see the [`assets` output target](../output-targets/assets.md) for where that directory lives and how to change it. There's nothing to configure for the common case; this step is already done for you.

## 3. Make assets available in consuming applications

The URL `getAssetPath()` builds is only useful if the file it points to is actually reachable at runtime. Once a consumer runs `npm install my-library`, your assets sit in `node_modules/my-library/dist/assets/` - and most dev servers and production builds don't serve `node_modules` publicly.

This applies to [`loader-bundle`](../output-targets/loader-bundle.md) and [`standalone`](../output-targets/standalone.md) alike, whenever a consumer's own bundler resolves your package from `node_modules` rather than loading it wholesale from a CDN (a CDN or `www`-style deploy ships the whole tree together, so this isn't a problem there).

Copy or symlink the assets into a servable location as part of the consumer's own build. A webpack config might look like this:

```js
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'node_modules/my-library/dist/assets'),
          to: path.resolve(__dirname, 'dist/assets'),
        },
      ],
    }),
  ],
};
```

Or with Rollup:

```js
import path from 'path';
import copy from 'rollup-plugin-copy';

export default {
  input: 'src/index.js',
  output: [{ dir: path.resolve('dist/'), format: 'es' }],
  plugins: [
    copy({
      targets: [
        {
          src: path.resolve(__dirname, 'node_modules/my-library/dist/assets'),
          dest: path.resolve(__dirname, 'dist'),
        },
      ],
    }),
  ],
};
```

For a simpler static-hosting setup with no bundler step, a symlink works just as well:

```bash
ln -s node_modules/my-library/dist/assets public/assets
```

## 4. Point your components at the new location

The path Stencil computed in step 1 assumed your component's file would stay at the same relative distance from its assets that it had in your build. A bundler relocating that file (the common case) breaks that assumption, even after step 3 makes the files themselves reachable. Call [`setAssetPath()`](#setassetpath) to repoint it at wherever you actually put them.

For `standalone`, it's re-exported both from each per-component subpath and from the package root, regardless of which one you're already importing the component from:

```ts
import { setAssetPath, defineCustomElement } from 'my-library/my-component';
// or, from the root:
// import { setAssetPath, defineCustomElements } from 'my-library';

setAssetPath('/assets/');
defineCustomElement();
```

For `loader-bundle`, it's re-exported from the `/loader` entry point instead, alongside `defineCustomElements`:

```ts
import { setAssetPath, defineCustomElements } from 'my-library/loader';

setAssetPath('/assets/');
defineCustomElements();
```

Either way, this needs no separate import beyond what you're already using to load your components. It sets the base path for every component sharing that Stencil runtime instance, so call it once, outside any component - not from within one.

:::note
Server-side rendering uses a separate mechanism: `getAssetPath()` on the server can't fall back to a browser URL, so it needs `resourcesUrl` passed explicitly to `ssrDocument()`. See [SSR / SSG](../output-targets/ssr/01-overview.md).
:::

## API Reference

### getAssetPath

`getAssetPath()` is an API provided by Stencil to build the path to an asset, relative to the asset base path.

```ts
/** 
 * Builds a URL to an asset. This is achieved by combining the 
 * provided `path` argument with the base asset path.
 * @param path the path of the asset to build a URL to
 * @returns the built URL
 */
declare function getAssetPath(path: string): string;
```

The code sample below demonstrates the return value of `getAssetPath` for different `path` arguments, when an asset base path of `/static/` has been set.
```ts
import { getAssetPath } from '@stencil/core';

// with an asset base path of "/static/":
// "/static/"
getAssetPath('');
// "/static/my-image.png"
getAssetPath('my-image.png');
// "/static/assets/my-image.png"
getAssetPath('assets/my-image.png');
// "/static/assets/my-image.png"
getAssetPath('./assets/my-image.png');
// "/assets/my-image.png"
getAssetPath('../assets/my-image.png');
// "/assets/my-image.png"
getAssetPath('/assets/my-image.png');
```

### setAssetPath

`setAssetPath` is an API provided by Stencil's runtime to manually set the asset base path where assets can be found.

```ts
/**
 * Set the base asset path for resolving components
 * @param path the base asset path
 * @returns the new base asset path
 */
export declare function setAssetPath(path: string): string;
```

Calling this API sets the asset base path for every Stencil component attached to that Stencil runtime instance - as a result, don't call it from within a component, to avoid unwanted side effects for other components sharing the same page.

Besides a fixed string, [`document.currentScript.src`](https://developer.mozilla.org/en-US/docs/Web/API/Document/currentScript) or a bundler-injected environment variable both work as the argument, if the right value isn't known until runtime or build time respectively. See [Publishing & Consuming a Component Library](./publishing.md) for how consumers load your components in the first place, script tag included.
