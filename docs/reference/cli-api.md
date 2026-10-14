---
title: Stencil CLI API
sidebar_label: CLI API
description: The JavaScript API of the @stencil/cli package
slug: /cli-api
---

# Stencil CLI API

The `@stencil/cli` package holds the `stencil` command, and exports the functions that the command is built from. It's installed with `@stencil/core`, and is an ES module:

```ts
import { run } from '@stencil/cli';
```

For the command itself and its flags, see the [CLI reference](../config/cli.md).

## run()

```tsx
run(init: CliInitOptions): Promise<void>
```

Runs the CLI. `init` takes the command-line arguments, a logger, and a system, both of which come from [`@stencil/core/sys/node`](./compiler-api.md#stencilcoresysnode). The `stencil` command is this call:

```ts
import { run } from '@stencil/cli';
import { createNodeLogger, createNodeSys } from '@stencil/core/sys/node';

run({
  args: process.argv.slice(2),
  logger: createNodeLogger(),
  sys: createNodeSys(),
});
```

## runTask()

```tsx
runTask(
  coreCompiler: typeof import('@stencil/core/compiler'),
  config: Config,
  task: TaskCommand,
  sys: CompilerSystem,
  flags?: ConfigFlags,
): Promise<void>
```

Runs one task, such as `'build'` or `'docs'`, with a config that's already loaded. `coreCompiler` is the `@stencil/core/compiler` module.

## parseFlags()

```tsx
parseFlags(args: string[]): ConfigFlags
```

Parses command-line arguments into a `ConfigFlags` object. The first argument that isn't a flag becomes the task:

```ts
parseFlags(['build', '--dev', '--watch']);
// { task: 'build', dev: true, watch: true, args: ['--dev', '--watch'], ... }
```

## createConfigFlags()

```tsx
createConfigFlags(init?: Partial<ConfigFlags>): ConfigFlags
```

Creates a `ConfigFlags` object with every default in place, overridden by the values in `init`.

## Wizard Types

The package also exports the types that a package implements to take part in `stencil init` and `stencil add`, such as `StencilWizardPlugin` and `WizardContext`.
