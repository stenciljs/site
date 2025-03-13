---
title: React Integration with Stencil
sidebar_label: React
description: Learn how to wrap your components so that people can use them natively in React
slug: /react
---

# React Integration

**Supports: React v17+ • TypeScript v5+ • Stencil v4.2.0+**

Automate the creation of React component wrappers for your Stencil web components.

This package includes an output target for code generation that allows developers to generate a React component wrapper for each Stencil component and a minimal runtime package built around [@lit/react](https://www.npmjs.com/package/@lit/react) that is required to use the generated React components in your React library or application.

- ♻️ Automate the generation of React component wrappers for Stencil components
- 🌐 Generate React functional component wrappers with JSX bindings for custom events and properties
- ⌨️ Typings and auto-completion for React components in your IDE
- 🚀 Support for Server Side Rendering (SSR) when used with frameworks like [Next.js](https://nextjs.org/)

To generate these framework wrappers, Stencil provides an Output Target library called [`@stencil/react-output-target`](https://www.npmjs.com/package/@stencil/react-output-target) that can be added to your `stencil.config.ts` file. This also enables Stencil components to be used within e.g. Next.js or other React based application frameworks.

## Setup

### Project Structure

We recommend using a [monorepo](https://www.toptal.com/front-end/guide-to-monorepos) structure for your component library with component
wrappers. Your project workspace should contain your Stencil component library and the library for the generated React component wrappers.

An example project set-up may look similar to:

```
top-most-directory/
└── packages/
    ├── stencil-library/
    │   ├── stencil.config.js
    │   └── src/components/
    └── react-library/
        └── src/
            ├── components/
            └── index.ts
```

This guide uses Lerna for the monorepo, but you can use other solutions such as Nx, Turborepo, etc.

To use Lerna with this walk through, globally install Lerna:

```bash npm2yarn
npm install --global lerna
```

#### Creating a Monorepo

:::note
If you already have a monorepo, skip this section.
:::

```bash npm2yarn
# From your top-most-directory/, initialize a workspace
lerna init

# install dependencies
npm install

# install typescript and node types
npm install typescript @types/node --save-dev
```

#### Creating a Stencil Component Library

:::note
If you already have a Stencil component library, skip this section.
:::

From the `packages/` directory, run the following commands to create a Stencil component library:

```bash npm2yarn
npm init stencil components stencil-library
cd stencil-library
# Install dependencies
npm install
```

##### Component Imports

If you encounter import errors in your `components.ts` file, update the Stencil library's `package.json` to include comprehensive exports:

```json title="package.json"
"exports": {
 ".": {
   "import": "./dist/stencil-library/stencil-library.esm.js",
   "require": "./dist/stencil-library/stencil-library.cjs.js"
 },
 "./dist/*": {
   "import": "./dist/*",
   "types": "./dist/*"
 },
 "./components/*": {
   "import": "./dist/components/*.js",
   "types": "./dist/components/*.d.ts"
 },
 "./loader": {
   "import": "./loader/index.js",
   "require": "./loader/index.cjs",
   "types": "./loader/index.d.ts"
 }
}
```

#### Creating a React Component Library

:::note
If you already have a React component library, skip this section.
:::

The first time you want to create the component wrappers, you will need to have a React library package to write to.

Run the following commands from the root directory of your monorepo to create a React component library:

```bash npm2yarn
# Create a project
lerna create react-library # fill out the prompts accordingly
cd packages/react-library

# Install core dependencies
npm install react react-dom typescript @types/react --save-dev

# Install output target runtime dependency
npm install @stencil/react-output-target --save
```

Lerna does not ship with a TypeScript configuration. At the root of the workspace, create a `tsconfig.json`:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "noImplicitAny": false,
    "removeComments": true,
    "noLib": false,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "target": "es6",
    "sourceMap": true,
    "lib": ["es6"]
  },
  "exclude": ["node_modules", "**/*.spec.ts", "**/__tests__/**"]
}
```

In your `react-library` project, create a project specific `tsconfig.json` that will extend the root config:

```json title="packages/react-library/tsconfig.json"
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "skipLibCheck": true,
    "jsx": "react",
    "allowSyntheticDefaultImports": true,
    "declarationDir": "./dist/types"
  },
  "include": ["lib"],
  "exclude": ["node_modules"]
}
```

Update the generated `package.json` in your `react-library`, adding the following options to the existing config:

```diff title="packages/react-library/package.json"
{
-  "main": "lib/react-library.js",
+  "main": "dist/index.js",
+  "module": "dist/index.js",
+  "types": "dist/types/index.d.ts",
  "scripts": {
-    "test": "node ./__tests__/react-library.test.js"
+    "test": "node ./__tests__/react-library.test.js",
+    "build": "npm run tsc",
+    "tsc": "tsc -p . --outDir ./dist"
-  }
+  },
   "files": [
-    "lib"
+    "dist"
   ],
