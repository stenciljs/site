---
title: Angular Integration with Stencil
sidebar_label: Angular
description: Learn how to wrap your components so that people can use them natively in Angular
slug: /angular
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Angular Integration

**Supports: Angular 12+ • TypeScript 4.0+ • Stencil v2.9.0+**

Stencil can generate Angular component wrappers for your web components. This allows your Stencil components to be used within
an Angular application. The benefits of using Stencil's component wrappers over the standard web components include:

- Angular component wrappers will be detached from change detection, preventing unnecessary repaints of your web component.
- Web component events will be converted to RxJS observables to align with Angular's `@Output()` and will not emit across component boundaries.
- Optionally, form control web components can be used as control value accessors with Angular's reactive forms or `[ngModel]`.
- It is not necessary to include the [Angular `CUSTOM_ELEMENTS_SCHEMA`](https://angular.io/api/core/CUSTOM_ELEMENTS_SCHEMA) in all modules consuming your Stencil components.

## Setup

### Project Structure

We recommend using a [monorepo](https://www.toptal.com/front-end/guide-to-monorepos) structure for your component library with component
wrappers. Your project workspace should contain your Stencil component library and the library for the generated Angular component wrappers.

An example project set-up may look similar to:

```
top-most-directory/
└── packages
    ├── stencil-library/
    │   ├── stencil.config.js
    │   └── src/components
    └── angular-workspace/
        └── projects/
            └── component-library/
                └── src/
                    ├── lib/
                    └── public-api.ts
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

In the `packages/` directory, run the following commands to generate a Stencil component library:

```bash npm2yarn
npm init stencil components stencil-library
cd stencil-library
# Install dependencies
npm install
```

#### Creating an Angular Component Library

:::note
If you already have an Angular component library, skip this section.
:::

The first time you want to create the component wrappers, you will need to have an Angular library package to write to.

In the `packages/` directory, use the Angular CLI to generate a workspace and a library for your Angular component wrappers:

```bash
npx -p @angular/cli ng new angular-workspace --no-create-application
cd angular-workspace
npx -p @angular/cli ng generate library component-library
```

You can delete the `component-library.component.ts`, `component-library.service.ts`, and `*.spec.ts` files.

You will also need to add your generated Stencil library as a peer-dependency so import references can be resolved correctly:

```diff
// packages/angular-workspace/projects/component-library/package.json

"peerDependencies": {
   "@angular/common": "^15.1.0",
-  "@angular/core": "^15.1.0"
+  "@angular/core": "^15.1.0",
+  "stencil-library": "*"
}
```

For more information, see the Lerna documentation on [package dependency management](https://lerna.js.org/docs/getting-started#package-dependency-management).

:::note
The Angular CLI will install Jasmine as a dependency to your Angular workspace. However, Stencil uses Jest as it's unit testing solution. To avoid
type definition collisions when attempting to build your Stencil project, you can remove `jasmine-core` and `@types/jasmine` as dependencies in the Angular
workspace `package.json` file:

```bash npm2yarn
# from `/packages/angular-workspace`
npm uninstall jasmine-core @types/jasmine
```

:::

### Adding the Angular Output Target

Install the `@stencil/angular-output-target` dependency to your Stencil component library package.

```bash npm2yarn
# Install dependency
npm install @stencil/angular-output-target --save-dev
```

In your project's `stencil.config.ts`, add the `angularOutputTarget` configuration to the `outputTargets` array:

```ts
import { angularOutputTarget } from '@stencil/angular-output-target';

export const config: Config = {
  namespace: 'stencil-library',
  outputTargets: [
    // By default, the generated proxy components will
    // leverage the output from the `dist` target, so we
    // need to explicitly define that output alongside the
    // Angular target
    {
      type: 'dist',
    },
    angularOutputTarget({
      componentCorePackage: 'stencil-library',
      outputType: 'component',
      directivesProxyFile: '../angular-workspace/projects/component-library/src/lib/stencil-generated/components.ts',
      directivesArrayFile: '../angular-workspace/projects/component-library/src/lib/stencil-generated/index.ts',
    }),
  ],
};
```

:::tip
The `componentCorePackage` should match the `name` field in your Stencil project's `package.json`.

`outputType` should be set to `'component'` for Stencil projects using the `dist` output. Otherwise if using the custom elements output, `outputType` should be set to `'scam'` or `'standalone'`.

The `directivesProxyFile` is the relative path to the file that will be generated with all of the Angular component wrappers. You will replace the
file path to match your project's structure and respective names. You can generate any file name instead of `components.ts`.

The `directivesArrayFile` is the relative path to the file that will be generated with a constant of all the Angular component wrappers. This
constant can be used to easily declare and export all the wrappers.

:::

See the [API section below](#api) for details on each of the output target's options.

You can now build your Stencil component library to generate the component wrappers.

```bash npm2yarn
# Build the library and wrappers
npm run build
```

If the build is successful, you will now have contents in the file specified in `directivesProxyFile` and `directivesArrayFile`.

You can now finally import and export the generated component wrappers for your component library. For example, in your library's main Angular module:

```ts title="component-library.module.ts"
import { DIRECTIVES } from './stencil-generated';

@NgModule({
  declarations: [...DIRECTIVES],
  exports: [...DIRECTIVES],
})
export class ComponentLibraryModule {}
```

Any components that are included in the `exports` array should additionally be exported in your main entry point (either `public-api.ts` or
`index.ts`). Skipping this step will lead to Angular Ivy errors when building for production. For this guide, simply add the following line to the
automatically generated `public-api.ts` file:

```ts title="public-api.ts"
export * from './lib/component-library.module';
export { DIRECTIVES } from './lib/stencil-generated';
export * from './lib/stencil-generated/components';
```

### Registering Custom Elements

The default behavior for this output target does not handle automatically defining/registering the custom elements. One strategy (and the approach
the [Ionic Framework](https://github.com/ionic-team/ionic-framework/blob/main/packages/angular/src/app-initialize.ts#L21-L34) takes) is to use the loader to define all custom elements during app initialization:

```ts title="component-library.module.ts"
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { defineCustomElements } from 'stencil-library/loader';

@NgModule({
  ...,
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: () => defineCustomElements,
      multi: true
    },
  ]
})
export class ComponentLibraryModule {}
```

See the [documentation](../output-targets/dist.md) for more information on defining custom elements using the
`dist` output target, or [update the Angular output target](#do-i-have-to-use-the-dist-output-target) to use `dist-custom-elements`.

### Link Your Packages (Optional)

:::note
If you are using a monorepo tool (Lerna, Nx, etc.), skip this section.
:::

Before you can successfully build a local version of your Angular component library, you will need to link the Stencil package to the Angular package.

From your Stencil project's directory, run the following command:

```bash npm2yarn
# Link the working directory
npm link
```

From your Angular component library's directory, run the following command:

```bash npm2yarn
# Link the package name
npm link name-of-your-stencil-package
```

The name of your Stencil package should match the `name` property from the Stencil component library's `package.json`.

Your component libraries are now linked together. You can make changes in the Stencil component library and run `npm run build` to propagate the
changes to the Angular component library.

:::note
As an alternative to `npm link` , you can also run `npm install` with a relative path to your Stencil component library. This strategy,
however, will modify your `package.json` so it is important to make sure you do not commit those changes.
:::

## Consumer Usage

:::note

If you already have an Angular app, skip this section.

:::

### Angular with Modules

#### Creating a Consumer Angular App

From your Angular workspace (`/packages/angular-workspace`), run the following command to generate an Angular application with modules:

```bash
npx -p @angular/cli ng generate app my-app --standalone=false
```

#### Consuming the Angular Wrapper Components

This section covers how developers consuming your Angular component wrappers will use your package and component wrappers in an Angular project using modules.

In order to use the generated component wrappers in the Angular app, you'll first need to build your Angular component library. From the root
of your Angular workspace (`/packages/angular-workspace`), run the following command:

```bash
npx -p @angular/cli ng build component-library
```

:::note
In the output of the `ng build` command you may see a warning that looks like this: 

```
▲ [WARNING] The glob pattern import("./**/.entry.js") did not match any files [empty-glob]

