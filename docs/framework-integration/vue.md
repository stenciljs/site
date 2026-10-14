---
title: Vue Integration with Stencil
sidebar_label: Vue
description: Generate a Vue component library from your Stencil components
slug: /vue
---

# Vue Integration

**Supports: Vue 3 • Stencil v5**

`@stencil/vue-output-target` generates a Vue component for each of your Stencil components. Consumers of your library get real Vue components: typed props, typed events, `v-model` on your form controls, and optional server-side rendering in Nuxt.

Vue 3 can also render custom elements without wrappers. If typed props and events are all your consumers need, [Framework Types](./framework-types.md) is a lighter option.

## Setup

The generated Vue components live in their own package, published alongside your Stencil library. A monorepo with one package for each is the recommended structure:

```tree
my-design-system/
├── package.json          workspace root
└── packages/
    ├── core/             your Stencil library
    └── vue/              the generated Vue library
```

### New Project

Run the [`stencil init` wizard](../getting-started/01-getting-started.md), pick **Vue** under framework integrations, and accept the monorepo workspace prompt. It creates the structure above with both packages configured.

### Existing Project

Run the wizard from your Stencil project:

```bash
stencil add @stencil/vue-output-target
```

It asks where the Vue package should go and how the components should load (see [Loading Components](#loading-components)), then:

- creates the Vue package, with its `package.json`, `tsconfig.json`, and entry file
- adds `vueOutputTarget()` to your `stencil.config.ts`, along with the output target it builds on
- with lazy loading, creates the [plugin](#loading-components) consumers install to register your components
- installs the dependencies for both packages

### Manual Setup

To do the same by hand, install the output target in your Stencil project:

```bash npm2yarn
npm install @stencil/vue-output-target --save-dev
```

Add it to your config, pointing `proxiesFile` at a file in the Vue package's source directory:

```ts title="packages/core/stencil.config.ts"
import { Config } from '@stencil/core';
import { vueOutputTarget } from '@stencil/vue-output-target';

export const config: Config = {
  namespace: 'MyLibrary',
  outputTargets: [
    { type: 'standalone' },
    vueOutputTarget({
      componentCorePackage: 'my-library',
      proxiesFile: '../vue/src/components.ts',
      includeImportCustomElements: true,
      includeDefineCustomElements: false,
      customElementsDir: 'dist/standalone',
    }),
  ],
};
```

The Vue package depends on your Stencil library and on `@stencil/vue-output-target`, which provides the runtime the generated components use:

```json title="packages/vue/package.json"
{
  "name": "my-library-vue",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" }
  },
  "scripts": {
    "build": "tsc"
  },
  "dependencies": {
    "my-library": "^1.0.0",
    "@stencil/vue-output-target": "^0.14.0"
  },
  "peerDependencies": {
    "vue": "^3.4.0"
  }
}
```

Its entry file re-exports the generated components:

```ts title="packages/vue/src/index.ts"
export * from './components.js';
```

### Loading Components

The Vue components can load your custom elements in two ways:

| | Standalone | Lazy |
|---|---|---|
| Built on | [`standalone`](../output-targets/main/standalone.md) | [`loader-bundle`](../output-targets/main/loader-bundle.md) |
| Registration | Each Vue component imports and registers its own custom element. | Your Vue package exports a plugin that registers every component with the lazy loader. Consumers install it when they want that to happen. |
| What consumers ship | Only the components their app imports. | The loader, which fetches each component's code when it first appears on a page. |
| Options | `includeImportCustomElements: true`, `includeDefineCustomElements: false`, `customElementsDir` | none |

The config above is the standalone setup. For lazy loading, the output target needs only the two base options:

```ts
outputTargets: [
  { type: 'loader-bundle' },
  vueOutputTarget({
    componentCorePackage: 'my-library',
    proxiesFile: '../vue/src/components.ts',
  }),
],
```

Your Vue package then needs a plugin that calls the loader, exported next to the components. The wizard creates this file for you:

```ts title="packages/vue/src/plugin.ts"
import type { Plugin } from 'vue';
import { defineCustomElements } from 'my-library/dist/loader-bundle/loader';

export const ComponentLibrary: Plugin = {
  install() {
    defineCustomElements();
  },
};
```

```ts title="packages/vue/src/index.ts"
export * from './components.js';
export * from './plugin.js';
```

If your library sets [`generateExportMaps`](../config/01-overview.md#generateexportmaps), import the loader from `my-library/loader` instead.

The plugin is your code, and Stencil never regenerates it. It's the place for any setup your library needs before its components are defined, such as [`setNonce()`](../guides/distribution/csp-nonce.md) or [`setTagTransformer()`](../guides/distribution/tag-transformation.md), which the loader also exports.

## Building

Build the Stencil library first. That writes the Vue components to `packages/vue/src/components.ts`. Then build the Vue package:

```bash npm2yarn
npm run build
```

In a workspace created by the wizard, running this from the root builds both in order.

Publish the two packages together, keeping their versions in step. See [Publishing](../guides/distribution/publishing.md).

## Consumer Usage

Consumers install your Vue package and import components from it:

```html
<script setup lang="ts">
import { MyButton } from 'my-library-vue';
</script>

<template>
  <MyButton variant="primary" @my-press="(event) => console.log(event.detail)">Save</MyButton>
</template>
```

With a [lazy](#loading-components) library, they also install its plugin once, when their app starts:

```ts title="src/main.ts"
import { createApp } from 'vue';
import { ComponentLibrary } from 'my-library-vue';
import App from './App.vue';

createApp(App).use(ComponentLibrary).mount('#app');
```

To call a method on a component, go through the underlying element:

```ts
const button = ref();

button.value.$el.setFocus();
```

Slots work as they do on any custom element, with the `slot` attribute. Vue's ESLint plugin flags that attribute as deprecated Vue 2 syntax, so consumers may need to turn off the `vue/no-deprecated-slot-attribute` rule.

### v-model

To let consumers use `v-model` on a component, tell the output target which prop holds the value and which event reports a change:

```ts
vueOutputTarget({
  componentCorePackage: 'my-library',
  proxiesFile: '../vue/src/components.ts',
  componentModels: [
    {
      elements: ['my-input', 'my-textarea'],
      event: 'myChange',
      targetAttr: 'value',
    },
  ],
}),
```

```html
<MyInput v-model="name" />
```

When the event fires, the new value is read from the element's `value` property (the `targetAttr`). To read it from the event instead, set `eventAttr` to its path on the event, for example `eventAttr: 'detail.value'`.

## Server-Side Rendering

With `hydrateModule` set, the generated components render on the server in Nuxt. See [SSR in Frameworks](../output-targets/main/ssr/frameworks.md#nuxt).

## API

### proxiesFile

**Required**

**Type: `string`**

The file the Vue components are written to, relative to your Stencil project.

### componentCorePackage

**Type: `string`**

The package name of your Stencil library, which the generated components import from.

### componentModels

**Type: `ComponentModelConfig[]`**

**Default: `[]`**

The components that support `v-model`. See [v-model](#v-model).

### includeImportCustomElements

**Type: `boolean`**

Each Vue component imports and registers its own custom element from the `standalone` output. Can't be combined with `includeDefineCustomElements`.

### customElementsDir

**Type: `string`**

The directory of the `standalone` output, relative to your Stencil project. Used with `includeImportCustomElements`.

### includeDefineCustomElements

**Type: `boolean`**

Makes the generated file call the lazy loader's `defineCustomElements()` itself, as soon as the Vue package is imported. Leave it unset to let consumers decide when to register, with a [plugin](#loading-components).

### includePolyfills

**Type: `boolean`**

Stencil v4 only. It imports `applyPolyfills()` from the lazy loader, which Stencil v5 no longer has, so leave it unset.

### loaderDir

**Type: `string`**

Where the lazy loader is, relative to your Stencil project. Only needed if it isn't in the `loader-bundle` output's default location.

### esModules

**Type: `boolean`**

**Default: `false`**

Write each component to its own file, with `proxiesFile` re-exporting them all. Requires `includeImportCustomElements`.

### excludeComponents

**Type: `string[]`**

Tag names to leave out of the Vue library.

### hydrateModule

**Type: `string`**

The import path of your library's [`ssr` module](../output-targets/main/ssr/01-overview.md): `my-library/dist/ssr`, or `my-library/ssr` if your library sets [`generateExportMaps`](../config/01-overview.md#generateexportmaps). Setting it enables server-side rendering.

### transformTag

**Type: `boolean`**

**Default: `false`**

Generates a `tag-transformer.ts` file alongside the components, so consumers can register them under different tag names. See [Tag Transformation](../guides/distribution/tag-transformation.md#vue).