+  "publishConfig": {
+    "access": "public"
+  },
+  "dependencies": {
+    "stencil-library": "*"
+  }
}
```

:::note
The `stencil-library` dependency is how Lerna knows to resolve the internal Stencil library dependency. See Lerna's documentation on
[package dependency management](https://lerna.js.org/docs/getting-started#package-dependency-management) for more information.
:::

### Adding the React Output Target

#### Step 1 - Stencil Component Library

Install the `@stencil/react-output-target` dependency to your Stencil component library package.

```bash npm2yarn
# Install dependency
npm install @stencil/react-output-target --save-dev
```

In your project's `stencil.config.ts`, add the `reactOutputTarget` configuration to the `outputTargets` array:

```ts title="stencil.config.ts"
import { reactOutputTarget } from '@stencil/react-output-target';

export const config: Config = {
  namespace: 'stencil-library',
  outputTargets: [
    reactOutputTarget({
      // Relative path to where the React components will be generated
      outDir: '../react-library/lib/components/stencil-generated/',
    }),
    // dist-custom-elements output target is required for the React output target
    { type: 'dist-custom-elements' },
  ],
};
```

:::tip

The `outDir` is the relative path to the file that will be generated with all of the React component wrappers. You will replace the
file path to match your project's structure and respective names.

:::

See the [API section below](#api) for details on each of the output target's options.

:::note
In order to compile Stencil components optimized for server side rendering in e.g. Next.js applications that use [AppRouter](https://nextjs.org/docs/app), make sure to provide the [`hydrateModule`](#hydratemodule) property to the output target configuration.
:::

You can now build your Stencil component library to generate the component wrappers.

```bash npm2yarn
# Build the library and wrappers
npm run build
```

If the build is successful, you’ll see the new generated file in your React component library at the location specified by the `outDir` argument.

#### Step 2 - React Component Library

Install the `@stencil/react-output-target` dependency to your React component library package. This step is required to add the runtime dependencies required to use the generated React components.

```bash npm2yarn
# Install dependency
npm install @stencil/react-output-target --save
```

Verify or update your `tsconfig.json` file to include the following settings:

```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler"
  }
}
```

:::info

`moduleResolution": "bundler"` is required to resolve the secondary entry points in the `@stencil/react-output-target` runtime package. You can learn more about this setting in the [TypeScript documentation](https://www.typescriptlang.org/docs/handbook/modules/theory.html#module-resolution).

:::

Verify or install TypeScript v5.0 or later in your project:

```bash npm2yarn
# Install dependency
npm install typescript@5 --save-dev
```

No additional configuration is needed in the React component library. The generated component wrappers will reference the runtime dependencies directly.

### Add the Components to your React Component Library's Entry File

In order to make the generated files available within your React component library and its consumers, you’ll need to export everything from within your entry file. First, rename `react-library.js` to `index.ts`. Then, modify the contents to match the following:

```tsx title="packages/react-library/src/index.ts"
export * from './components/stencil-generated/components';
```

### Link Your Packages (Optional)

:::note
If you are using a monorepo tool (Lerna, Nx, etc.), skip this section.
:::

Before you can successfully build a local version of your React component library, you will need to link the Stencil package to the React package.

From your Stencil project's directory, run the following command:

```bash npm2yarn
# Link the working directory
npm link
```

From your React component library's directory, run the following command:

```bash npm2yarn
# Link the package name
npm link name-of-your-stencil-package
```

The name of your Stencil package should match the `name` property from the Stencil component library's `package.json`.

Your component libraries are now linked together. You can make changes in the Stencil component library and run `npm run build` to propagate the
changes to the React component library.

:::tip
As an alternative to `npm link` , you can also run `npm install` with a relative path to your Stencil component library. This strategy, however, will
modify your `package.json` so it is important to make sure you do not commit those changes.
:::

## Consumer Usage

### Creating a Consumer React App

:::note
If you already have a React app, skip this section.
:::

From the `packages/` directory, run the following commands to create a starter React app:

<!-- TODO: see if we can convert this to use `npm2yarn` once related issues are resolved -->
<!-- See https://github.com/facebook/docusaurus/issues/5861 for more information -->

```bash
# Create the React app
npm create vite@latest my-app -- --template react-ts
# of if using yarn
yarn create vite my-app --template react-ts

cd ./my-app

# install dependencies
npm install
# or if using yarn
yarn install
```

You'll also need to link your React component library as a dependency. This step makes it so your React app will be able to correctly resolve imports from your React library. This
is easily done by modifying your React app's `package.json` to include the following:

```json
"dependencies": {
  "react-library": "*"
}
```

### Consuming the React Wrapper Components

This section covers how developers consuming your React component wrappers will use your package and component wrappers.

Before you can consume your React component wrappers, you'll need to build your React component library. From `packages/react-library` run:

```bash npm2yarn
npm run build
```

To make use of your React component library in your React application, import your components from your React component library in the file where you want to use them.

