---
title: VueJS Integration with Stencil
sidebar_label: Vue
description: Learn how to wrap your components so that people can use them natively in Vue
slug: /vue
---

# Vue Integration

**Supports: Vue 3 • TypeScript 4.0+ • Stencil v2.9.0+**

Stencil can generate Vue component wrappers for your web components. This allows your Stencil components to be used within a Vue 3 application. The benefits of using Stencil's component wrappers over the standard web components include:

- Type checking with your components.
- Integration with the router link and Vue router.
- Optionally, form control web components can be used with `v-model`.

## Setup

### Project Structure

We recommend using a [monorepo](https://www.toptal.com/front-end/guide-to-monorepos) structure for your component library with component wrappers. Your project workspace should contain your Stencil component library and the library for the generate Vue component wrappers.

An example project set-up may look similar to:

```
top-most-directory/
└── packages/
    ├── vue-library/
    │   └── lib/
    │       ├── plugin.ts
    │       └── index.ts
    └── stencil-library/
        ├── stencil.config.js
        └── src/components
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

```bash npm2yarn
cd packages/
npm init stencil components stencil-library
cd stencil-library
# Install dependencies
npm install
```

#### Creating a Vue Component Library

:::note
If you already have a Vue component library, skip this section.
:::

The first time you want to create the component wrappers, you will need to have a Vue library package to write to.

Using Lerna and Vue's CLI, generate a workspace and a library for your Vue component wrappers:

```bash npm2yarn
# From your top-most-directory/
lerna create vue-library
# Follow the prompts and confirm
cd packages/vue-library
# Install Vue dependency
npm install vue@3 --save-dev
```

Lerna does not ship with a TypeScript configuration. At the root of the workspace, create a `tsconfig.json`:

```json
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

In your `vue-library` project, create a project specific `tsconfig.json` that will extend the root config:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "lib": ["dom", "es2020"],
    "module": "es2015",
    "moduleResolution": "node",
    "target": "es2017",
    "skipLibCheck": true
  },
  "include": ["lib"],
  "exclude": ["node_modules"]
}
```

Update the generated `package.json` in your `vue-library`, adding the following options to the existing config:

```diff
{
-  "main": "lib/vue-library.js",
+  "main": "dist/index.js",
+  "types": "dist/index.d.ts",
  "files": [
-    'lib'
+    'dist'
  ],
  "scripts": {
-    "test": "echo \"Error: run tests from root\" && exit 1"
+    "test": "echo \"Error: run tests from root\" && exit 1",
+    "build": "npm run tsc",
+    "tsc": "tsc -p . --outDir ./dist"
-  }
+  },
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

### Adding the Vue Output Target

Install the `@stencil/vue-output-target` dependency to your Stencil component library package.

```bash npm2yarn
# Install dependency (from `packages/stencil-library`)
npm install @stencil/vue-output-target --save-dev
```

In your project's `stencil.config.ts`, add the `vueOutputTarget` configuration to the `outputTargets` array:

```ts
import { vueOutputTarget } from '@stencil/vue-output-target';

export const config: Config = {
  namespace: 'stencil-library',
  outputTargets: [
    // By default, the generated proxy components will
    // leverage the output from the `dist` target, so we
    // need to explicitly define that output alongside the
    // Vue target
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    vueOutputTarget({
      componentCorePackage: 'stencil-library',
      proxiesFile: '../vue-library/lib/components.ts',
    }),
  ],
};
```

:::tip
The `proxiesFile` is the relative path to the file that will be generated with all the Vue component wrappers. You will replace the file path to match
your project's structure and respective names. You can generate any file name instead of `components.ts`.

The `componentCorePackage` should match the `name` field in your Stencil project's `package.json`.
:::

You can now build your Stencil component library to generate the component wrappers.

```bash npm2yarn
# Build the library and wrappers (from `packages/stencil-library`)
npm run build
```

If the build is successful, you will now have contents in the file specified in `proxiesFile`.

### Registering Custom Elements