node_modules/@stencil/core/internal/client/index.js:3808:2:
  3808 │   `./${bundleId}.entry.js${BUILD.hotModuleReplacement && hmrVers...
       ╵   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

This is a known issue in esbuild (used under the hood by `ng build`) and should
not cause an issue, but at present there's unfortunately no way to suppress
this warning.
:::

<Tabs
  groupId="outputType"
  defaultValue="component"
  values={[
    { label: 'outputType: "component"', value: 'component' },
    { label: 'outputType: "scam"', value: 'scam' },
    { label: 'outputType: "standalone"', value: 'standalone' },
  ]
}>
<TabItem value="component">

Import your component library into your Angular app's module. If you distributed your components through a primary `NgModule`, you can simply import that module into an implementation to use your components.

```ts title="app.module.ts"
import { ComponentLibraryModule } from 'component-library';

@NgModule({
  imports: [ComponentLibraryModule],
})
export class AppModule {}
```

Otherwise you will need to add the components to your module's `declarations` and `exports` arrays.

```ts title="app.module.ts"
import { MyComponent } from 'component-library';

@NgModule({
  declarations: [MyComponent],
  exports: [MyComponent],
})
export class AppModule {}
```

You can now directly leverage your components in their template and take advantage of Angular template binding syntax.

```html title="app.component.html"
<my-component first="Your" last="Name"></my-component>
```

</TabItem>

<TabItem value="scam">

Now you can reference your component library as a standard import. Each component will be exported as a separate module.

```ts title="app.module.ts"
import { MyComponentModule } from 'component-library';

