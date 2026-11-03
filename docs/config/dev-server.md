---
title: Integrated Dev Server Config
sidebar_label: Dev Server
description: Integrated Dev Server Config
slug: /dev-server
---

# Integrated Dev Server

Stencil comes with an integrated dev server in order to simplify development. By integrating the build process and the dev server, Stencil is able to drastically improve the development experience without requiring complicated build scripts and configuration. As app builds and re-builds take place, the compiler is able to communicate with the dev server, and vice versa.

## Component Previews

In a project without a [`www` output target](../output-targets/main/www.md), such as a component library, the dev server previews your components straight from `src`. Start it, and open the folder of the component you're working on:

```bash
stencil build --dev --watch --serve
```

```
http://localhost:3333/src/components/my-greeting/
```

The server's root address redirects to `/src/`, so you can also browse your way to it.

For each component in the folder, the preview page shows its tag, the description from its JSDoc comment, and a demo. The demos come from the `usage` folder next to the component: each `html` code block in a `usage/*.md` file is rendered as one demo. A component without usage examples is rendered once with no attributes.

````md title="src/components/my-greeting/usage/example.md"
# Example

```html
<my-greeting name="World"></my-greeting>
```
````

The same usage files appear in your [generated documentation](../output-targets/documentation-generation/01-overview.md), and [`stencil generate`](./cli.md#stencil-generate) can create one for a new component.

To write your own demo page instead, add an `index.html` to the component's folder. A folder that contains any HTML file, at any depth, is served as it is, without a generated preview.

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

**Default: `false`**

Set to `true` to open the local dev URL in your default browser when the dev server starts.

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

### `strictPort`

**Optional**

**Type: `boolean`**

**Default: `false`**

When set to `true`, the dev server will fail to start if the specified `port` is already in use. When set to `false`, the dev server will try the next available port if the specified port is in use.

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

### `ssr`

**Optional**

**Type: `boolean`**

**Default: `false`**

Server-renders each page the dev server serves, so you can check how your components [render on a server](../output-targets/main/ssr.md). The `--ssr` CLI flag sets it for one run. It's for development only.
