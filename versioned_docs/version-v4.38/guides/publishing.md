---
title: Publishing A Component Library
sidebar_label: Publishing
description: Publishing A Component Library
slug: /publishing
---

There are numerous strategies to publish and distribute your component library to be consumed by external projects. One of the benefits of Stencil is that is makes it easy to generate the various [output targets](../output-targets/01-overview.md) that are right for your use-case.

## Use Cases

To use your Stencil components in other projects, there are two different output targets to consider: [`dist`](../output-targets/dist.md) and [`dist-custom-elements`](../output-targets/custom-elements.md). Both export your components for different use cases. Luckily, both can be generated at the same time, using the same source code, and shipped in the same distribution. It would be up to the consumer of your component library to decide which build to use.

### Lazy Loading

If you prefer to have your components automatically loaded when used in your application, we recommend enabling the [`dist`](../output-targets/dist.md) output target. The bundle gives you a small entry file that registers all your components and defers loading the full component logic until it is rendered in your application. It doesn't matter if the actual application is written in HTML or created with vanilla JavaScript, jQuery, React, etc.

Your users can import your component library, e.g. called `my-design-system`, either via a `script` tag:

```html
<script type="module" src="https://unpkg.com/my-design-system"></script>
```

or by importing it in the bootstrap script of your application:

```ts
import 'my-design-system';
```

To ensure that the right entry file is loaded when importing the project, define the following fields in your `package.json`:

```json
{
  "exports": "./dist/esm/my-design-system.js",
  "main": "./dist/cjs/my-design-system.js",
  "unpkg": "dist/my-design-system/my-design-system.esm.js",
}
```

Read more about various options when it comes to configuring your project's components for lazy loading in the [`dist`](../output-targets/dist.md) output target section.

#### Considerations

To start, Stencil was designed to lazy-load itself only when the component was actually used on a page. There are many benefits to this approach, such as simply adding a script tag to any page and the entire library is available for use, yet only the components actually used are downloaded. For example, [`@ionic/core`](https://www.npmjs.com/package/@ionic/core) comes with over 100 components, but a webpage may only need `ion-toggle`. Instead of requesting the entire component library, or generating a custom bundle for just `ion-toggle`, the `dist` output target is able to generate a tiny entry build ready to load any of its components on-demand.

However be aware that this approach is not ideal in all cases. It requires your application to ship the bundled components as static assets in order for them to load properly. Furthermore, having many nested component dependencies can have an impact on the performance of your application. For example, given you have a component `CmpA` which uses a Stencil component `CmpB` which itself uses another Stencil component `CmpC`. In order to fully render `CmpA` the browser has to load 3 scripts sequentially which can result in undesired rendering delays.

### Standalone

The [`dist-custom-elements`](../output-targets/custom-elements.md) output target builds each component as a stand-alone class that extends `HTMLElement`. The output is a standardized custom element with the styles already attached and without any of Stencil's lazy-loading. This may be preferred for projects that are already handling bundling, lazy-loading and defining the custom elements themselves.

The generated files will each export a component class and will already have the styles bundled. However, this build does not define the custom elements or apply any polyfills. Static assets referenced within components will need to be set using `setAssetPath` (see [Making Assets Available](../output-targets/custom-elements.md#making-assets-available)).

You can use these standalone components by importing them via:

```ts
import { MyComponent, defineCustomElementMyComponent } from 'my-design-system'

// register to CustomElementRegistry
defineCustomElementMyComponent()

// or extend custom element via
class MyCustomComponent extends MyComponent {
  // ...
}
define('my-custom-component', MyCustomComponent)
```

To ensure that the right entry file is loaded when importing the project, define different [exports fields](https://nodejs.org/api/packages.html#exports) in your `package.json`:

```json
{
  "exports": {
    ".": {
      "import": "./dist/components/index.js",
      "types": "./dist/components/index.d.ts"
    },
    "./my-component": {
      "import": "./dist/components/my-component.js",
      "types": "./dist/components/my-component.d.ts"
    }
  },
  "types": "dist/components/index.d.ts",
}
```

This allows us to map certain import paths to specific components within our project and allows users to only import the component code they are interested in and reduce the amount of code that needs to downloaded by the browser, e.g.:

```js
// this import loads all compiled components
import { MyComponent } from 'my-design-system'
// only import compiled code for MyComponent
import { MyComponent } from 'my-design-system/my-component'
```

If you define exports targets for all your components as shown above and by using [`customElementsExportBehavior: 'auto-define-custom-elements'`](../output-targets/custom-elements.md#customelementsexportbehavior) as output target option, you can skip the `defineCustomElement` call and directly import the component where you need it:

```ts
import 'my-design-system/my-component'
```

:::note
If you are distributing both the `dist` and `dist-custom-elements`, then it's best to pick one of them as the main entry depending on which use case is more prominent.
:::

Read more about various options when it comes to distributing your components as standalone components in the [`dist-custom-elements`](../output-targets/custom-elements.md) output target section.

The output directory will also contain an `index.js` file which exports some helper methods by default. The contents of the file will look something like:

```js
export { setAssetPath, setPlatformOptions } from '@stencil/core/internal/client';
```

:::note
The contents may look different if [`customElementsExportBehavior`](../output-targets/custom-elements.md#customelementsexportbehavior) is specified!
:::

#### Considerations

The `dist-custom-elements` is a direct build of the custom element that extends `HTMLElement`, without any lazy-loading. This distribution strategy may be preferred for projects that use an external bundler such as [Vite](https://vitejs.dev/), [WebPack](https://webpack.js.org/) or [Rollup](https://rollupjs.org) to compile the application. They ensure that only the components used within your application are bundled into compilation.

#### Usage in TypeScript

If you plan to support consuming your component library in TypeScript you'll need to set `generateTypeDeclarations: true` on the output target in your `stencil.config.ts`, like so:

```tsx title="stencil.config.ts"
import { Config } from '@stencil/core';

export const config: Config = {
  outputTargets: [
    {
      type: 'dist-custom-elements',
      generateTypeDeclarations: true,
    },
    // ...
  ],
  // ...
};
```

Then you can set the `types` property in `package.json` so that consumers of your package can find the type definitions, like so:

```json title="package.json"
{
  "types": "dist/components/index.d.ts",
  "dependencies": {
    "@stencil/core": "latest"
  },
  ...
}
```

:::note
If you set the `dir` property on the output target config, replace `dist/components` in the above snippet with the path set in the config.
:::

## Publishing to NPM

[NPM](https://www.npmjs.com/) is an online software registry for sharing libraries, tools, utilities, packages, etc. To make your Stencil project widely available to be consumed, it's recommended to [publish the component library to NPM](https://docs.npmjs.com/getting-started/publishing-npm-packages). Once the library is published to NPM, other projects are able to add your component library as a dependency and use the components within their own projects.
