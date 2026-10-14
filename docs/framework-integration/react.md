---
title: React Integration with Stencil
sidebar_label: React
description: Generate a React component library from your Stencil components
slug: /react
---

# React Integration

**Supports: React 18 and 19 • Stencil v5**

`@stencil/react-output-target` generates a React component for each of your Stencil components. Consumers of your library get real React components: typed props, `onMyEvent` handlers for your custom events, refs, and optional server-side rendering in Next.js. They never touch the custom elements directly.

React 19 can also render custom elements without wrappers. If typed props are all your consumers need, [Framework Types](./framework-types.md) is a lighter option.

## Setup

The generated React components live in their own package, published alongside your Stencil library. A monorepo with one package for each is the recommended structure:

```tree
my-design-system/
├── package.json          workspace root
└── packages/
    ├── core/             your Stencil library
    └── react/            the generated React library
```

### New Project

Run the [`stencil init` wizard](../getting-started/01-getting-started.md), pick **React** under framework integrations, and accept the monorepo workspace prompt. It creates the structure above with both packages configured.

### Existing Project

Run the wizard from your Stencil project:

```bash
stencil add @stencil/react-output-target
```

It asks where the React package should go and whether to enable [server-side rendering](#server-side-rendering), then:

- creates the React package, with its `package.json`, `tsconfig.json`, and entry file
- adds `reactOutputTarget()` to your `stencil.config.ts`, along with the [`standalone`](../output-targets/main/standalone.md) output target it builds on
- installs the dependencies for both packages

### Manual Setup

To do the same by hand, install the output target in your Stencil project:

```bash npm2yarn
npm install @stencil/react-output-target --save-dev
```

Add it to your config, pointing `outDir` at the React package's source directory:

```ts title="packages/core/stencil.config.ts"
import { Config } from '@stencil/core';
import { reactOutputTarget } from '@stencil/react-output-target';

export const config: Config = {
  namespace: 'MyLibrary',
  outputTargets: [
    { type: 'standalone' },
    reactOutputTarget({
      outDir: '../react/src',
    }),
  ],
};
```

The React package depends on your Stencil library and on `@stencil/react-output-target`, which provides the runtime the generated components use:

```json title="packages/react/package.json"
{
  "name": "my-library-react",
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
    "@stencil/react-output-target": "^1.6.0"
  },
  "peerDependencies": {
    "react": "^18 || ^19",
    "react-dom": "^18 || ^19"
  }
}
```

Its entry file re-exports the generated components:

```ts title="packages/react/src/index.ts"
export * from './components.js';
```

## Building

Build the Stencil library first. That writes the React components to `packages/react/src/components.ts`. Then build the React package:

```bash npm2yarn
npm run build
```

In a workspace created by the wizard, running this from the root builds both in order.

Publish the two packages together, keeping their versions in step. See [Publishing](../guides/distribution/publishing.md).

## Consumer Usage

Consumers install your React package and import components from it:

```tsx
import { MyButton } from 'my-library-react';

export function SaveBar() {
  return (
    <MyButton variant="primary" onMyPress={(event) => console.log(event.detail)}>
      Save
    </MyButton>
  );
}
```

Each component registers its own custom element when it's first imported, so there's no loader to call, and a bundler includes only the components an app uses.

A custom event named `myPress` becomes an `onMyPress` prop. Write event names in camelCase in your Stencil components so they read naturally in every framework.

## Server-Side Rendering

With `hydrateModule` set, the output target also generates server versions of the components for Next.js. See [SSR in Frameworks](../output-targets/main/ssr/frameworks.md#nextjs) for the full setup.

## API

### outDir

**Required**

**Type: `string`**

The directory the React components are written to, relative to your Stencil project.

### esModules

**Type: `boolean`**

**Default: `false`**

Write each component to its own file, with `components.ts` re-exporting them all, instead of one file containing every component.

### excludeComponents

**Type: `string[]`**

Tag names to leave out of the React library.

### stencilPackageName

**Type: `string`**

The package the generated components import your Stencil library from. Defaults to the `name` in your Stencil project's `package.json`.

### customElementsDir

**Type: `string`**

The directory of the `standalone` output, relative to your Stencil project. Defaults to that output target's own `dir`.

### hydrateModule

**Type: `string`**

The import path of your library's [`ssr` module](../output-targets/main/ssr/01-overview.md): `my-library/dist/ssr`, or `my-library/ssr` if your library sets [`generateExportMaps`](../config/01-overview.md#generateexportmaps). Setting it enables server-side rendering, and requires [`clientModule`](#clientmodule) and the `ssr` output target.

### clientModule

**Type: `string`**

The name of your React package, for example `my-library-react`. The server components import the client components from it. Required when `hydrateModule` is set.

### excludeServerSideRenderingFor

**Type: `string[]`**

Tag names to render on the client only, when server-side rendering is enabled.

### serializeShadowRoot

**Type: `'declarative-shadow-dom' | 'scoped' | { 'declarative-shadow-dom'?: string[]; scoped?: string[]; default: 'declarative-shadow-dom' | 'scoped' } | false`**

**Default: `'declarative-shadow-dom'`**

How shadow DOM components are rendered on the server. See [`serializeShadowRoot`](../output-targets/main/ssr/01-overview.md#serializeshadowroot).

### transformTag

**Type: `boolean`**

**Default: `false`**

Generates a `tag-transformer.ts` file alongside the components, so consumers can register them under different tag names. See [Tag Transformation](../guides/distribution/tag-transformation.md#react).
