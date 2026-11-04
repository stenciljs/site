---
title: Stencil Compiler API
sidebar_label: Compiler API
description: The JavaScript API of the Stencil compiler
slug: /compiler-api
---

# Stencil Compiler API

The compiler API is the `@stencil/core/compiler` module. It runs in Node.js, and is an ES module, so load it with `import`:

```ts
import { createCompiler, loadConfig } from '@stencil/core/compiler';
```

## createCompiler()

```tsx
createCompiler(config: Config): Promise<Compiler>
```

Creates a compiler for a project. The compiler brings together the transpiler, bundler, and minifier, and is what `stencil build` runs. Create `config` with [`loadConfig()`](#loadconfig).

A `Compiler` has these methods:

| Method | Description |
| --- | --- |
| `build()` | Runs one build, and returns its results, including `hasError` and `diagnostics` |
| `createWatcher()` | Returns a `CompilerWatcher`, which rebuilds when source files change |
| `destroy()` | Releases the compiler's resources |

To compile one file without a project, use [`transpile()`](#transpile).

This example runs a full build:

```ts
import { createCompiler, loadConfig } from '@stencil/core/compiler';
import { createNodeLogger, createNodeSys } from '@stencil/core/sys/node';

const logger = createNodeLogger();
const sys = createNodeSys({ process, logger });
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
createSystem(c?: { logger?: Logger }): CompilerSystem
```

The compiler reads and writes files through a `CompilerSystem`. This function creates one that works in memory only, independent of any platform. For a system that uses the real file system, use [`createNodeSys()`](#createnodesys).

## loadConfig()

```tsx
loadConfig(init?: LoadConfigInit): Promise<LoadConfigResults>
```

Turns raw config into the validated config that the compiler and the dev server need. `init` takes a `logger`, a `sys`, and either a `config` object or a `configPath` to a config file.

The result has the validated `config`, any `diagnostics`, and the project's resolved `tsconfig`.

## transpile()

```tsx
transpile(code: string, opts?: TranspileOptions): Promise<TranspileResults>
```

Compiles one source file, given as a string, from TypeScript to JavaScript. The function is stateless. It doesn't bundle or minify, and it doesn't run CSS preprocessors such as Sass.

The result has the output `code`, a source `map`, the `imports` found in the file, and any `diagnostics`.

```ts
const results = await transpile(source, { file: 'my-component.tsx' });
```

## transpileSync()

```tsx
transpileSync(code: string, opts?: TranspileOptions): TranspileResults
```

The synchronous equivalent of `transpile()`. In a browser, TypeScript must already be available globally.

## optimizeCss()

```tsx
optimizeCss(inputOpts: OptimizeCssInput): Promise<OptimizeCssOutput>
```

Optimizes CSS as the compiler does. The result has the `output` string and any `diagnostics`.

## optimizeJs()

```tsx
optimizeJs(inputOpts: OptimizeJsInput): Promise<OptimizeJsOutput>
```

Optimizes JavaScript as the compiler does. The result has the `output` string and any `diagnostics`.

## version

```tsx
version: string
```

The version of `@stencil/core`.

## versions

```tsx
versions: { stencil: string; typescript: string; rolldown: string; terser: string }
```

The installed versions of Stencil and of the tools the compiler uses.

## @stencil/core/sys/node

The `@stencil/core/sys/node` module creates the Node.js logger and system that the functions above take.

### createNodeLogger()

```tsx
createNodeLogger(): Logger
```

Creates a logger that writes to the terminal.

### createNodeSys()

```tsx
createNodeSys(c?: { process?: any; logger?: Logger }): CompilerSystem
```

Creates the system that the compiler uses for everything Node.js-specific, such as reading and writing files and hashing content.
