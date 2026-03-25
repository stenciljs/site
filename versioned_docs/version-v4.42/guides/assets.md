---
title: Assets
sidebar_label: Assets
description: Learn how to reference assets in your components
slug: /assets
---

# Assets

Stencil components may need one or more static files as a part of their design.
These types of files are referred to as 'assets', and include images, fonts, etc.

In this guide, we describe different strategies for resolving assets on the filesystem.

:::note
CSS files are handled differently than assets; for more on using CSS, please see the [styling documentation](../components/styling.md).
:::

## Asset Base Path

The **asset base path** is the directory that Stencil will use to resolve assets.
When a component uses an asset, the asset's location is resolved relative to the asset base path.

The asset base path is automatically set for the following output targets:
- [dist](../output-targets/dist.md)
- [hydrate](./hydrate-app.md)
- [www](../output-targets/www.md)

For all other output targets, assets must be [moved](#manually-moving-assets) and the asset base path must be [manually set](#setassetpath).

For each instance of the Stencil runtime that is loaded, there is a single asset base path.
Oftentimes, this means there is only one asset base path per application using Stencil.

## Resolution Overview

The process of resolving an asset involves asking Stencil to build a path to the asset on the filesystem. 

When an asset's path is built, the resolution is always done in a project's compiled output, not the directory containing the original source code.

The example below uses the output of the [`www` output target](../output-targets/www.md) to demonstrate how assets are resolved.
Although the example uses the output of `www` builds, the general principle of how an asset is found holds for all output targets.

When using the `www` output target, a `build/` directory is automatically created and set as the asset base path.
An example `build/` directory and the assets it contains can be found below.

```
www/
├── build/
│   ├── assets/
│   │   ├── logo.png
│   │   └── scenery/
│   │       ├── beach.png
│   │       └── sunset.png
│   └── other-assets/
│       └── font.tiff
└── ...
```

To resolve the path to an asset, Stencil's [`getAssetPath()` API](#getassetpath) may be used.
When using `getAssetPath`, the assets in the directory structure above are resolved relative to `build/`.

The code sample below demonstrates the return value of `getAssetPath` for different `path` arguments.
The return value is a path that Stencil has built to retrieve the asset on the filesystem.
```ts
import { getAssetPath } from '@stencil/core';

// with an asset base path of "/build/":

// '/build/assets/logo.png'
getAssetPath('assets/logo.png');
// '/build/assets/scenery/beach.png'
getAssetPath('assets/scenery/beach.png');
// '/build/other-assets/font.tiff'
getAssetPath('other-assets/font.tiff'); 
```

## Making Assets Available

In order to be able to find assets at runtime, they need to be found on the filesystem from the output of a Stencil build.
In other words, we need to ensure they exist in the distribution directory.
This section describes how to make assets available under the asset base path.

### assetsDirs

The `@Component` decorator can be [configured with the `assetsDirs` option](../components/component.md#component-options). 
`assetsDirs` takes an array of strings, where each entry is a relative path from the component to a directory containing the assets the component requires.

When using the `dist` or `www` output targets, setting `assetsDirs` instructs Stencil to copy that folder into the distribution folder.
When using other output targets, Stencil will not copy assets into the distribution folder.

Below is an example project's directory structure containing an example component and an assets directory.

```
src/
└── components/
    ├── assets/
    │   ├── beach.jpg
    │   └── sunset.jpg
    └── my-component.tsx
```

Below, the `my-component` component will correctly load the assets based on it's `image` prop.

```tsx
// file: my-component.tsx
// 1. getAssetPath is imported from '@stencil/core'
import { Component, Prop, getAssetPath, h } from '@stencil/core';

@Component({
  tag: 'my-component',
  // 2. assetsDirs lists the 'assets' directory as a relative
  //    (sibling) directory
  assetsDirs: ['assets']
})
export class MyComponent {

  @Prop() image = "sunset.jpg";

  render() {
    // 3. the asset path is retrieved relative to the asset 
    //    base path to use in the <img> tag
    const imageSrc = getAssetPath(`./assets/${this.image}`);
    return <img src={imageSrc} />
  }
}
```

In the example above, the following allows `my-component` to display the provided asset:
1. [`getAssetPath()`](#getassetpath) is imported from `@stencil/core`
2. The `my-component`'s component decorator has the `assetsDirs` property, and lists the sibling directory, `assets`. This will copy `assets` over to the distribution directory.
3. `getAssetPath` is used to retrieve the path to the image to be used in the `<img>` tag

### Manually Moving Assets

For the [dist-custom-elements](../output-targets/custom-elements.md) output target, options like `assetsDirs` do not copy assets to the distribution directory.

It's recommended that a bundler (such as rollup) or a Stencil `copy` task is used to ensure the static assets are copied to the distribution directory.

#### Stencil Copy Task

[Stencil `copy` task](../output-targets/copy-tasks.md)s can be used to define files and folders to be copied over to the distribution directory.

The example below shows how a copy task can be used to find all '.jpg' and '.png' files under a project's `src` directory and copy them to `dist/components/assets` at build time.

```ts
import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'your-component-library',
  outputTargets: [
    {
      type: 'dist-custom-elements',
      copy: [
        {
          src: '**/*.{jpg,png}',
          dest: 'dist/components/assets',
          warn: true,
        }
      ]
    },
  ], 
  // ...
};
```
#### Rollup Configuration

[Rollup Plugins](../config/plugins.md#rollup-plugins)'s can be used to define files and folders to be copied over to the distribution directory.

The example below shows how a the `rollup-plugin-copy` NPM module can be used to find all '.jpg' and '.png' files under a project's `src` directory and copy them to `dist/components/assets` at build time.

```javascript
import { Config } from '@stencil/core';
import copy from 'rollup-plugin-copy';

export const config: Config = {
    namespace: 'copy',
    outputTargets: [
      {
        type: 'dist-custom-elements',
      },
    ],
    rollupPlugins: {
      after: [
        copy({
          targets: [
            {
              src: 'src/**/*.{jpg,png}',
              dest: 'dist/components/assets',
            },
          ],
        }),
      ]
    }
};
```

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

The code sample below demonstrates the return value of `getAssetPath` for different `path` arguments, when an asset base path of `/build/` has been set.
```ts
import { getAssetPath } from '@stencil/core';

// with an asset base path of "/build/":
// "/build/"
getAssetPath('');
// "/build/my-image.png"
getAssetPath('my-image.png');
// "/build/assets/my-image.png"
getAssetPath('assets/my-image.png');
// "/build/assets/my-image.png"
getAssetPath('./assets/my-image.png');
// "/assets/my-image.png"
getAssetPath('../assets/my-image.png');
// "/assets/my-image.png"
getAssetPath('/assets/my-image.png');
```

### setAssetPath

`setAssetPath` is an API provided by Stencil's runtime to manually set the asset base path where assets can be found. If you are using `getAssetPath` to compose the path for your component assets, `setAssetPath` allows you or the consumer of the component to change that path.

```ts
/**
 * Set the base asset path for resolving components
 * @param path the base asset path
 * @returns the new base asset path
 */
export declare function setAssetPath(path: string): string;
```

Calling this API will set the asset base path for all Stencil components attached to a Stencil runtime. As a result, calling `setAssetPath` should not be done from within a component in order to prevent unwanted side effects when using a component.

Make sure as component author to export this function as part of your module in order to also make it accessible to the consumer of your component, e.g. in your package entry file export the function via:

```ts title="/src/index.ts"
export { setAssetPath } from '@stencil/core';
```

Now your users can import it directly from your component library, e.g.:

```ts
import { setAssetPath } from 'my-component-library';
setAssetPath(`${window.location.protocol}//assets.${window.location.host}/`);
```

Alternatively, one may use [`document.currentScript.src`](https://developer.mozilla.org/en-US/docs/Web/API/Document/currentScript) when working in the browser and not using modules or environment variables (e.g. `document.env.ASSET_PATH`) to set the
asset base path. This configuration depends on how your script is bundled, (or lack of bundling), and where your assets can be loaded from.

:::note

If your component library exports components compiled with [`dist-output-target`](/output-targets/custom-elements.md) and `externalRuntime` set to `true`, then `setAssetPath` has to be imported from `@stencil/core` directly.

:::

In case you import a component directly via script tag, this would look like:

```html
<html>
  <head>
    <script src="https://cdn.jsdelivr.net/npm/my-component-library/dist/my-component-library.js"></script>
    <script type="module">
      import { setAssetPath } from 'https://cdn.jsdelivr.net/npm/my-component-library/dist/my-component-library.js';
      setAssetPath(`${window.location.origin}/`);
    </script>
  </head>
  <body>
    <ion-toggle></ion-toggle>
  </body>
</html>
```
