---
title: Standalone Output Target
sidebar_label: standalone
description: Custom Elements with Stencil
slug: /standalone
---

# Standalone Output Target

:::note
Renamed from `dist-custom-elements` in Stencil v4. Run `stencil migrate --dry-run` to preview updating an existing config automatically.
:::

The `standalone` output target creates custom elements that directly extend `HTMLElement` and provides simple utility functions for easily defining these elements on the [Custom Element Registry](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry). Each component compiles to its own file with determinative filenames; a consuming project's own bundler only includes the ones it actually imports making it better suited to frameworks and any project that already takes care of bundling and lazy-loading itself.

Standalone components can be cherry-picked and defined individually, bundled and defined all at once, or defined automatically via the auto-loader as they appear in the DOM - see [Consumption](#consumption) below. See [Choosing Between `loader-bundle` and `standalone`](./01-overview.md#choosing-between-loader-bundle-and-standalone) for when each output target is the better fit.

Publishing this output requires the right `package.json` fields pointing at it - see [Standalone](../guides/publishing.md#standalone) in the publishing guide for the exact `exports` map.

To generate components using the `standalone` output target, add it to a project's `stencil.config.ts` file like so:

```tsx title="stencil.config.ts"
import { Config } from '@stencil/core';

export const config: Config = {
  // Other top-level config options here
  outputTargets: [
    {
      type: 'standalone',
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

By default, the `standalone` output target generates a single file per component, and exports each of those files individually.

In some cases, library authors may want to change this behavior, for instance to automatically define component children, provide a single file containing all component exports, etc.

This config option provides additional behaviors that will alter the default component export _OR_ custom element definition behaviors
for this target. The desired behavior can be set via the following in a project's Stencil config:

```ts
// stencil.config.ts
import { Config } from '@stencil/core';

export const config: Config = {
  outputTargets: [
    {
      type: 'standalone',
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

### autoLoader

_default: `true`_

Generates an auto-loader script that uses a `MutationObserver` to lazily load and define custom elements as they appear in the DOM - a `loader.js` file that auto-starts on import.

Set to `false` to skip generating it, or pass an object for more control:

```ts
outputTargets: [
  {
    type: 'standalone',
    autoLoader: {
      fileName: 'my-loader.js', // default: 'loader.js'
      autoStart: false,         // default: true - call start() yourself if false
    },
  },
]
```

### dir

_default: `'dist/standalone'`_

This config option allows you to change the output directory where the compiled output for this output target will be written.

### empty

_default: `true`_

Setting this flag to `true` will remove the contents of the [output directory](#dir) between builds.

### externalRuntime

_default: `false`_

Setting this flag to `true` marks all imports from `@stencil/core/*` as external, so they're not included in the generated bundle - consumers must provide `@stencil/core` themselves. It has no effect on minification or file naming; `standalone` output is never filename-hashed, regardless of this setting.

:::note
As of Stencil v5, component bundles are self-contained by default (`externalRuntime: false`) - the runtime is included as a local shared chunk. Set this to `true` only if you need multiple Stencil component libraries on the same page to share a single runtime instance, and ensure `@stencil/core` is included in your list of dependencies if you do - this is crucial to prevent any runtime errors.
:::

### includeGlobalScripts

_default: `false`_

Setting this flag to `true` will include [global scripts](../config/01-overview.md#globalscript) in the bundle and execute them once the bundle entry point in loaded.

### minify

_default: follows the Stencil config's [`minifyJs`](../config/01-overview.md#minifyjs) option - minified in a production build, unminified in dev_

Set this explicitly to `true` or `false` to override that default for this output target specifically.

### skipInDev

_default: `true` if [`loader-bundle`](./loader-bundle.md) is also configured, else `false`_

Skips this output target during development builds (`--dev`) to improve build times. If `loader-bundle` is configured too, `standalone` is treated as the secondary output and skipped in dev by default; with no `loader-bundle`, `standalone` is the primary output and builds in dev as well. Set this explicitly to override either default.

## Consumption

Your users can either install your library via npm and import the components they need, or load them directly from a CDN within a `<script type="module">` tag.

### Cherry-Picking Components

Import and define only the components consumers use - each compiles to its own file, so a bundler only includes what's imported:

```ts
import { MyComponent, defineCustomElement } from 'my-library/my-component';

defineCustomElement();
// or define it yourself:
customElements.define('my-component', MyComponent);
```

:::note
A component's `defineCustomElement()` also defines any child components it depends on, so you rarely need to import and define those separately. If defining the class yourself with `customElements.define()` you must also make sure to define any child components too.
:::

### Bundling All Components

Set [`customElementsExportBehavior: 'bundle'`](#customelementsexportbehavior) to register every component from a single call instead of one `defineCustomElement()` each:

```ts
import { defineCustomElements } from 'my-library';

defineCustomElements();
```

This defines every component immediately. `loader-bundle` exports a same-named `defineCustomElements()`, but that one lazy-loads each component's logic on first use - the two aren't interchangeable across output targets.

### Auto-Loading Components

With [`autoLoader`](#autoloader), components register themselves as they appear in the DOM - no import or `defineCustomElement` call needed:

```ts
import 'my-library/dist/standalone/loader.js';
```

A `MutationObserver` watches the page and defines each custom element the first time it appears, at the cost of being less performant than `loader-bundle`'s per-component lazy loading, which can statically analyze which components a page needs ahead of time.

## Assets

Component asset resolution works the same as every other output target - see the [Assets guide](../guides/assets.md) for `assetsDirs`, `getAssetPath()`, `setAssetPath()`, and [making the asset files themselves servable to a consumer using a bundler](../guides/assets.md#3-make-assets-available-in-consuming-applications).
