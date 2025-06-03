---
title: Server Side Rendering
sidebar_label: Server Side Rendering
description: Server Side Rendering
slug: /server-side-rendering
---

# Server-Side Rendering (SSR) with Stencil

Stencil provides server-side rendering (SSR) support for React and Vue Output Targets. If you're using frameworks like [Vite](https://vite.dev/), [Remix](https://remix.run/), [Next.js](https://nextjs.org/) or [Nuxt](https://nuxt.com/), Stencil automatically enhances these frameworks to render components on the server using a [Declarative Shadow DOM](https://web.dev/articles/declarative-shadow-dom) or in [scoped mode](/docs/styling#scoped-css).

The first step to enable server side rendering is to generate a hydrate module of your components.

## Hydrate Module

The Hydrate Module is a standalone bundle of all your components that uses a JavaScript implementation of various HTML and DOM standards to render Stencil components in a Node.js environment. To create this bundle you have to add `dist-hydrate-script` to your Stencil configuration:

```tsx title="stencil.config.ts"
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

This will create the Hydrate Module which you can export separately via:

```ts title="package.json"
{
  "name": "component-library",
  ...
  "exports": {
    ...
    "./hydrate": {
      "types": "./hydrate/index.d.ts",
      "import": "./hydrate/index.mjs",
      "require": "./hydrate/index.js",
      "default": "./hydrate/index.js"
    },
    ...
  },
  ...
}
```

## Enable SSR for StencilJS

For serializing Stencil components on the server, Stencil uses a package called `@stencil/ssr` which you can install via:

```sh
npm install --save-dev @stencil/ssr
```

It exports compiler plugins for Vite based projects, e.g. Remix or Webpack based ones like Next.js. The plugin requires the following options:

#### `module`

The import of the package that exports all your Stencil React components. It helps the package to understand which components can be server side rendered.

#### `from`

The name of the package that exports all your Stencil React components. Stencil will look up all imports from that package and transforms the statement to use a server side rendered version of the component.

#### `hydrateModule`

Your generated hydrate module that gives the package the primitives to serialize a given Stencil component.

#### `serializeShadowRoot`

**optional**

**default: __declarative-shadow-dom__**

Configurations on how the components should be rendered on the server, e.g. as Declarative Shadow DOM, as scoped components or as a mixture of both.

### Vite

If your project is based on the Vite compiler, this includes frameworks like [Remix](https://remix.run/) that are rely on Vite under the hood, you can use the `@stencil/ssr` package to enable SSR support for Stencil components by adding the plugin to the configuration:

```ts title="vite.config.ts"
import { defineConfig } from 'vite';
import { stencilSSR } from '@stencil/ssr';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    stencilSSR({
      module: import('component-library-react'),
      from: 'component-library-react',
      hydrateModule: import('component-library/hydrate'),
      serializeShadowRoot: {
        'scoped': ['my-counter'],
        default: 'declarative-shadow-dom',
      },
    }),
  ],
})
```

or in case of a Remix project:

```ts title="vite.config.ts"
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import { stencilSSR } from "@stencil/ssr";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    remix(),
    stencilSSR({
      module: import('component-library-react'),
      from: 'component-library-react',
      hydrateModule: import('component-library/hydrate'),
      serializeShadowRoot: {
        'scoped': ['my-counter'],
        default: 'declarative-shadow-dom',
      },
    }),
  ],
});
```

### Next.js

When using Stencil with Next.js, you can server-side render (SSR) components in two ways: **at runtime** or **at compile time**. Each approach has its trade-offs, and the best choice depends on your component architecture.

* If your components rely heavily on **slots**, the **compiler-based** SSR approach is generally more reliable.
* If your components use **dynamically computed attributes**, the **runtime-based** SSR approach is more flexible.

#### Runtime-Based SSR

In this method, Stencil serializes the component to a **Declarative Shadow DOM** during runtime, as Next.js renders the component on the server. Since Next.js supports asynchronous server components, this allows Stencil to perform serialization as part of the render process.

To enable runtime SSR, set the `hydrateModule` option in your React output target:

```ts
import { Config } from '@stencil/core';
import { reactOutputTarget } from '@stencil/react-output-target';

export const config: Config = {
  namespace: 'component-library',
  outputTargets: [
    reactOutputTarget({
      outDir: '../component-library-react/src',
      hydrateModule: 'component-library/hydrate',
      serializeShadowRoot: { /* options */ },
    }),
  ],
};
```

This will generate:

* `components.ts` — for use on the client
* `components.server.ts` — for server-side rendering

If you distribute your React wrapper as a separate package, consider exposing the server entry point via a custom export path in your `package.json`:

```json
{
  "name": "component-library-react",
  "version": "0.0.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "node": "./dist/components.server.js"
    },
    "./server": {
      "types": "./dist/components.server.d.ts",
      "import": "./dist/components.server.js"
    }
  }
}
```

Now you can use the server-optimized components in your Next.js app:

```tsx title="/src/app/page.tsx"
import { MyComponent } from 'component-library-react/server';

