---
title: Custom Elements with Stencil
sidebar_label: dist-custom-elements
description: Custom Elements with Stencil
slug: /custom-elements
---

# Custom Elements

The `dist-custom-elements` output target creates custom elements that directly extend `HTMLElement` and provides simple utility functions for easily defining these elements on the [Custom Element Registry](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry). This output target excels in use in frontend frameworks and projects that will handle bundling, lazy-loading, and custom element registration themselves.

This target can be used outside of frameworks as well, if lazy-loading functionality is not required or desired. For using lazily loaded Stencil components, please refer to the [dist output target](./dist.md).

To generate components using the `dist-custom-elements` output target, add it to a project's `stencil.config.ts` file like so:

```tsx title="stencil.config.ts"
import { Config } from '@stencil/core';

export const config: Config = {
  // Other top-level config options here
  outputTargets: [
    {
      type: 'dist-custom-elements',
      // Output target config options here
    },
    // Other output targets here
  ],
};
```

## Config

### copy

_default: `undefined`_

An array of [copy tasks](./copy-tasks.md) to be executed during the build process.

### customElementsExportBehavior

_default: `'default'`_

By default, the `dist-custom-elements` output target generates a single file per component, and exports each of those files individually.

In some cases, library authors may want to change this behavior, for instance to automatically define component children, provide a single file containing all component exports, etc.

This config option provides additional behaviors that will alter the default component export _OR_ custom element definition behaviors
for this target. The desired behavior can be set via the following in a project's Stencil config:

```ts
// stencil.config.ts
import { Config } from '@stencil/core';

export const config: Config = {
  outputTargets: [
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'default' | 'auto-define-custom-elements' | 'bundle' | 'single-export-module',
    },
    // ...
  ],
  // ...
};
```

| Option                        | Description                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------------- |-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `default`                     | No additional re-export or auto-definition behavior will be performed.<br/><br/>This value will be used if no explicit value is set in the config, or if a given value is not a valid option.                                                                                                                                                                                                             |
| `auto-define-custom-elements` | A component and its children will be automatically defined with the `CustomElementRegistry` when the component's module is imported.                                                                                                                                                                                                                                                                      |
| `bundle`                      | A utility `defineCustomElements()` function is exported from the `index.js` file of the output directory. This function can be used to quickly define all Stencil components in a project on the custom elements registry.                                                                                                                                                                                |
| `single-export-module`        | All component and custom element definition helper functions will be exported from the `index.js` file in the output directory. This file can be used as the root module when distributing your component library, see [Publishing](/publishing) for more details. |

:::note
At this time, components that do not use JSX cannot be automatically
defined. This is a known limitation of Stencil that users should be aware of.
:::

### dir

_default: `'dist/components'`_

This config option allows you to change the output directory where the compiled output for this output target will be written.

### empty

_default: `true`_

Setting this flag to `true` will remove the contents of the [output directory](#dir) between builds.

### externalRuntime

_default: `true`_

Setting this flag to `true` results in the following behaviors:

1. Minification will follow what is specified in the [Stencil config](../config/01-overview.md#minifyjs).
2. Filenames will not be hashed.
3. All imports from packages under `@stencil/core/*` will be marked as external and therefore not included in the generated Rollup bundle.

Ensure that `@stencil/core` is included in your list of dependencies if you set this option to `true`. This is crucial to prevent any runtime errors.

### generateTypeDeclarations

_default: `true`_

By default, Stencil will generate type declaration files (`.d.ts` files) as a part of the `dist-custom-elements` output target through the `generateTypeDeclarations` field on the target options. Type declaration files will be placed in the `dist/types` directory in the root of a Stencil project. At this time, this output destination is not able to be configured.

Setting this flag to `false` will not generate type declaration files for the `dist-custom-elements` output target.

:::note
When set to generate type declarations, Stencil respects the export behavior selected via `customElementsExportBehavior` and generates type declarations specific to the content of the generated [output directory's](#dir) `index.js` file.
:::

### includeGlobalScripts

_default: `false`_

Setting this flag to `true` will include [global scripts](../config/01-overview.md#globalscript) in the bundle and execute them once the bundle entry point in loaded.

### isPrimaryPackageOutputTarget

_default: `false`_

If `true`, this output target will be used to validate `package.json` fields for your project's distribution. See the overview of [primary package output target validation](./01-overview.md#primary-package-output-target-validation)
for more information.

### minify

_default: `false`_

Setting this flag to `true` will cause file minification to follow what is specified in the [Stencil config](../config/01-overview.md#minifyjs). _However_, if [`externalRuntime`](#externalruntime) is enabled, it will override this option and always result in minification being disabled.

## Making Assets Available

For performance reasons, the generated bundle does not include [local assets](../guides/assets.md) built within the JavaScript output, 
but instead it's recommended to keep static assets as external files. By keeping them external this ensures they can be requested on-demand, rather
than either welding their content into the JS file, or adding many URLs for the bundler to add to the output.
One method to ensure [assets](../guides/assets.md) are available to external builds and http servers is to set the asset path using `setAssetPath()`.

The `setAssetPath()` function is used to manually set the base path where static assets can be found.
For the lazy-loaded output target the asset path is automatically set and assets copied to the correct
build directory. However, for custom elements builds, the `setAssetPath(path)` should be
used to customize the asset path depending on where they are found on the http server.

If the component's script is a `type="module"`, it's recommended to use `import.meta.url`, such
as `setAssetPath(import.meta.url)`. Other options include `setAssetPath(document.currentScript.src)`, or using a bundler's replace plugin to
dynamically set the path at build time, such as `setAssetPath(process.env.ASSET_PATH)`.

```tsx
import { setAssetPath } from 'my-library/dist/components';

setAssetPath(document.currentScript.src);
```

Make sure to copy the assets over to a public directory in your app. This configuration depends on how your script is bundled, or lack of
bundling, and where your assets can be loaded from. How the files are copied to the production build directory depends on the bundler or tooling.
The configs below provide examples of how to do this automatically with popular bundlers.

## Example Bundler Configs

Instructions for consuming the custom elements bundle vary depending on the bundler you're using. These examples will help your users consume your components with webpack and Rollup.

The following examples assume your component library is published to NPM as `my-library`. You should change this to the name you actually publish your library with.

Users will need to install your library before importing them.

```bash npm2yarn
npm install my-library
```

### webpack.config.js

A webpack config will look something like the one below. Note how assets are copied from the library's `node_module` folder to `dist/assets` via the `CopyPlugin` utility. This is important if your library includes [local assets](../guides/assets.md).

```js
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'node_modules/my-library/dist/my-library/assets'),
          to: path.resolve(__dirname, 'dist/assets'),
        },
      ],
    }),
  ],
};
```

### rollup.config.js

A Rollup config will look something like the one below. Note how assets are copied from the library's `node_module` folder to `dist/assets` via the `rollup-copy-plugin` utility. This is important if your library includes [local assets](../guides/assets.md).

```js
import path from 'path';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import postcss from 'rollup-plugin-postcss';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.js',
  output: [{ dir: path.resolve('dist/'), format: 'es' }],
  plugins: [
    resolve(),
    commonjs(),
    postcss({
      extensions: ['.css'],
    }),
    copy({
      targets: [
        {
          src: path.resolve(__dirname, 'node_modules/my-library/dist/my-library/assets'),
          dest: path.resolve(__dirname, 'dist'),
        },
      ],
    }),
  ],
};
```
