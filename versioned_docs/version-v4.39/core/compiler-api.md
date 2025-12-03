---
title: Stencil Core Compiler API
sidebar_label: Compiler API
description:  Stencil Core Compiler API
slug: /compiler-api
---

# Stencil Core Compiler API

The compiler API can be found at `@stencil/core/compiler/stencil.js`. This module can 
work in a NodeJS environment.


```tsx
// NodeJS (commonjs)
const stencil = require('@stencil/core/compiler');
```

## transpile()

```tsx
transpile(code: string, opts?: TranspileOptions): Promise<TranspileResults>
```

The `transpile()` function inputs source code as a string, with various options
within the second argument. The function is stateless and returns a `Promise` of the
results, including diagnostics and the transpiled code. The `transpile()` function
does not handle any bundling, minifying, or precompiling any CSS preprocessing like
Sass or Less. 

The `transpileSync()` equivalent is available so the same function
it can be called synchronously. However, TypeScript must be already loaded within
the global for it to work, where as the async `transpile()` function will load
TypeScript automatically.

Since TypeScript is used, the source code will transpile from TypeScript to JavaScript,
and does not require Babel presets. Additionally, the results includes an `imports`
array of all the import paths found in the source file. The transpile options can be
used to set the `module` format, such as `cjs`, and JavaScript `target` version, such
as `es2017`.


## transpileSync()

```tsx
transpileSync(code: string, opts?: TranspileOptions): TranspileResults
```

Synchronous equivalent of the `transpile()` function. When used in a browser
environment, TypeScript must already be available globally, where as the async
`transpile()` function will load TypeScript automatically.


## createCompiler()

```tsx
createCompiler(config: Config): Promise<Compiler>
```

The compiler is the utility that brings together many tools to build optimized components, such as a
transpiler, bundler and minifier. When using the CLI, the `stencil build` command uses the compiler for
the various builds, such as a production build, or watch mode during development. If only one file should
be transpiled (converting source code from TypeScript to JavaScript) then the `transpile()` function should be used instead.

Given a Stencil config, this method asynchronously returns a `Compiler` instance. The config provided
should already be created using the `loadConfig({...})` method.

Below is an example of a NodeJS environment running a full build.

```tsx
import { createNodeLogger, createNodeSys } from '@stencil/core/sys/node';
import { createCompiler, loadConfig } from '@stencil/core/compiler';

const logger = createNodeLogger(process);
const sys = createNodeSys(process);
const validated = await loadConfig({
  logger,
  sys,
  config: {
    /* user config */
  },
});
const compiler = await createCompiler(validated.config);
const results = await compiler.build();
```


## createSystem()

```tsx
createSystem(): CompilerSystem
```

The compiler uses a `CompilerSystem` instance to access any file system reads and writes. When used
from the CLI, the CLI will provide its own system based on NodeJS. This method provide a compiler
system is in-memory only and independent of any platform.


## dependencies

```tsx
dependencies: CompilerDependency[]
```

The `dependencies` array is only informational and provided to state which versions of dependencies
the compiler was built and works with. For example, the version of TypeScript, Rollup and Terser used
for this version of Stencil are listed here.


## loadConfig()

```tsx
loadConfig(init?: LoadConfigInit): Promise<LoadConfigResults>
```

The `loadConfig(init)` method is used to take raw config information and transform it into a
usable config object for the compiler and dev-server. The `init` argument should be given
an already created system and logger which can also be used by the compiler.


## optimizeCss()

```tsx
optimizeCss(cssInput?: OptimizeCssInput): Promise<OptimizeCssOutput>
```

Utility function used by the compiler to optimize CSS.


## optimizeJs()

```jsx
optimizeJs(jsInput?: OptimizeJsInput): Promise<OptimizeJsOutput>
```

Utility function used by the compiler to optimize JavaScript. Knowing the JavaScript target
will further apply minification optimizations beyond usual minification.


## path

```tsx
path: PlatformPath
```

Utility of the `path` API provided by NodeJS, but capable of running in any environment.
This `path` API is only the POSIX version: https://nodejs.org/api/path.html


## version

```tsx
version: string
```

Current version of `@stencil/core`.