To register your web components for the lazy-loaded (hydrated) bundle, you will need to create a new file for the Vue plugin:

```ts
// packages/vue-library/lib/plugin.ts

import { Plugin } from 'vue';
import { applyPolyfills, defineCustomElements } from 'stencil-library/loader';

export const ComponentLibrary: Plugin = {
  async install() {
    applyPolyfills().then(() => {
      defineCustomElements();
    });
  },
};
```

You can now finally export the generated component wrappers and the Vue plugin for your component library to make them available to implementers. Export
the `plugin.ts` file created in the previous step, as well as the file `proxiesFile` generated by the Vue Output Target:

```ts
// packages/vue-library/lib/index.ts
export * from './components';
export * from './plugin';
```

### Link Your Packages (Optional)

:::note
If you are using a monorepo tool (Lerna, Nx, etc.), skip this section.
:::

Before you can successfully build a local version of your Vue component library, you will need to link the Stencil package to the Vue package.

From your Stencil project's directory, run the following command:

```bash npm2yarn
# Link the working directory
npm link
```

From your Vue component library's directory, run the following command:

```bash npm2yarn
# Link the package name
npm link name-of-your-stencil-package
```

The name of your Stencil package should match the `name` property from the Stencil component library's `package.json`.

Your component libraries are now linked together. You can make changes in the Stencil component library and run `npm run build` to propagate the
changes to the Vue component library.

:::note
As an alternative to `npm link`, you can also run `npm install` with a relative path to your Stencil component library. This strategy,
however, will modify your `package.json` so it is important to make sure you do not commit those changes.
:::

## Consumer Usage

### Creating a Consumer Vue App

From the `packages/` directory, run the following command to generate a Vue app:

```bash npm2yarn
npm init vue@3 my-app
```

Follow the prompts and choose the options best for your project.

You'll also need to link your Vue component library as a dependency. This step makes it so your Vue app will be able to correctly
resolve imports from your Vue library. This is easily done by modifying your Vue app's `package.json` to include the following:

```json
"dependencies": {
  "vue-library": "*"
}
```

