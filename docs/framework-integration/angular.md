---
title: Angular Integration with Stencil
sidebar_label: Angular
description: Generate an Angular component library from your Stencil components
slug: /angular
---

# Angular Integration

**Supports: Angular 19 and later • Stencil v5**

`@stencil/angular-output-target` generates an Angular component for each of your Stencil components. Consumers of your library get real Angular components:

- typed inputs, and outputs for your custom events
- no `CUSTOM_ELEMENTS_SCHEMA` in the modules or components that use them
- components detached from Angular's change detection, so Angular doesn't re-check them needlessly
- optionally, form controls that work with `ngModel` and reactive forms

## Setup

The generated Angular components live in their own package, published alongside your Stencil library. A monorepo with one package for each is the recommended structure:

```tree
my-design-system/
├── package.json          workspace root
└── packages/
    ├── core/             your Stencil library
    └── angular/          the generated Angular library
```

### New Project

Run the [`stencil init` wizard](../getting-started/01-getting-started.md), pick **Angular** under framework integrations, and accept the monorepo workspace prompt. It creates the structure above with both packages configured.

### Existing Project

Run the wizard from your Stencil project:

```bash
stencil add @stencil/angular-output-target
```

It asks where the Angular package should go and which [component type](#component-types) to generate, then:

- creates the Angular package, set up to build with `ng-packagr`
- adds `angularOutputTarget()` to your `stencil.config.ts`, along with the output target your component type builds on
- installs the dependencies for both packages

### Manual Setup

To do the same by hand, install the output target in your Stencil project:

```bash npm2yarn
npm install @stencil/angular-output-target --save-dev
```

Add it to your config, pointing `directivesProxyFile` at a file in the Angular package's source directory:

```ts title="packages/core/stencil.config.ts"
import { Config } from '@stencil/core';
import { angularOutputTarget } from '@stencil/angular-output-target';

export const config: Config = {
  namespace: 'MyLibrary',
  outputTargets: [
    { type: 'standalone' },
    angularOutputTarget({
      componentCorePackage: 'my-library',
      customElementsDir: 'dist/standalone',
      directivesProxyFile: '../angular/src/lib/directives.ts',
    }),
  ],
};
```

The Angular package is an ordinary Angular library that depends on your Stencil library. Its entry file re-exports the generated components:

```ts title="packages/angular/src/index.ts"
export * from './lib/directives';
```

### Component Types

The `outputType` option sets the kind of Angular component that's generated:

| `outputType` | Generates | Built on | Consumers import |
|---|---|---|---|
| `'standalone'` (default) | Standalone components | [`standalone`](../output-targets/main/standalone.md) | each component |
| `'scam'` | A component and its own `NgModule` for each Stencil component | `standalone` | each component's module |
| `'component'` | Components for you to declare in one `NgModule` | [`loader-bundle`](../output-targets/main/loader-bundle.md) | your module |

With `'standalone'` and `'scam'`, each Angular component imports and registers its own custom element, so a consumer's bundler includes only the components their app uses.

With `'component'`, the generated components register nothing themselves. Set `directivesArrayFile` to generate a list of every component, then declare them in a module in your Angular package that also registers the custom elements with the lazy loader when the app starts. The wizard creates this module for you:

```ts title="packages/angular/src/lib/my-library.module.ts"
import { NgModule, provideAppInitializer } from '@angular/core';
import { defineCustomElements } from 'my-library/dist/loader-bundle/loader';
import { DIRECTIVES } from './directives.array';

@NgModule({
  declarations: [...DIRECTIVES],
  exports: [...DIRECTIVES],
  providers: [provideAppInitializer(() => defineCustomElements())],
})
export class MyLibraryModule {}
```

If your library sets [`generateExportMaps`](../config/01-overview.md#generateexportmaps), import the loader from `my-library/loader` instead.

The module is your code, and Stencil never regenerates it. It's the place for any setup your library needs before its components are defined, such as [`setNonce()`](../guides/distribution/csp-nonce.md) or [`setTagTransformer()`](../guides/distribution/tag-transformation.md), which the loader also exports.

## Building

Build the Stencil library first. That writes the Angular components to `packages/angular/src/lib/`. Then build the Angular package:

```bash npm2yarn
npm run build
```

In a workspace created by the wizard, running this from the root builds both in order.

Publish the two packages together, keeping their versions in step. See [Publishing](../guides/distribution/publishing.md).

## Consumer Usage

Consumers install your Angular package and import what your [component type](#component-types) provides. With standalone components:

```ts title="save-bar.component.ts"
import { Component } from '@angular/core';
import { MyButton } from 'my-library-angular';

@Component({
  selector: 'app-save-bar',
  imports: [MyButton],
  template: `<my-button variant="primary" (myPress)="save($event)">Save</my-button>`,
})
export class SaveBarComponent {
  save(event: CustomEvent) {
    console.log(event.detail);
  }
}
```

With `'scam'` they import `MyButtonModule`, and with `'component'` they import your library's module.

## Forms

To let consumers use `ngModel` and reactive forms with a component, tell the output target which prop holds the value and which event reports a change:

```ts
angularOutputTarget({
  componentCorePackage: 'my-library',
  customElementsDir: 'dist/standalone',
  directivesProxyFile: '../angular/src/lib/directives.ts',
  valueAccessorConfigs: [
    {
      elementSelectors: ['my-input'],
      event: 'myChange',
      targetAttr: 'value',
      type: 'text',
    },
  ],
}),
```

`type` is one of `'text'`, `'number'`, `'boolean'`, `'select'`, or `'radio'`. For each type you use, a value accessor directive is generated next to the components, such as `text-value-accessor.ts`.

The generated accessors import from `@angular/forms`, so add it to your Angular package's peer dependencies. They're also not standalone, so declare and export them from a module in your Angular package:

```ts title="packages/angular/src/lib/forms.module.ts"
import { NgModule } from '@angular/core';
import { TextValueAccessor } from './text-value-accessor';

@NgModule({
  declarations: [TextValueAccessor],
  exports: [TextValueAccessor],
})
export class MyLibraryFormsModule {}
```

## API

### componentCorePackage

**Required**

**Type: `string`**

The package name of your Stencil library, which the generated components import from.

### directivesProxyFile

**Required**

**Type: `string`**

The file the Angular components are written to, relative to your Stencil project.

### outputType

**Type: `'standalone' | 'scam' | 'component'`**

**Default: `'standalone'`**

The kind of Angular component to generate. See [Component Types](#component-types).

### customElementsDir

**Type: `string`**

The directory of the `standalone` output, relative to your Stencil project. Used by the `'standalone'` and `'scam'` types.

### directivesArrayFile

**Type: `string`**

A file to write a `DIRECTIVES` array to, listing every generated component. Used with the `'component'` type, to declare them all in one module.

### valueAccessorConfigs

**Type: `ValueAccessorConfig[]`**

**Default: `[]`**

The components that work with Angular forms. See [Forms](#forms).

### excludeComponents

**Type: `string[]`**

Tag names to leave out of the Angular library.

### esModules

**Type: `boolean`**

**Default: `false`**

Write each component to its own file, with `directivesProxyFile` re-exporting them all. Applies to the `'standalone'` and `'scam'` types.

### booleanAttributes

**Type: `boolean`**

**Default: `false`**

Lets consumers set a boolean input by attribute presence (`<my-input disabled>`), where they'd otherwise have to bind it (`<my-input [disabled]="true">`). Use it together with `inlineProperties`, which is what makes Angular type-check these bindings.

### inlineProperties

**Type: `boolean`**

**Default: `false`**

Experimental. Declares each component's inputs as typed class members, so the Angular Language Service can type-check them and show their documentation in templates.

### transformTag

**Type: `boolean`**

**Default: `false`**

Generates a script that patches the Angular components' selectors, so consumers can register them under different tag names. See [Tag Transformation](../guides/distribution/tag-transformation.md#angular).
