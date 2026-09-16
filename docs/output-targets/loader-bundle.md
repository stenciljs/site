---
title: Loader Bundle Output Target
sidebar_label: loader-bundle
description: Distributing Web Components Built with Stencil
slug: /loader-bundle
---

# Loader Bundle Output Target

:::note
Renamed from `dist` in Stencil v4. Run `stencil migrate --dry-run` to preview updating an existing config automatically.
:::

The `loader-bundle` type generates the component(s) as a reusable, lazy-loading library, such as [Ionic](https://www.npmjs.com/package/@ionic/core). Every component compiles to its own chunk, and the loader only fetches a given chunk once that component actually appears in the DOM - the browser downloads just the components a page uses, not the whole library up front.

Publishing this output requires the right `package.json` fields pointing at it - see [Lazy Loading](../guides/publishing.md#lazy-loading) in the publishing guide for the exact `exports` map.

```tsx
outputTargets: [
  {
    type: 'loader-bundle'
  }
]
```

## Config

### dir

*default: `dist/loader-bundle`*

The public distribution directory. This directory is built and rebuilt directly from the source files. Since this is a build target, all files will be deleted and rebuilt after each build, so it's best to always copy source files into this directory. It's recommended that this directory not be committed to a repository.

### buildDir

*default: `''` (the root of `dir`)*

Where the lazy-loaded chunks themselves are written, relative to `dir`. Set this to `'../'` if you want the bundle's CDN-facing path to remain at your project's `dist/` root rather than moving to `dist/loader-bundle/`.

### cjs

*default: `false`*

Whether to also generate CommonJS bundles, written to a `cjs/` subdirectory. As of Stencil v5, `loader-bundle` only generates ESM output by default - set this to `true` to restore CommonJS output.

### copy

*default: `undefined`*

An array of [copy tasks](./copy-tasks.md) to be executed during the build process.

### empty

*default: `true`*

By default, before each build the `dir` directory will be emptied of all files. To prevent this directory from being emptied, change this value to `false`.

### loaderPath

*default: `loader` (relative to `dir`)*

Provide a custom path for the loader directory, containing files you can import in an initiation script within your application to register all your components for lazy loading. Read more about the loader directory [below](#importing-with-a-bundler).

:::note
Renamed from `esmLoaderPath` in Stencil v4 - and its path is now resolved relative to `dist/loader-bundle` instead of `dist`. Pass `loaderPath: '../'` to reproduce the old resolved path.
:::

If you don't use a custom [exports](https://nodejs.org/api/packages.html#exports) map, users would have to import the loader script via:

```js
import { defineCustomElements } from 'stencil-library/dist/loader-bundle/loader'
```

By setting `loaderPath` to e.g. `../loader` you can shorten or rename the import path to:

```js
import { defineCustomElements } from 'stencil-library/loader'
```

### hashFileNames

*default: `true` in production, `false` in dev mode*

Hash the filenames of generated chunks based on their content, enabling forever-caching of CDN-served bundles.

### hashedFileNameLength

*default: `8`*

Number of characters to use for the content hash in filenames, when [`hashFileNames`](#hashfilenames) is enabled.

### externalRuntime

*default: `false`*

When `true`, marks `@stencil/core` as an external dependency in the ESM/CJS distribution output rather than bundling it as a local shared chunk - consumers must provide `@stencil/core` themselves (has no effect on the browser/CDN build, which always includes the runtime). This is useful when multiple Stencil component libraries are loaded on the same page; they will share a single stencil runtime.

:::note
Ensure `@stencil/core` is listed in your project's `dependencies` if you enable this option, to prevent runtime errors for your consumers.
:::

### skipInDev

*default: `true`*

Skips the publish-ready distribution artifacts (the `esm`/`cjs`/`index` files under [`dir`](#dir), with types) during development builds, to improve build times. The browser/CDN-facing lazy bundle is always built regardless, in dev or production, so components still work while you develop against them - only the npm-publishable output is deferred. Set this to `false` to build the distribution artifacts in dev too.

## Consumption

### Script Tag

Load your components straight from a CDN with a single script tag - no bundler, no framework, no import. The file lives at `dist/loader-bundle/<namespace>/<namespace>.js`, where `<namespace>` is your Stencil `namespace` config value, lowercased. By default file entries are hashed for cache-busting.

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/my-design-system@1.0.0/dist/loader-bundle/my-design-system/my-design-system.js"></script>
```

The script itself is tiny - just a registry. Only the components actually used on the page get requested and lazy-loaded.

### Importing With a Bundler

After installing your library via npm, import the loader and call `defineCustomElements()`

```ts
import { defineCustomElements } from 'my-design-system/loader';

defineCustomElements();
```

This works the same in any npm-based project, regardless of framework.