```tsx title="App.tsx"
import './App.css';
import { MyComponent } from 'react-library';

function App() {
  return (
    <div className="App">
      <MyComponent first="Your" last="Name" />
    </div>
  );
}

export default App;
```

### Enable Server Side Rendering (SSR)

If your React framework supports server side rendering, e.g. [Next.js](https://nextjs.org/) your Stencil components will get automatically server side rendered, if set up correctly. In order to enable this:

1. Add a `dist-hydrate-script` output target to your `stencil.config.ts` if not already existing, e.g.:
    ```ts title="stencil.config.ts"
    import { Config } from '@stencil/core';

    export const config: Config = {
      outputTargets: [
        {
          type: 'dist-hydrate-script',
          dir: './hydrate',
        },
        // ...
      ]
    };
    ```

2. Create an export for the compiled files within the `/hydrate` directory, e.g.
    ```json title="package.json"
    {
      "name": "component-library",
      ...
      "exports": {
        ...
        "./hydrate": {
          "types": "./hydrate/index.d.ts",
          "import": "./hydrate/index.js",
          "require": "./hydrate/index.cjs.js",
          "default": "./hydrate/index.js"
        },
        ...
      },
      ...
    }
    ```

3. Set the `hydrateModule` in your React output target configuration, e.g.
    ```ts title="stencil.config.ts"
    import { Config } from '@stencil/core';
    import { reactOutputTarget } from '@stencil/react-output-target';

    export const config: Config = {
      outputTargets: [
        reactOutputTarget({
          outDir: '../react-library/lib/components/stencil-generated/',
          hydrateModule: 'component-library/hydrate'
        }),
        // ...
      ]
    };
    ```

That's it! Your Next.js application should now render a Declarative Shadow DOM on the server side which will get automatically hydrated once the React runtime initiates.

#### SSR Limitations

Please be aware of the following limitations when working with server side rendered applications:

- A Declarative Shadow DOM not only encapsulates the HTML structure of a component but also includes all associated CSS. When server-side rendering numerous small components with extensive CSS, the overall document size can significantly increase, leading to longer initial page load times. To optimize performance, it's essential to maintain a manageable document size that aligns with your performance objectives. It is advisable to server-side render only the critical components required for rendering the initial viewport, while deferring the loading of additional components until after the initial render.
- A Stencil component that dynamically renders content based on elements within its Light DOM may not render correctly as the Output Target can't always serialize the children of the React component into a template string especially when working with multiple nested Stencil components.
- Currently Stencil does not support the serialization of objects within properties. This means that Stencil ignores server side rendering all properties that are defined with a reference types, e.g. `object`.

## API

### esModule

**Optional**

**Type: `boolean`**

If `true`, the output target will generate a separate ES module for each React component wrapper. Defaults to `false`.

### excludeComponents

**Optional**

**Type: `string[]`**

An array of component tag names to exclude from the React output target. Useful if you want to prevent certain web components from being in the React library.

### experimentalUseClient

**Optional**

**Type: `boolean`**

If `true`, the generated output target will include the [use client;](https://react.dev/reference/react/use-client) directive.

### outDir

**Required**

**Type: `string`**

The directory where the React components will be generated. Accepts a relative path from the Stencil project's root directory.

### stencilPackageName

**Optional**

**Type: `string`**

The name of the package that exports the Stencil components. Defaults to the package.json detected by the Stencil compiler.

### hydrateModule

**Optional**

**Type: `string`**

Enable React server side rendering (short SSR) for e.g. [Next.js](https://nextjs.org/) applications by providing an import path to the [hydrate module](../guides/hydrate-app.md) of your Stencil project that is generated through the `dist-hydrate-script` output target, e.g.:

```ts title="stencil.config.ts"
import type { Config } from '@stencil/core';

/**
 * excerpt from the Stencil example project:
 * https://github.com/ionic-team/stencil-ds-output-targets/tree/cb/nextjs/packages/example-project
 */
export const config: Config = {
  namespace: 'component-library',
  outputTargets: [
    reactOutputTarget({
      outDir: '../next-app/src/app',
      hydrateModule: 'component-library/hydrate'
    }),
    {
      type: 'dist-hydrate-script',
      dir: './hydrate',
    },
    // ...
  ],
};
```

### excludeServerSideRenderingFor

**Optional**

**Type: `string[]`**

Allows users to exclude a list of components from server side rendering by Next.js or other React
frameworks. This may be useful if you would like to generally ignore some components from being
rendered on the server or if you like roll out SSR support for your design system one component at
a time.

## FAQ's

### What is the best format to write event names?

Event names shouldn’t include special characters when initially written in Stencil. Try to lean on using camelCased event names for interoperability between frameworks.

### Can I use `dist` output target with the React output target?

No, the React output target requires the `dist-custom-elements` output target to be present in the Stencil project's configuration. The `dist-custom-elements` output target generates a separate entry for each component which best aligns with the expectations of React developers.