For more information, see the Lerna documentation on [package dependency management](https://lerna.js.org/docs/getting-started#package-dependency-management).

Lastly, you'll want to update the generated `vite.config.ts`:

```diff
export default defineConfig({
-  plugins: [vue(), vueJsx()],
+  plugins: [
+    vue({
+      template: {
+        compilerOptions: {
+          // treat all tags with a dash as custom elements
+          isCustomElement: (tag) => tag.includes('-'),
+        },
+      },
+    }),
+    vueJsx(),
+  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

This will prevent Vue from logging a warning about failing to resolve components (e.g. "Failed to resolve component: my-component").

### Consuming the Vue Wrapper Components

This section covers how developers consuming your Vue component wrappers will use your package and component wrappers.

Before you can use your Vue proxy components, you'll need to build your Vue component library. From `packages/vue-library` simply run:

```bash npm2yarn
npm run build
```

In your `main.js` file, import your component library plugin and use it:

```js
// src/main.js
import { ComponentLibrary } from 'vue-library';

createApp(App).use(ComponentLibrary).mount('#app');
```

In your page or component, you can now import and use your component wrappers:

```html
<template>
  <my-component first="Your" last="Name"></my-component>
</template>
```

## API

### componentCorePackage

**Optional**

**Default: The `components.d.ts` file in the Stencil project's `package.json` types field**

**Type: `string`**

The name of the Stencil package where components are available for consumers (i.e. the value of the `name` property in your Stencil component library's `package.json`).
This is used during compilation to write the correct imports for components.

For a starter Stencil project generated by running:

```bash npm2yarn
npm init stencil component my-component-lib
```

The `componentCorePackage` would be set to:

```ts
// stencil.config.ts

export const config: Config = {
  ...,
  outputTargets: [
    vueOutputTarget({
      componentCorePackage: 'my-component-lib',
      // ... additional config options
    })
  ]
}
```

Which would result in an import path like:

```js
import { defineCustomElement as defineMyComponent } from 'my-component-lib/components/my-component.js';
```

:::note
Although this field is optional, it is _highly_ recommended that it always be defined to avoid potential issues with paths not being generated correctly
when combining other API arguments.
:::

### componentModels

**Optional**

**Default: `[]`**

**Type: `ComponentModelConfig[]`**

This option is used to define which components should be integrated with `v-model`. It allows you to set what the target prop is (i.e. `value`),
which event will cause the target prop to change, and more.

```tsx
const componentModels: ComponentModelConfig[] = [
  {
    elements: ['my-input', 'my-textarea'],
    event: 'v-on-change',
    externalEvent: 'on-change',
    targetAttr: 'value',
  },
];

export const config: Config = {
  namespace: 'stencil-library',
  outputTargets: [
    vueOutputTarget({
      componentCorePackage: 'component-library',
      proxiesFile: '{path to your proxy file}',
      componentModels: componentModels,
    }),
  ],
};
```

### customElementsDir

**Optional**

**Default: 'dist/components'**

**Type: `string`**

If [includeImportCustomElements](#includeimportcustomelements) is `true`, this option can be used to specify the directory where the generated
custom elements live. This value only needs to be set if the `dir` field on the `dist-custom-elements` output target was set to something other than
the default directory.

### excludeComponents

**Optional**

**Default: `[]`**

**Type: `string[]`**

This lets you specify component tag names for which you don't want to generate Vue wrapper components. This is useful if you need to write framework-specific versions of components. For instance, in Ionic Framework, this is used for routing components - like tabs - so that
Ionic Framework can integrate better with Vue's Router.

### includeDefineCustomElements

**Optional**

**Default: `true`**

**Type: `boolean`**

If `true`, all Web Components will automatically be registered with the Custom Elements Registry. This can only be used when lazy loading Web Components and will not work when `includeImportCustomElements` is `true`.

### includeImportCustomElements

**Optional**

**Default: `undefined`**

**Type: `boolean`**

If `true`, the output target will import the custom element instance and register it with the Custom Elements Registry when the component is imported inside of a user's app. This can only be used with the [Custom Elements Bundle](../output-targets/custom-elements.md) and will not work with lazy loaded components.

:::note
The configuration for the [Custom Elements](../output-targets/custom-elements.md) output target must set the
[export behavior](../output-targets/custom-elements.md#customelementsexportbehavior) to `single-export-module` for the wrappers to generate correctly.
:::

### includePolyfills

**Optional**

**Default: `true`**

**Type: `boolean`**

If `true`, polyfills will automatically be imported and the `applyPolyfills` function will be called in your proxies file. This can only be used when lazy loading Web Components and will not work when `includeImportCustomElements` is enabled.

### loaderDir

**Optional**

**Default: `/dist/loader`**

**Type: `string`**

The path to where the `defineCustomElements` helper method exists within the built project. This option is only used when `includeDefineCustomElements` is enabled.

### proxiesFile

**Required**

**Type: `string`**

This parameter allows you to name the file that contains all the component wrapper definitions produced during the compilation process. This is the first file you should import in your Vue project.

## FAQ

### Do I have to use the `dist` output target?

No! By default, this output target will look to use the `dist` output, but the output from `dist-custom-elements` can be used alternatively.

To do so, simply set the `includeImportCustomElements` option in the output target's config and ensure the
[custom elements output target](../output-targets/custom-elements.md) is added to the Stencil config's output target array:

```ts
// stencil.config.ts

export const config: Config = {
  ...,
  outputTargets: [
    // Needs to be included
    {
      type: 'dist-custom-elements'
    },
    vueOutputTarget({
      componentCorePackage: 'component-library',
      proxiesFile: '{path to your proxy file}',
      // This is what tells the target to use the custom elements output
      includeImportCustomElements: true
    })
  ]
}
```

Now, all generated imports will point to the default directory for the custom elements output. If you specified a different directory
using the `dir` property for `dist-custom-elements`, you need to also specify that directory for the Vue output target. See
[the API section](#customelementsdir) for more information.

In addition, all the Web Components will be automatically defined as the generated component modules are bootstrapped.

### TypeError: Cannot read properties of undefined (reading 'isProxied')

If you encounter this error when running the Vue application consuming your proxy components, you can set the [`enableImportInjection`](../config/extras.md#enableimportinjection)
flag on the Stencil config's `extras` object. Once set, this will require you to rebuild the Stencil component library and the Vue component library.

### Vue warns "Failed to resolve component: my-component"

#### Lazy loaded bundle

If you are using Vue CLI, update your `vue.config.js` to match your custom element selector as a custom element:

```js
const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => {
        options.compilerOptions = {
          ...options.compilerOptions,
          // The stencil-library components start with "my-"
          isCustomElement: (tag) => tag.startsWith('my-'),
        };
        return options;
      });
  },
});
```

#### Custom elements bundle

If you see this warning, then it is likely you did not import your component from your Vue library: `vue-library`. By default, all Vue components are locally registered, meaning you need to import them each time you want to use them.

Without importing the component, you will only get the underlying Web Component, and Vue-specific features such as `v-model` will not work.

To resolve this issue, you need to import the component from `vue-library` (your package name) and provide it to your Vue component:

```html
<template>
  <my-component first="Your" last="Name"></my-component>
