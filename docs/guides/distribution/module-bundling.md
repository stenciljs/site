---
title: Module Bundling
sidebar_label: Bundling
description: How Stencil bundles your components, and how to handle common bundling problems
slug: /module-bundling
---

# Module Bundling

Stencil bundles your components with [Rolldown](https://rolldown.rs/). This guide covers the rules Stencil applies to component files, and how to deal with the most common problems when bundling dependencies.

## One Component Per Module

Each component must be in its own file, and that file can't export anything else besides types. Stencil relies on this to work out how components depend on each other, so it can split them into bundles that load only when they're needed.

This is **not** valid:

```tsx title="src/components/my-cmp/my-cmp.tsx"
// A file with a component can't export anything else
export function someUtilFunction() {
  console.log('do stuff');
}

@Component({
  tag: 'my-cmp',
})
export class MyCmp {}
```

The build fails with:

```
[ ERROR ]  src/components/my-cmp/my-cmp.tsx:2:1
           To allow efficient bundling, modules using @Component() can only
           have a single export which is the component class itself. Any other
           exports should be moved to a separate file.

      L2:  export function someUtilFunction() {
```

Move shared functions and classes into their own file, and import them where they're needed:

```tsx title="src/utils/utils.ts"
export function someUtilFunction() {
  console.log('do stuff');
}
```

```tsx title="src/components/my-cmp/my-cmp.tsx"
import { someUtilFunction } from '../../utils/utils';

@Component({
  tag: 'my-cmp',
})
export class MyCmp {}
```

Exporting types, interfaces, and enums from a component file is allowed.

## CommonJS Dependencies

Rolldown bundles [CommonJS](https://nodejs.org/api/modules.html) dependencies without any extra setup, so you can import them like any other package.

ES modules can be analyzed more precisely, though, so an ESM dependency usually adds less code to your bundle than a CommonJS one that does the same job. Prefer the ESM version of a library when it has one.

CommonJS code is also bundled in strict mode. A very old dependency that relies on non-strict syntax, such as octal literals, fails to parse, and has to be updated or replaced.

## Custom Rolldown Plugins

Add your own Rolldown plugins with [`rolldownPlugins`](../../config/plugins.md#rolldown-plugins) in `stencil.config.ts`. They run after Stencil's own plugins, the `before` list first and then the `after` list:

```tsx title="stencil.config.ts"
import { Config } from '@stencil/core';

export const config: Config = {
  rolldownPlugins: {
    before: [
      {
        name: 'inline-version',
        transform(code) {
          return code.includes('__VERSION__') ? code.replace(/__VERSION__/g, '"1.0.0"') : null;
        },
      },
    ],
  },
};
```

Rolldown's [plugin API](https://rolldown.rs/apis/plugin-api) is compatible with Rollup's, so most Rollup plugins work too.

Don't add `@rollup/plugin-commonjs` or `@rollup/plugin-node-resolve`. Rolldown does both jobs itself, and Stencil warns if it finds them. To change how modules are resolved, such as adding an alias, use the `nodeResolve` config option, which takes Rolldown's [`resolve` options](https://rolldown.rs/reference/InputOptions.resolve):

```tsx title="stencil.config.ts"
export const config: Config = {
  nodeResolve: {
    alias: {
      'old-package': 'new-package',
    },
  },
};
```

## Node Polyfills

Some dependencies import modules that are built into Node.js, such as `path` or `events`, which don't exist in a browser. When Stencil meets one, the build fails with:

```
[ ERROR ]  Node Polyfills Required
           For the import "path" to be bundled from node_modules/some-dependency/index.js, ensure the
           "@rolldown/plugin-node-polyfills" plugin is installed and added to the stencil config plugins.
```

To fix it, install the plugin:

```bash npm2yarn
npm install @rolldown/plugin-node-polyfills --save-dev
```

And add it to your config:

```tsx title="stencil.config.ts"
import { Config } from '@stencil/core';
import nodePolyfills from '@rolldown/plugin-node-polyfills';

export const config: Config = {
  rolldownPlugins: {
    after: [nodePolyfills()],
  },
};
```

The plugin replaces each Node.js module with a browser version. Some modules can't be recreated in a browser: `fs` and `crypto` are replaced with empty stand-ins, so a dependency that really needs them still won't work. Check the plugin's [support table](https://github.com/rolldown/rolldown-plugin-node-polyfills#nodejs-builtin-support-table) for the module you need.