@NgModule({
  imports: [MyComponentModule],
})
export class AppModule {}
```

You can now directly leverage your components in their template and take advantage of Angular template binding syntax.

```html title="app.component.html"
<my-component first="Your" last="Name"></my-component>
```

</TabItem>

<TabItem value="standalone">

Now you can import and reference your components in your consuming application in the same way you would with any other Angular components:

```ts title="app.component.ts"
import { Component } from '@angular/core';
import { MyComponent } from 'component-library';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [MyComponent],
})
export class AppComponent {}
```

You can now leverage your components in the template and take advantage of Angular template binding syntax.

```html title="app.component.html"
<my-component first="Your" last="Name"></my-component>
```

</TabItem>

</Tabs>

From your Angular workspace (`/packages/angular-workspace`), run `npm start` and navigate to `localhost:4200`. You should see the
component rendered correctly.

### Angular with Standalone Components

In Angular CLI v17, the default behavior is to generate a new project with standalone components.

From your Angular workspace (`/packages/angular-workspace`), run the following command to generate an Angular application:

```bash
npx -p @angular/cli ng generate app my-app
```

#### Consuming the Angular Wrapper Components

This section covers how developers consuming your Angular component wrappers will use your package and component wrappers.

In order to use the generated component wrappers in the Angular app, you'll first need to build your Angular component library. From the root
of your Angular workspace (`/packages/angular-workspace`), run the following command:

```bash
npx -p @angular/cli ng build component-library
```

:::note
In the output of the `ng build` command you may see a warning that looks like this: 

```
▲ [WARNING] The glob pattern import("./**/.entry.js") did not match any files [empty-glob]

