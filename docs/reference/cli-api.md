---
title: Stencil Core CLI API
sidebar_label: CLI API
description:  Stencil Core CLI API
slug: /cli-api
---

# Stencil Core CLI API

The CLI API can be found at `@stencil/core/cli` and ran by `bin/stencil`.


## createNodeLogger()

```tsx
createNodeLogger(process: any): Logger
```

Creates a "logger", based off of NodeJS APIs, that will be used by the compiler and dev-server.
By default the CLI uses this method to create the NodeJS logger. The NodeJS "process"
object should be provided as the first argument.


## createNodeSystem()

```tsx
createNodeSystem(process: any): CompilerSystem
```

Creates the "system", based off of NodeJS APIs, used by the compiler. This includes any and
all file system reads and writes using NodeJS. The compiler itself is unaware of Node's
`fs` module. Other system APIs include any use of `crypto` to hash content. The NodeJS "process"
object should be provided as the first argument.


## parseFlags()

```tsx
parseFlags(args: string[]): ConfigFlags
```

Used by the CLI to parse command-line arguments into a typed `ConfigFlags` object.
This is an example of how it's used internally: `parseFlags(process.argv.slice(2))`.


## run()

```tsx
run(init: CliInitOptions): Promise<void>
```

Runs the CLI with the given options. This is used by Stencil's default `bin/stencil` file,
but can be used externally too.


## runTask()

```tsx
runTask(process: any, config: Config, task: TaskCommand,  sys?: CompilerSystem): Promise<void>
```

Runs individual tasks giving a NodeJS `process`, Stencil `config`, and task command. You can optionally pass in the `sys` that's used by the compiler. See [createNodeSystem()](#createnodesystem) for more details. 