export default function Home() {
  return (
    <>
      ...
      <MyComponent first="Max" last="Mustermann" />
    </>
  );
}
```

##### ✅ Advantages

* All component props are available with their **resolved values** at runtime.
* Props can be **computed dynamically** or retrieved from functions:

```tsx
const value = getValueFromAPI();
return <MyStencilComponent prop={value} />;
```

##### ⚠️ Disadvantages

* **Nested Stencil components** may fail to render correctly on the server.
* Child components might not appear until the Stencil runtime hydrates on the client:

```tsx
// ❌ Nested children may be missing on initial SSR
return (
  <MyStencilList>
    <MyStencilListItem>Foo</MyStencilListItem>
    <MyStencilListItem>Bar</MyStencilListItem>
  </MyStencilList>
);
```

#### Compiler-Based SSR

With this approach, the `@stencil/ssr` package pre-processes your application during the build step to wrap and serialize Stencil components for server-side rendering.

To enable it, wrap your Next.js configuration using the `stencilSSR()` helper:

```js title="next.config.js"
import stencilSSR from '@stencil/ssr/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // your base config
};

export default stencilSSR({
  module: import('component-library-react'),
  from: 'component-library-react',
  hydrateModule: import('component-library/hydrate'),
  serializeShadowRoot: {
    scoped: ['my-counter'],
    default: 'declarative-shadow-dom',
  },
})(nextConfig);
```

> 📌 **Note:** The integration import path is `@stencil/ssr/next`.

##### ✅ Advantages

* More **reliable SSR** for Stencil components rendered in the **light DOM**.
* Avoids hydration mismatch issues commonly seen with client-heavy components.

##### ⚠️ Disadvantages

* Since components are pre-rendered at **build time**, **runtime values** (e.g. function calls or dynamic props) are not available:

```tsx
// ✅ Static objects are fine
const staticProp = { key: 'value' };

// ❌ Dynamic values will not be resolved
const runtimeValue = computeAtRuntime();
return <MyStencilComponent prop1={staticProp} prop2={runtimeValue} />;
```

* Components using **slots** may render incorrectly due to internal Next.js behavior, such as injected `<template>` elements that break expected slot structure.

### Nuxt

If you are building a Vue application in Nuxt you don't need the `@stencil/ssr/next`, instead just reference the Hydrate Module in your options for the Vue Output Target, e.g.:

```ts title="stencil.config.ts"
import { Config } from '@stencil/core';
import { vueOutputTarget } from '@stencil/vue-output-target';

export const config: Config = {
  outputTargets: [
    vueOutputTarget({
      includeImportCustomElements: true,
      includePolyfills: false,
      includeDefineCustomElements: false,
      componentCorePackage: 'component-library',
      hydrateModule: 'component-library/hydrate',
      proxiesFile: '../component-library-vue/src/index.ts',
    }),
    // ...
  ]
};
```

That's it! Your Nuxt application should now render a Declarative Shadow DOM on the server side which will get automatically hydrated once the Vue runtime initiates.

## Custom Config Wrapper

When building distributed design systems, you should encapsulate all Stencil-related dependencies within your component library rather than requiring consuming applications to install them directly. This approach maintains clean separation of concerns and simplifies adoption.

You can create wrapper functions that encapsulate the SSR configuration for each framework.

```typescript title="packages/react/src/next.ts"
// e.g. export custom SSR setup for Next.js applications
import stencilConfig from '@stencil/ssr/next'

type StencilConfigFunction = typeof stencilConfig;
type NextConfig = ReturnType<ReturnType<StencilConfigFunction>>
export const withSSR = (nextConfig: NextConfig): NextConfig => {
  return stencilConfig({
    from: '@placid/react',
    module: import('./components.js'),
    hydrateModule: import('@placid/core/hydrate'),
  })(nextConfig)
}
```

Then expose framework-specific helpers through clean export paths:

```json title="packages/react/package.json"
{
  "name": "@your-company/react",
  "exports": {
    ".": {
      "import": "./dist/components.js",
      "types": "./dist/components.d.ts"
    },
    "./next": {
      "import": "./dist/next.js",
      "types": "./dist/next.d.ts"
    },
    "./vite": {
      "import": "./dist/vite.js",
      "types": "./dist/vite.d.ts"
    },
    "./server": {
      "import": "./dist/components.server.js",
      "types": "./dist/components.server.d.ts"
    }
  },
  "dependencies": {
    "@your-company/core": "workspace:*",
    "@stencil/react-output-target": "^1.0.3",
    "@stencil/ssr": "^0.1.1"
  }
}
```

__Note:__ the exports path `./next` and `./vite` export above example for either Vite or Next.js based setups. 

With this approach, consumers have a much cleaner experience:

```javascript title="next.config.mjs"
import { withSSR } from '@your-company/react/next';