node_modules/@stencil/core/internal/client/index.js:3808:2:
  3808 │   `./${bundleId}.entry.js${BUILD.hotModuleReplacement && hmrVers...
       ╵   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

This is a known issue in esbuild (used under the hood by `ng build`) and should
not cause an issue, but at present there's unfortunately no way to suppress
this warning.
:::

<Tabs
  groupId="outputType"
  defaultValue="component"
  values={[
    { label: 'outputType: "component"', value: 'component' },
    { label: 'outputType: "scam"', value: 'scam' },
    { label: 'outputType: "standalone"', value: 'standalone' },
  ]
}>
<TabItem value="component">

Import your component library into your component. You must distribute your components through a primary `NgModule` to use your components in a standalone component.

```ts title="app.component.ts"
import { Component } from '@angular/core';
import { ComponentLibraryModule } from 'component-library';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ComponentLibraryModule],
  templateUrl: './app.component.html',
})
export class AppComponent {}
```

You can now directly leverage your components in their template and take advantage of Angular template binding syntax.

```html title="app.component.html"
<my-component first="Your" last="Name"></my-component>
```

</TabItem>

<TabItem value="scam">

Now you can reference your component library as a standard import. Each component will be exported as a separate module.

```ts title="app.module.ts"
import { Component } from '@angular/core';
import { MyComponentModule } from 'component-library';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MyComponentModule],
  templateUrl: './app.component.html',
})
export class AppComponent {}
```

You can now directly leverage your components in their template and take advantage of Angular template binding syntax.

```html title="app.component.html"
<my-component first="Your" last="Name"></my-component>
```

</TabItem>

<TabItem value="standalone">

Now you can import and reference your components in your consuming application in the same way you would with any other standalone Angular components:

```ts title="app.component.ts"
import { Component } from '@angular/core';
import { MyComponent } from 'component-library';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MyComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {}
```

You can now leverage your components in the template and take advantage of Angular template binding syntax.

```html title="app.component.html"
<my-component first="Your" last="Name"></my-component>
```

</TabItem>

</Tabs>

From your Angular workspace (`/packages/angular-workspace`), run `npm start` and navigate to `localhost:4200`. You should see the component rendered correctly.

## API

### componentCorePackage

**Required**

**Type: `string`**

The name of the Stencil package where components are available for consumers (i.e. the value of the `name` property in your Stencil component library's `package.json`).
This is used during compilation to write the correct imports for components.

For a starter Stencil project generated by running:

```bash npm2yarn
npm init stencil component my-component-lib
```

The `componentCorePackage` would be set to:

```ts title="stencil.config.ts"
export const config: Config = {
  ...,
  outputTargets: [
    angularOutputTarget({
      componentCorePackage: 'my-component-lib',
      // ... additional config options
    })
  ]
}
```

Which would result in an import path like:

```js
import { MyComponent } from 'my-component-lib/components/my-component.js';
```

### customElementsDir

**Optional**

**Default: `'components'`**

**Type: `string`**

This option can be used to specify the directory where the generated
custom elements live.

### excludeComponents

**Optional**

**Default: `[]`**

**Type: `string[]`**

This lets you specify component tag names for which you don't want to generate Angular wrapper components. This is useful if you need to write framework-specific versions of components. For instance, in Ionic Framework, this is used for routing components - like tabs - so that
Ionic Framework can integrate better with Angular's Router.

### directivesArrayFile

**Optional**

**Default: `null`**

**Type: `string`**

Used to provide a list of type Proxies to the Angular Component Library.
See [Ionic Framework](https://github.com/ionic-team/ionic-framework/blob/main/packages/angular/src/directives/proxies-list.ts) for a sample.

### directivesProxyFile

**Required**

**Type: `string`**

This parameter allows you to name the file that contains all the component wrapper definitions produced during the compilation process. This is the
first file you should import in your Angular project.

### outputType

**Required**

**Default: `'component'`**

**Type: `'component' | 'scam' | 'standalone`**

Specifies the type of output to be generated. It can take one of the following values:

1. `component`: Generates all the component wrappers to be declared on an Angular module. This option is required for Stencil projects using the `dist` hydrated output.

2. `scam`: Generates a separate Angular module for each component.

3. `standalone`: Generates standalone component wrappers.

Both `scam` and `standalone` options are compatible with the `dist-custom-elements` output.

