---
title: Integrated Dev Server Config
sidebar_label: Dev Server
description: Integrated Dev Server Config
slug: /dev-server
---

# Integrated Dev Server

Stencil comes with an integrated dev server in order to simplify development. By integrating the build process and the dev server, Stencil is able to drastically improve the development experience without requiring complicated build scripts and configuration. As app builds and re-builds take place, the compiler is able to communicate with the dev server, and vice versa.

## Hot Module Replacement

The compiler already provides a watch mode, but coupled with the dev server it's able to go one step farther by reloading only what has changed within the browser. Hot Module Replacement allows the app to keep its state within the browser, while switching out individual components with their updated logic after file saves.

## Style Replacement

Web components can come with their own css, can use shadow dom, and can have individual style tags. Traditionally, live-reload external css links usually does the trick, however, updating components with inline styles within shadow roots has been a challenge. With the integrated dev server, Stencil is able to dynamically update styles for all components, whether they're using shadow dom or not, without requiring a page refresh.

## Development Errors

When errors happen during development, such as printing an error for invalid syntax, Stencil will not only log the error and the source of the error in the console, but also overlay the app with the error so it's easier to read.

## Open In Editor

When a development error is shown and overlays the project within the browser, line numbers pointing to the source text are clickable,
which will open the source file directly in your IDE.

## Dev Server Config

### `address`

**Optional**

**Type: `string`**

**Default: `0.0.0.0`**

IP address used by the dev server. The default is `0.0.0.0`, which points to all IPv4 addresses on the local machine, such as `localhost`.

### `basePath`

**Optional**

**Type: `string`**

**Default: `/`**

Base path to be used by the server. Defaults to the root pathname.

### `https`

**Optional**

**Type: `{ key: string; cert: string; } | false`**

**Default: `false`**

By default the dev server runs over the http protocol. Instead you can run it over https by providing your own SSL certificate and key (see example below).

#### Example

```tsx
import { readFileSync } from 'fs';
import { Config } from '@stencil/core';

export const config: Config = {
  devServer: {
    reloadStrategy: 'pageReload',
    port: 4444,
    https: {
      cert: readFileSync('cert.pem', 'utf8'),
      key: readFileSync('key.pem', 'utf8'),
    },
  },
};
```

### `initialLoadUrl`

**Optional**

**Type: `string`**

**Default: `/`**

The URL the dev server should first open to.

### `logRequests`

**Optional**

**Type: `boolean`**

**Default: `false`**

Every request to the server will be logged within the terminal.

### `openBrowser`

**Optional**

**Type: `boolean`**

**Default: `true`**

By default, when dev server is started the local dev URL is opened in your default browser. However, to prevent this URL to be opened change this value to `false`.

### `pingRoute`

**Optional**

**Type: `string | null`**

**Default: `/ping`**

Route to be registered on the dev server that will respond with a 200 OK response once the Stencil build has completed. The Stencil dev server will "spin up"
before the build process has completed, which can cause issues with processes that rely on the compiled and served output (like E2E testing). This route provides
a way for these processes to know when the build has finished and is ready to be accessed.

If set to `null`, no route will be registered.

### `port`

**Optional**

**Type: `number`**

**Default: `3333`**

Sets the server's port.

### `reloadStrategy`

**Optional**

**Type: `'hmr' | 'pageReload' | null`**

**Default: `hmr`**

When files are watched and updated, by default the dev server will use `hmr` (Hot Module Replacement) to update the page without a full page refresh.
To have the page do a full refresh use `pageReload`. To disable any reloading, use `null`.

### `root`

**Optional**

**Type: `string`**

**Default: `www` output directory if exists, project root otherwise**

The directory to serve files from.