const nextConfig = {
  // your existing Next.js configuration
};

export default withSSR(nextConfig);
```

## Limitations

When server-side rendering Stencil components, there are a few potential pitfalls and limitations you might encounter. To help you avoid these issues, here are some key tips and best practices.

### Performance

By default Stencil server-side renders a component into a [Declarative Shadow DOM](https://web.dev/articles/declarative-shadow-dom), which includes all structural information and styles. While this ensures accurate rendering, it can significantly increase document size if not managed carefully.

For example, consider a button component:

```tsx
import { Component, Fragment, h } from '@stencil/core'
@Component({
  tag: 'my-btn',
  styleUrl: './button.css'
})
export class MyBtn {
  render() {
    return (
      <>
        <button>...</button>
      </>
    );
  }
}
```

And this `button.css` which imports additional common styles:

```css
/* button.css */
@import "../css/base.css";
@import "../css/tokens.css";
@import "../css/animations.css";
@import "../css/utilities.css";

/* component-specific styles */
button {
    ...
}
```

When SSR is performed, the entire CSS (including imports) is bundled with the component's declarative shadow DOM. Rendering multiple instances of this button in SSR can lead to repeated inclusion of styles, bloating the document size and delaying [First Contentful Paint (FCP)](https://web.dev/articles/fcp).

Here are some ways to mitigate this:

- **Use CSS Variables**: CSS variables can pierce the Shadow DOM, reducing the need for redundant styles.
- **Use the `::part` pseudo-element**: This allows you to style parts of the Shadow DOM from outside the component, minimizing the internal CSS.
- **Optimize Component-Specific CSS**: Only include the necessary styles for each component.
- **Limit SSR Scope**: In Next.js, apply `use client` to sections that don't need SSR to reduce unnecessary rendering.

Compared to many other web-component frameworks Stencil understands to render a component as actual web component as well as a scoped component. A scoped component doesn't use a Shadow DOM and style encapsulation is emulated. This provides an advantage in the SSR context as you don't have to ship the same styles multiple times when you render specific components in different places.

With the `serializeShadowRoot` of the `@stencil/ssr` package you can define which components should be rendered as actual web-component in a declarative shadow DOM and which should be rendered as a scoped component. You can define certain components that appear a lot in your initial DOM as scoped components to avoid sending duplicate styles for them, e.g.:

```js title="next.config.js"
import stencilSSR from '@stencil/ssr/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
    // ...
};

export default stencilSSR({
  module: import('component-library-react'),
  from: 'component-library-react',
  hydrateModule: import('component-library/hydrate'),
  serializeShadowRoot: {
    /**
     * By default all Stencil components are rendered with a Declarative Shadow DOM
     */
    default: 'declarative-shadow-dom',
    /**
     * However, you can define a set of components that will be rendered in scoped mode,
     * allowing to send only one set of styles that are applied to all components.
     */
    scoped: ['my-button'],
    
  },
})(nextConfig);
```

Once the Stencil runtime activates, it transforms the scoped component back into a classic web component with
a Shadow-DOM and reformats its styles.

### Avoid Non-Primitive Parameters

When building components, it's common to pass complex data structures like objects to components as props.
For example, a footer menu could be structured as an object rather than as separate components for each menu
item:

```tsx
const menu = generateMenuData({ ... })
return (
  <nav>
    <footer-navigation items={menu} />
  </nav>
)
```

While this approach works fine in the browser, it poses challenges for SSR. While Stencil generally **supports** the serialization of complex objects within parameters, it can't resolve the value of any function calls, e.g. here `generateMenuData(...)` during the SSR process (except when using runtime based SSR within Next.js applications).

We recommend to __not__ depend on external data structures when it comes to rendering Stencil components.

### Cross-Component State Handling

When propagating state between parent and child components, patterns like reducers or context providers (as in React) are often used. However, this can be problematic with SSR in frameworks like Next.js, where each component is rendered independently.

Consider the following structure:

```jsx
<ParentComponent>
    <ChildComponent />
</ParentComponent>
```

When ParentComponent is rendered on the server, Stencil will attempt to stringify its children (e.g., ChildComponent) for the light DOM. The intermediate markup may look like this:

```jsx
<ParentComponent>
    <template shadowrootmode="open">
        <style>...</style>
        ...
    </template>
    <ChildComponent />
</ParentComponent>
```

At this stage, ParentComponent can access and manipulate its children. However, when ChildComponent is rendered in isolation, it won't have access to the parent's state or context, potentially leading to inconsistencies.

To prevent this, ensure that components rendered on the server don't depend on external state or context. If the component relies on data fetched at runtime, it's better to display a loading placeholder during SSR.
