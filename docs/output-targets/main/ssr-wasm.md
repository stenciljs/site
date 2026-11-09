---
title: SSR WASM Output Target
sidebar_label: ssr-wasm
sidebar_position: 4
description: Render Stencil components to HTML from any language with a WebAssembly runtime
slug: /ssr-wasm
---

# SSR WASM Output Target

:::caution Experimental
`ssr-wasm` is experimental. Its options and output may change between releases.
:::

The `ssr-wasm` output target compiles your components' [server-side rendering](./ssr.md) module to a WebAssembly binary. A server written in PHP, Java, Go, Ruby, Rust, .NET, or any other language with a WebAssembly runtime can then render your components to HTML, without running Node.js.

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

Takes the HTML to render and, optionally, [render options](./ssr.md#render-options):

```json
{
  "html": "<my-greeting name=\"Stencil\"></my-greeting>",
  "options": { "fullDocument": false }
}
```

Returns the [render results](./ssr.md#results) as JSON. The rendered HTML is in `html`.

If rendering fails, it returns an error instead. `diagnostics` is included when the renderer reported the failure:

```json
{ "__error": "...", "diagnostics": [] }
```

Options that are functions, such as `beforeSsr`, can't be passed as JSON, so they aren't available.

### setTagTransformer

Renders components under different tag names, to match [tag transformation](../../guides/distribution/tag-name-clashes/tag-transformation.md) on the client. Takes a list of mappings:

```json
[{ "from": "my-greeting", "to": "acme-greeting" }]
```

Call it once, before rendering. Calling it again later works too, but sets up the runtime from scratch on the next render.

### resetSsrDocData

Restarts the hydration IDs that fragment renders share. Takes no input. See [Hydration IDs](#hydration-ids).

## Running the Plugin in a Server

### Instances

A plugin instance runs one call at a time and isn't thread-safe. Never share an instance between concurrent requests.

- Compile the module once per process. Most host SDKs have a compiled-plugin type for this, such as `CompiledPlugin` in Go and Python.
- Create instances from the compiled module. Give each worker or thread its own instance, or keep a pool and check one out for the whole request.
- The first call to a new instance starts the JavaScript runtime and loads your components, so it's slower than later calls. To keep that cost off a request, call `resetSsrDocData` once when you create the instance.

An instance only runs one call at a time, so its renders share one window: the plugin turns on [`reuseWindow`](./ssr.md#reusewindow) by default. That way it sets up Stencil's runtime and your components once, rather than on every call. To turn it off, pass `"reuseWindow": false` in the render options.

Host SDKs built on `libextism`, such as those for Python, Ruby, and PHP, cache compiled code in `~/.cache/wasmtime`. If the server's user can't write to its home directory, compiling the plugin fails. Compiling the plugin once while you build your server image fills that cache, so workers start faster.

### Rendering

There are two ways to use the plugin in a server framework. Use one or the other on a page. If a whole-page render receives a page that already contains rendered fragments, it renders those components again.

- **Render the whole page.** Pass each HTML response through `renderToString` with default options, from a middleware or response hook. The page's templates don't change. See [Using It in a Server Framework](./ssr.md#using-it-in-a-server-framework).
- **Render components from templates.** Add a template helper, tag, or filter that passes one component's markup to `renderToString` with `"fullDocument": false`, and writes the result into the page. The rest of the page never goes through the plugin.

A fragment from `"fullDocument": false` starts with the `<style>` elements its scoped components need, because a fragment has no `<head>` to put them in. Shadow components carry their styles in their Declarative Shadow DOM.

If the result has `__error`, log it and serve the HTML you passed in. The page then renders on the client.

The browser hydrates the server-rendered HTML only if the page also loads your components' client-side JavaScript, from [`loader-bundle`](./loader-bundle.md) or [`standalone`](./standalone.md).

### Hydration IDs

Stencil's hydration markup (`s-id`, `c-id`, and comments such as `<!--r.1-->`) uses IDs that must be unique within a page.

- A full-document render always numbers its IDs from 1. It needs no reset.
- Fragment renders (`"fullDocument": false`) share one sequence in the plugin instance, so the fragments of one page never collide. The sequence keeps counting across requests.

To get identical output for identical input, call `resetSsrDocData` once per request, before the request's first fragment. If you never call it, the IDs are still unique. Never call it between fragments of the same page. Their IDs then collide, and the client can hydrate the wrong elements.

## Working Examples

The [ssr-wasm-examples](https://github.com/stenciljs/ssr-wasm-examples) repository has the same demo app in several languages. Each one renders whole pages from a middleware, and single components from a template helper, using that language's Extism host SDK:

| Language | Framework | Example |
|---|---|---|
| PHP | Laravel | [`php-laravel`](https://github.com/stenciljs/ssr-wasm-examples/tree/main/examples/php-laravel) |
| Python | Django | [`python-django`](https://github.com/stenciljs/ssr-wasm-examples/tree/main/examples/python-django) |
| Ruby | Rails | [`ruby-rails`](https://github.com/stenciljs/ssr-wasm-examples/tree/main/examples/ruby-rails) |
| Go | `net/http` | [`go-nethttp`](https://github.com/stenciljs/ssr-wasm-examples/tree/main/examples/go-nethttp) |
| Rust | Axum | [`rust-axum`](https://github.com/stenciljs/ssr-wasm-examples/tree/main/examples/rust-axum) |
| Java | Spring Boot | [`java-spring`](https://github.com/stenciljs/ssr-wasm-examples/tree/main/examples/java-spring) |
| C# | ASP.NET Core | [`dotnet-aspnet`](https://github.com/stenciljs/ssr-wasm-examples/tree/main/examples/dotnet-aspnet) |

## Writing Components for ssr-wasm

The plugin runs your components in [QuickJS](https://github.com/quickjs-ng/quickjs), not Node.js. The guidance in [Writing SSR-Friendly Components](./ssr.md#writing-ssr-friendly-components) applies, with these differences.

### Complex Props

The plugin receives only HTML, and neither `beforeSsr` nor [`ssrProp()`](./ssr.md#complex-props) is available. To give a component an object or array on the server, write it into an attribute as JSON, and declare the prop with [`serialize: 'json'`](../../components/properties.md#serialize-as-json-serialize):

```tsx
@Prop({ serialize: 'json' }) items: Item[] = [];
```

For another format, convert the attribute with your own [`@AttrDeserialize()`](../../components/serialization-deserialization.md#the-attrdeserialize-decorator-attrdeserialize) instead.

The server writes the JSON with its template engine's normal escaping. The browser receives the same attribute, so the component has the data after hydration too:

```html
<my-list items="[{&quot;title&quot;:&quot;First&quot;}]"></my-list>
```

### Timers

QuickJS has no timers, so the plugin runs `setTimeout`, `setInterval`, `requestAnimationFrame`, and `requestIdleCallback` on a virtual clock. While a render is in progress, the plugin fires timers in the order they're due, and lets pending promise work run before each one. Nothing waits in real time: a `componentWillLoad` that waits for a 500 ms timer doesn't make the render take 500 ms.

The [`timeout`](./ssr.md#render-options) render option (default `15000`) limits virtual time. A timer due at or after `timeout` never fires. If a component is still waiting when no timer can fire, for example on a timer due after `timeout` or on an interval it never clears, `renderToString` returns `__error`.

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
