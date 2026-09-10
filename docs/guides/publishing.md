---
title: Publishing & Consuming a Component Library
sidebar_label: Publishing & Consuming
description: How to publish a Stencil component library and how consumers use it
slug: /publishing
---

Stencil makes it easy to publish a component library and generate the [output targets](../output-targets/01-overview.md) that fit how it'll be consumed.

## Publishing to NPM

1. Build your distributable output via `stencil build`.
2. Make sure your build output actually gets published. Stencil warns you ahead of time if you need to make important adjustments to your `package.json`.
3. Bump the version and publish: `npm version patch` (or `minor`/`major`), then `npm publish` - add `--access public` the first time you publish a scoped package.

This covers the npm registry specifically; the same package works the same way on other registries (GitHub Packages, a private registry) using their own publish commands. Once published, other projects can add your component library as a dependency - the rest of this page covers how they'll actually consume it, depending on which output target(s) you generated.

## Consuming Your Library

To use your Stencil components in other projects, there are two different output targets to consider: [`loader-bundle`](../output-targets/dist.md) and [`standalone`](../output-targets/custom-elements.md). Both can be generated at the same time, using the same source code, and shipped in the same distribution - it's up to the consumer of your component library to decide which build to use. See [Choosing Between `loader-bundle` and `standalone`](../output-targets/01-overview.md#choosing-between-loader-bundle-and-standalone) for the tradeoffs. If your components reference static assets, see [Making Assets Available](../output-targets/custom-elements.md#making-assets-available) for how the asset path is resolved for either output target.

:::note
If you distribute both, pick one of them as the `main` package.json entry depending on which use case is more prominent - `loader-bundle` takes priority by default if both are configured (see [Package.json Validation](../output-targets/01-overview.md#packagejson-validation)).
:::

### Lazy Loading

If you prefer to have your components automatically loaded when used in your application, we recommend enabling the [`loader-bundle`](../output-targets/dist.md) output target. The bundle gives you a small entry file that registers all your components and defers loading the full component logic until it is rendered in your application. This works the same regardless of framework, or with no framework at all.

Once published, a `script` tag can load your components straight from a CDN. The self-registering file lives at `dist/loader-bundle/<namespace>/<namespace>.js`, where `<namespace>` is your Stencil `namespace` config value, lowercased - it defaults to your `package.json` name if you don't set one explicitly. Check your own `dist/loader-bundle/` output to confirm the exact folder name for your project:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/my-design-system@1.0.0/dist/loader-bundle/my-design-system/my-design-system.js"></script>
```

From a bundler or npm-based project, import the loader and call `defineCustomElements()` once, rather than importing the package itself for side effects:

```ts
import { defineCustomElements } from 'my-design-system';

defineCustomElements();
```

Make sure your `package.json` has an `exports` or `module` entry pointing at the loader - either add it yourself (see [Package.json Validation](../output-targets/01-overview.md#packagejson-validation) for the paths Stencil expects), or set [`generateExportMaps: true`](../config/01-overview.md#generateexportmaps) and `stencil build` generates the `exports` map for you:

```json
{
  "exports": {
    ".": { 
      "import": "./dist/loader-bundle/esm/loader.js", 
      "types": "./dist/types/loader.d.ts" 
    },
    "./loader": { 
      "import": "./dist/loader-bundle/esm/loader.js", 
      "types": "./dist/types/loader.d.ts" 
    }
  }
}
```

Read more about various options when it comes to configuring your project's components for lazy loading in the [`loader-bundle`](../output-targets/dist.md) output target section.

### Standalone

The [`standalone`](../output-targets/custom-elements.md) output target builds each component as a stand-alone class that extends `HTMLElement`. The output is a standardized custom element with the styles already attached and without any of Stencil's lazy-loading. This may be preferred for projects that are already handling bundling and / or lazy-loading.

Each generated file exports a component class and a `defineCustomElement` function - registering the custom element is up to you; it doesn't happen automatically on import.

You can use these standalone components by importing them via their own component subpath:

```ts
import { MyComponent, defineCustomElement } from 'my-design-system/my-component';

// register to CustomElementRegistry
defineCustomElement();

// or extend custom element via
class MyCustomComponent extends MyComponent {
  // ...
}
customElements.define('my-custom-component', MyCustomComponent);
```

:::note
[`customElementsExportBehavior`](../output-targets/custom-elements.md#customelementsexportbehavior) controls this: `single-export-module` re-exports every component from the root instead of its own subpath, and `auto-define-custom-elements` skips the explicit `defineCustomElement()` call by registering components automatically on import.
:::

To ensure that the right entry file is loaded when importing the project, define [exports fields](https://nodejs.org/api/packages.html#exports) in your `package.json`:

```json
{
  "exports": {
    ".": {
      "import": "./dist/standalone/index.js",
      "types": "./dist/standalone/index.d.ts"
    },
    "./my-component": {
      "import": "./dist/standalone/my-component.js",
      "types": "./dist/standalone/my-component.d.ts"
    }
  },
  "types": "dist/types/index.d.ts"
}
```

You can also set [`generateExportMaps: true`](../config/01-overview.md#generateexportmaps) in your `stencil.config.ts` to have Stencil maintain this map for you, including a fresh entry for every component.

#### Auto-Loader

For convenience, the standalone output also generates an auto-loader script by default - it uses a `MutationObserver` to watch the DOM and load each component's module as it appears, so you don't have to import or define components yourself:

```json
{
  "exports": {
    "./loader": { 
      "import": "./dist/standalone/loader.js", 
      "types": "./dist/standalone/loader.d.ts" 
    }
  }
}
```

```ts
import 'my-design-system/loader';
```

It starts watching as soon as it's imported; `start()`/`stop()` are also exported for manual control.

:::note
If making extensive use of the auto-loader, consider [`loader-bundle`](../output-targets/dist.md) instead - it's purpose-built for loading components on demand and does so more efficiently.
:::

Read more about various options when it comes to distributing your components as standalone components in the [`standalone`](../output-targets/custom-elements.md) output target section.