</template>

<script lang="ts">
  import { MyComponent } from 'vue-library';
  import { defineComponent } from 'vue';

  export default defineComponent({
    components: { MyComponent },
  });
</script>
```

### Vue warns: "slot attributes are deprecated vue/no-deprecated-slot-attribute"

The slots that are used in Stencil are [Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_templates_and_slots) slots, which are different than the slots used in Vue 2. Unfortunately, the APIs for both are very similar, and your linter is likely getting the two confused.

You will need to update your lint rules in `.eslintrc.js` to ignore this warning:

```js
module.exports = {
  rules: {
    'vue/no-deprecated-slot-attribute': 'off',
  },
};
```

If you are using VSCode and have the Vetur plugin installed, you are likely getting this warning because of Vetur, not ESLint. By default, Vetur loads the default Vue 3 linting rules and ignores any custom ESLint rules.

To resolve this issue, you will need to turn off Vetur's template validation with `vetur.validation.template: false`. See the [Vetur Linting Guide](https://vuejs.github.io/vetur/guide/linting-error.html#linting) for more information.

### Method on component is not a function

In order to access a method on a Stencil component in Vue, you will need to access the underlying Web Component instance first:

```ts
// ✅ This is correct
myComponentRef.value.$el.someMethod();

// ❌ This is incorrect and will result in an error.
myComponentRef.value.someMethod();
```

### Output commonjs bundle for Node environments

First, install `rollup` and `rimraf` as dev dependencies:

```bash npm2yarn
npm i -D rollup rimraf
```

Next, create a `rollup.config.js` in `/packages/vue-library/`:

```js
const external = ['vue', 'vue-router'];

export default {
  input: 'dist-transpiled/index.js',
  output: [
    {
      dir: 'dist/',
      entryFileNames: '[name].esm.js',
      chunkFileNames: '[name]-[hash].esm.js',
      format: 'es',
      sourcemap: true,
    },
    {
      dir: 'dist/',
      format: 'commonjs',
      preferConst: true,
      sourcemap: true,
    },
  ],
  external: (id) => external.includes(id) || id.startsWith('stencil-library'),
};
```

:::info
Update the `external` list for any external dependencies. Update the `stencil-library` to match your Stencil library's package name.
:::

Next, update your `package.json` to include the scripts for rollup:

```json
{
  "scripts": {
    "build": "npm run clean && npm run tsc && npm run bundle",
    "bundle": "rollup --config rollup.config.js",
    "clean": "rimraf dist dist-transpiled"
  }
}
```
