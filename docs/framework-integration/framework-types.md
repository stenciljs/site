---
title: Framework Types
sidebar_label: Framework Types
description: Generate type definitions so frameworks can type-check your custom elements, without wrapper components
slug: /framework-types
---

# Framework Types

React 19, Vue 3, Solid, Svelte, and Preact can all render custom elements directly, so consumers of your library don't need wrapper components to use `<my-button>` in a template. What they don't get out of the box is type-checking: the framework's TypeScript types don't know your tags or their props.

`@stencil/types-output-target` generates a type definition file for each framework that adds your components to its known elements. It covers each component's props and events, and produces types only, with no runtime code. For Angular, React 18, or framework features like `v-model` and [server-side rendering](../output-targets/main/ssr/frameworks.md), use the [Angular](./angular.md), [React](./react.md), or [Vue](./vue.md) wrappers instead.

## Setup

Run the wizard in your Stencil project and pick the frameworks to generate types for:

```bash
stencil add @stencil/types-output-target
```

Or set it up by hand. Install the package:

```bash npm2yarn
npm install @stencil/types-output-target --save-dev
```

Then add the output target, with a path for each framework you want:

```ts title="stencil.config.ts"
import { Config } from '@stencil/core';
import { typesOutputTarget } from '@stencil/types-output-target';

export const config: Config = {
  outputTargets: [
    typesOutputTarget({
      reactTypesPath: 'dist/types',
      vueTypesPath: 'dist/types',
    }),
  ],
};
```

`stencil build` now writes one file per framework:

```tree
dist/types
├── react-native-types.d.ts
└── vue-native-types.d.ts
```

### Publishing the Types

Add an entry for each file to your `package.json` `exports`, so consumers can import it. List the framework as an optional peer dependency, so TypeScript can resolve the framework's own types from your package:

```json title="package.json"
{
  "exports": {
    "./react-types": {
      "types": "./dist/types/react-native-types.d.ts"
    },
    "./vue-types": {
      "types": "./dist/types/vue-native-types.d.ts"
    }
  },
  "peerDependencies": {
    "@types/react": ">=19",
    "vue": ">=3"
  },
  "peerDependenciesMeta": {
    "@types/react": { "optional": true },
    "vue": { "optional": true }
  }
}
```

## Consumer Usage

A consuming app imports the types once, anywhere in its source:

```tsx
import 'my-library/react-types';
```

Your tags are then type-checked like any built-in element:

```tsx
<my-button variant="secondary">Save</my-button>
```

The consumer still needs to load and register the components themselves - see [Publishing](../guides/distribution/publishing.md#consuming-your-library).

## API

### reactTypesPath

Where to write the React types. A directory, in which case the file is named `react-native-types.d.ts`, or a full path ending in `.d.ts`. Requires React 19 or later in the consuming app.

### vueTypesPath

Where to write the Vue 3 types. Default file name: `vue-native-types.d.ts`.

### solidTypesPath

Where to write the Solid types. Default file name: `solid-native-types.d.ts`.

### svelteTypesPath

Where to write the Svelte types. Default file name: `svelte-native-types.d.ts`.

### preactTypesPath

Where to write the Preact types. Default file name: `preact-native-types.d.ts`.

### excludeComponents

Tag names to leave out of the generated types.

```ts
typesOutputTarget({
  reactTypesPath: 'dist/types',
  excludeComponents: ['my-internal-component'],
}),
```
