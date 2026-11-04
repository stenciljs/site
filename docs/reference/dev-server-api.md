---
title: Stencil Dev Server API
sidebar_label: Dev Server API
description: The JavaScript API of the @stencil/dev-server package
slug: /dev-server-api
---

# Stencil Dev Server API

The `@stencil/dev-server` package holds the server behind `stencil serve` and `stencil build --serve`. It's installed with `@stencil/core`, and is an ES module:

```ts
import { start } from '@stencil/dev-server';
```

For the server's options, see the [dev server config](../config/dev-server.md).

## start()

```tsx
start(stencilDevServerConfig: StencilDevServerConfig, logger: Logger, watcher?: CompilerWatcher): Promise<DevServer>
```

Starts the dev server. Pass a compiler's watcher as `watcher` to connect the server to that compiler's builds.

The returned `DevServer` has the server's `address`, `port`, `protocol`, `root`, `basePath`, and `browserUrl`, and a `close()` method that stops it.

```ts
import { createCompiler, loadConfig } from '@stencil/core/compiler';
import { createNodeLogger, createNodeSys } from '@stencil/core/sys/node';
import { start } from '@stencil/dev-server';

const logger = createNodeLogger();
const sys = createNodeSys({ process, logger });
const { config } = await loadConfig({ logger, sys, config: { rootDir: process.cwd() } });

const compiler = await createCompiler(config);
const watcher = await compiler.createWatcher();
const devServer = await start(config.devServer, logger, watcher);

console.log(devServer.browserUrl);
```