:::note
The configuration for the [Custom Elements](../output-targets/custom-elements.md) output target must set the
[export behavior](../output-targets/custom-elements.md#customelementsexportbehavior) to `single-export-module` for the wrappers to generate correctly
if using the `scam` or `standalone` output type.
:::

Note: Please choose the appropriate `outputType` based on your project's requirements and the desired output structure.

### valueAccessorConfigs

**Optional**

**Default: `[]`**

**Type: `ValueAccessorConfig[]`**

This lets you define which components should be integrated with `ngModel` (i.e. form components). It lets you set what the target prop is (i.e. `value`),
which event will cause the target prop to change, and more.

```tsx title="stencil.config.ts"
const angularValueAccessorBindings: ValueAccessorConfig[] = [
  {
    elementSelectors: ['my-input[type=text]'],
    event: 'myChange',
    targetAttr: 'value',
    type: 'text',
  },
];

export const config: Config = {
  namespace: 'stencil-library',
  outputTargets: [
    angularOutputTarget({
      componentCorePackage: 'component-library',
      directivesProxyFile: '{path to your proxy file}',
      valueAccessorConfigs: angularValueAccessorBindings,
    }),
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
  ],
};
```

## FAQs

### Do I have to use the `dist` output target?

No! By default, this output target will look to use the `dist` output, but the output from `dist-custom-elements` can be used alternatively.

To do so, change the type `outputType` argument to either `scam` or `standalone`. For more information on both these options, see the [API section](#outputtype).

```ts title="stencil.config.ts"
export const config: Config = {
  ...,
  outputTargets: [
    // Needs to be included
    {
      type: 'dist-custom-elements'
    },
    angularOutputTarget({
      componentCorePackage: 'component-library',
      directivesProxyFile: '{path to your proxy file}',
      // This is what tells the target to use the custom elements output
      outputType: 'standalone' // or 'scam'
    })
  ]
}
```

Now, all generated imports will point to the default directory for the custom elements output. If you specified a different directory
using the `dir` property for `dist-custom-elements`, you need to also specify that directory for the Angular output target. See
[the API section](#customelementsdir) for more information.

In addition, all the Web Component will be automatically defined as the generated component modules are bootstrapped. So, you do not need to implement
the Stencil loader for lazy-loading the custom elements (i.e. you can remove the `APP_INITIALIZER` logic introduced [in this section](#adding-the-angular-output-target)).
As such, the generated Angular components can now be directly imported and declared on any Angular module implementing them:

```ts title="app.module.ts"
import { MyComponent } from 'component-library';

@NgModule({
  declarations: [MyComponent],
})
export class AppModule {}
```

### What is the best format to write event names?

Event names shouldn’t include special characters when initially written in Stencil, try to lean on using camelCased event names for interoperability
between frameworks.

### How do I bind input events directly to a value accessor?

You can configure how your input events can map directly to a value accessor, allowing two-way data-binding to be a built in feature of any of your
components. Take a look at [valueAccessorConfig's option above](#valueaccessorconfigs).

### How do I access components with ViewChild or ViewChildren?

Once included, components could be referenced in your code using `ViewChild` and `ViewChildren` as in the following example:

```tsx
import { Component, ElementRef, ViewChild } from '@angular/core';

import { TestComponent } from 'test-components';

@Component({
  selector: 'app-home',
  template: `<test-components #test></test-components>`,
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  @ViewChild(TestComponent) myTestComponent: ElementRef<TestComponent>;

  async onAction() {
    await this.myTestComponent.nativeElement.testComponentMethod();
  }
}
```

### Why aren't my custom interfaces exported from within the index.d.ts file?

Usually when beginning this process, you may bump into a situation where you find that some of the interfaces you've used in your Stencil component
library aren't working in your Angular component library. You can resolve this issue by adding an `interfaces.d.ts` file located within the root
of your Stencil component library's project folder, then manually exporting types from that file e.g. `export * from './components';`

When adding this file, it's also recommended to update your package.json's types property to be the distributed file, something like:
`"types": "dist/types/interfaces.d.ts"`
