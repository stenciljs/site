---
title: SSR WASM Output Target
sidebar_label: Overview
description: Render Stencil components to HTML from any language with a WebAssembly runtime
slug: /ssr-wasm
---

# SSR WASM Output Target

The `ssr-wasm` output target compiles your components' [server-side rendering](../ssr/01-overview.md) module to a WebAssembly binary. A server written in PHP, Java, Go, Ruby, Rust, .NET, or any other language with a WebAssembly runtime can then render your components to HTML, without running Node.js.

The binary is an [Extism](https://extism.org/) plugin, so it's loaded with an [Extism host SDK](https://extism.org/docs/concepts/host-sdk) for your server's language.

```tsx title="stencil.config.ts"
outputTargets: [
  {
    type: 'ssr-wasm',
  },
];
```

Building the `.wasm` file requires the [`extism-js`](https://github.com/extism/js-pdk#install-the-compiler) compiler on your `PATH`. Without it, Stencil writes the JavaScript source and warns that the binary was skipped.

## Output

```tree
dist/ssr-wasm
├── index.wasm    the plugin
├── index.js      JavaScript source compiled into the plugin
└── plugin.d.ts   the plugin's exported functions, used by extism-js
```

## Calling the Plugin

Load `index.wasm` with WASI enabled, then call its exported functions. Every function takes and returns a JSON string.

### renderToString

Takes the HTML to render and, optionally, [render options](../ssr/01-overview.md#render-options):

```json
{
  "html": "<my-greeting name=\"Stencil\"></my-greeting>",
  "options": { "fullDocument": false }
}
```

Returns the [render results](../ssr/01-overview.md#results) as JSON - the rendered HTML is in `html`. On failure, it returns `{ "__error": "..." }` instead.

Options that are functions, such as `beforeSsr`, can't be passed as JSON, so they aren't available.

### setTagTransformer

Renders components under different tag names, to match [tag transformation](../../../guides/distribution/tag-transformation.md) on the client. Takes a list of mappings:

```json
[{ "from": "my-greeting", "to": "acme-greeting" }]
```

Call it once, before rendering.

### resetSsrDocData

Resets the counters used for the IDs in Stencil's hydration markup. Takes no input. Call it between renders when you need identical output for identical input, such as in snapshot tests.

## Config

### dir

*default: `dist/ssr-wasm`*

Where the plugin is written.

### minify

*default: `false`*

Minify the JavaScript before compiling it.

### empty

*default: `true`*

Empty [`dir`](#dir) before each build.

### skipInDev

*default: `true`*

Skip this output during development builds.
