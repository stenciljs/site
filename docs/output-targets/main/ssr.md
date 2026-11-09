---
title: SSR Output Target
sidebar_label: ssr
sidebar_position: 3
description: Render Stencil components to HTML on a server
slug: /ssr
---

# SSR Output Target

The `ssr` output target builds a server-side rendering module for your component library. Given an HTML string or a document, it renders every Stencil component inside it and returns the resulting HTML. Shadow DOM components are rendered as [Declarative Shadow DOM](https://web.dev/articles/declarative-shadow-dom) by default, and the browser hydrates the markup once your components' JavaScript loads.

The module has no Node.js dependencies, so it runs in Node.js 22+, Deno, Bun, Cloudflare Workers, and other runtimes with web-standard APIs. To render from a non-JavaScript server, see [`ssr-wasm`](./ssr-wasm.md). To decide between rendering on request and at build time, see [Rendering Strategies](../../concepts/rendering-strategies.md).

```tsx title="stencil.config.ts"
outputTargets: [
  {
    type: 'ssr',
  },
];
```

:::note
Formerly `dist-hydrate-script` in Stencil v4.
:::

To render every page of a site built with the [`www` output target](./www.md) to HTML at build time, see [Prerendering](../../guides/applications/prerendering/01-overview.md).

## Output

```tree
dist/ssr
├── index.js
├── index.d.ts
├── ssr-prop.js
└── ssr-prop.d.ts
```

`index.js` is the server-side rendering module. `ssr-prop.js` exports [`ssrProp()`](#complex-props), for framework templates; it runs in the browser too, so it's separate.

Expose both to consumers through your package's `exports` ([`generateExportMaps`](../../config/01-overview.md) adds them for you):

```json title="package.json"
{
  "exports": {
    "./ssr": {
      "types": "./dist/ssr/index.d.ts",
      "import": "./dist/ssr/index.js"
    },
    "./ssr-prop": {
      "types": "./dist/ssr/ssr-prop.d.ts",
      "import": "./dist/ssr/ssr-prop.js"
    }
  }
}
```

## Rendering

```ts
import { renderToString } from 'my-library/ssr';

const { html } = await renderToString(`
  <html>
    <body>
      <my-button variant="primary">Save</my-button>
    </body>
  </html>
`);
```

The module exports three rendering functions:

| Function | Returns | Use |
|---|---|---|
| `renderToString(html, options?)` | `Promise<SsrResults>` | Render an HTML string or document and serialize it. The rendered HTML is in `results.html`. |
| `streamToString(html, options?)` | `ReadableStream<string>` | The same as `renderToString`, as a stream. |
| `ssrDocument(doc, options?)` | `Promise<SsrResults>` | Render into an existing document without serializing it (`results.html` is `null`). Use this when your server already has a `Document` and serializes it itself. |

`streamToString()` emits strings. To use it as a web `Response` body, encode it first:

```ts
import { streamToString } from 'my-library/ssr';

export default {
  async fetch(request: Request) {
    const html = await loadPageTemplate(request);
    const body = streamToString(html).pipeThrough(new TextEncoderStream());
    return new Response(body, { headers: { 'content-type': 'text/html' } });
  },
};
```

The module also exports `setTagTransformer()`, for when components are registered under [transformed tag names](../../guides/distribution/tag-name-clashes/tag-transformation.md) on the client, so the server renders the same tags.

## Using It in a Server Framework

The `ssr` module renders Stencil components in any HTML string, so it works with any framework that lets you see a page's HTML on the server before it's sent. The browser then hydrates the rendered components, as long as the page also loads your components' client-side JavaScript, from [`loader-bundle`](./loader-bundle.md) or [`standalone`](./standalone.md).

Most frameworks let you run code on each response, usually as middleware or a response hook. Pass the page's HTML through `renderToString()` there:

```ts
import { renderToString } from 'my-library/ssr';

// the shape of this hook varies by framework
async function onResponse(response: Response): Promise<Response> {
  if (!response.headers.get('content-type')?.includes('text/html')) {
    return response;
  }
  const { html } = await renderToString(await response.text());
  return new Response(html, response);
}
```

`renderToString()` needs the whole document, so run it on the complete response, not on streamed chunks.

### Define the Components Before the Framework Hydrates

The framework hydrates its own markup in the browser, and the Stencil components hydrate theirs. Load your components first, and wait for them: `defineCustomElements()` is async.

```ts
import { defineCustomElements } from 'my-library/loader';

await defineCustomElements();
// then let the framework hydrate
```

A `scoped` or unencapsulated component's server-rendered light DOM holds its own nodes next to the framework's slotted content. Once the component is defined, Stencil's [light DOM patches](../../config/compat.md#lightdompatches) make `firstChild`, `childNodes`, `textContent` and the like report only the slotted content, so the framework finds the DOM it rendered. If the framework hydrates first, it finds Stencil's nodes instead, reports a hydration mismatch, and usually replaces the elements.

Some frameworks read the DOM in ways the patches can't reach. Svelte 5, for example, walks a node's children with the browser's own `firstChild` and `nextSibling`, so text it updates inside a `scoped` or unencapsulated component's slot doesn't hydrate. Use `shadow` encapsulation for components that take framework-reactive slot content.

### Next.js

React Server Components render each component separately, so there's no single page of HTML to pass through a hook. The React output target generates server versions of your wrappers instead: see [React: Server-Side Rendering](../../framework-integration/react.md#server-side-rendering).

## Writing SSR-Friendly Components

Most components render on the server without changes: Stencil's server runtime implements the DOM APIs components normally use. The points below cover what does need care, for both server-side rendering and [prerendering](../../guides/applications/prerendering/01-overview.md).

### Browser-Only Code

Code that needs a real browser, such as measuring layout or reading `localStorage`, should only run there. Check `Build.isBrowser`:

```tsx
import { Build } from '@stencil/core';

connectedCallback() {
  if (Build.isBrowser) {
    this.width = this.el.getBoundingClientRect().width;
  }
}
```

`Build.isServer` is the inverse. Both are resolved at build time: the browser build drops server-only branches, along with anything only they import, and the server build drops browser-only ones.

### Async Data

The server waits for a component's `componentWillLoad()` to finish before rendering it. Return a promise to render with fetched data:

```tsx
async componentWillLoad() {
  const response = await fetch('https://example.com/api/items');
  this.items = await response.json();
}
```

### Complex Props

HTML can only carry strings, so an object or array has two gaps to cross: into the server render, and from the server to the browser.

**Into the server render.** From a framework template, wrap the value in `ssrProp()`. Frameworks drop objects when they write HTML, or write `"[object Object]"`:

```vue
<script setup>
import { ssrProp } from 'my-library/ssr-prop';
</script>

<my-menu :items="ssrProp(items)" />
```

In the browser, `ssrProp()` returns the value. On the server, it keeps the value and returns a reference that the template renders as an attribute. The `ssr` module swaps the reference for the value while it sets the component up, so nothing is serialized: a `Map`, a `Date` or a class instance arrives as it is. Bind it under the prop's name or its dash-case (`chartData` or `chart-data`). It only works when the page is rendered in the same process, shortly after the template ran, which is the case with a [server framework hook](#using-it-in-a-server-framework).

Outside a framework template, set the property in the [`beforeSsr`](#render-options) hook:

```ts
await renderToString(html, {
  beforeSsr(doc) {
    doc.querySelector('my-menu').items = menuItems;
  },
});
```

**To the browser.** The browser has only the HTML, so the component has to carry the value in its attribute. For JSON, use [`@Prop({ serialize: 'json' })`](../../components/properties.md#serialize-as-json-serialize):

```tsx
@Prop({ serialize: 'json' }) items: MenuItem[] = [];
```

For any other format, write a [`@PropSerialize()` / `@AttrDeserialize()`](../../components/serialization-deserialization.md#practical-uses-of-propserialize) pair. Either way, the server writes the value to the attribute and the browser reads it back before the component first renders, whether the value came from `ssrProp()`, `beforeSsr`, a framework wrapper, or the component itself.

If an object prop is set from outside on the server and the component has no serializer for it, `renderToString()` adds a warning to its `diagnostics`: the browser won't get the value, so the component first renders there without it.

The [`ssr-wasm`](./ssr-wasm.md#complex-props) output target receives only HTML, so there the value must be in the attribute from the start.

### Reserved Attribute Names

Server rendering writes `s-id`, `c-id`, `s-sn` and `s-mode` attributes. A prop whose attribute has one of those names (`@Prop() sId` is `s-id`) is a build error when there's an `ssr` or `ssr-wasm` output target. Rename the prop, or give it another attribute with `@Prop({ attribute: '...' })`.

### Style Size

With Declarative Shadow DOM, each instance of a shadow DOM component carries its own copy of the component's styles. A component used many times on a page can add a lot of repeated CSS. To avoid this:

- Render frequently used components as `scoped` with [`serializeShadowRoot`](#serializeshadowroot), so their styles are sent once.
- Keep shared styles out of component stylesheets, in a [global stylesheet](../asset-outputs/global-style.md) instead.
- Theme components with [CSS custom properties](../../components/styling/styling-api.md#css-custom-properties) and [`::part()`](../../components/styling/styling-api.md#css-parts) rather than extra internal CSS.

Components with `encapsulation: { type: 'scoped' }` or `{ type: 'none' }` don't have this cost: their styles are always sent once.

## Config

### dir

*default: `dist/ssr`*

Where the module is written.

### cjs

*default: `false`*

Also write a CommonJS build, as `index.cjs`.

### external

*default: `[]`*

Module IDs to leave as imports instead of bundling into the module. `fs`, `path`, and `crypto` are always external.

### minify

*default: `false`*

Minify the module.

### empty

*default: `true`*

Empty [`dir`](#dir) before each build.

### skipInDev

*default: `true`, or `false` when the dev server runs with `--ssr`*

Skip this output during development builds.

## Render Options

Every rendering function accepts these options:

| Option | Description | Default |
|---|---|---|
| `serializeShadowRoot` | How shadow DOM components are rendered - see [below](#serializeshadowroot). | `'declarative-shadow-dom'` |
| `staticComponents` | Tags to render on the server but never hydrate on the client. Useful for components with no client-side behavior, such as a footer. | |
| `excludeComponents` | Tags to skip entirely. They're treated like any unknown element, on the server and the client. | |
| `clientSsrAnnotations` | Include the comments and attributes the client uses to hydrate the rendered markup. | `true` |
| `url` | Sets `location.href`. | |
| `title` | Sets `document.title`. | |
| `language` | Sets the `lang` attribute on `<html>`. | |
| `direction` | Sets the `dir` attribute on `<html>`. | |
| `canonicalUrl` | Sets the `href` of the `<link rel="canonical">` tag. | |
| `cookie` | Sets `document.cookie`. | |
| `referrer` | Sets `document.referrer`. | |
| `userAgent` | Sets `navigator.userAgent`. | |
| `resourcesUrl` | The base URL components use to resolve [assets](../../guides/distribution/assets.md). | `'./'` |
| `removeScripts` | Remove every `<script>` from the document. | `false` |
| `removeUnusedStyles` | Remove CSS not used by any element in the document. | `true` |
| `maxHydrateCount` | The most components rendered on one page. | `300` |
| `timeout` | Milliseconds to wait for rendering to finish before failing. | `15000` |
| `buildId` | Added as `<html data-stencil-build="...">`. | random |
| `runtimeLogging` | Print component console output to the server's console. | `false` |
| `reuseWindow` | Render into one long-lived window instead of creating one for every call. Faster - see [below](#reusewindow). | `false` |

`renderToString()` and `streamToString()` also accept options for the serialized HTML:

| Option | Description | Default |
|---|---|---|
| `fullDocument` | Serialize a complete document. Set to `false` to return only the rendered components, preceded by the `<style>` elements their scoped styles need. | `true` |
| `beforeSsr(document)` | Runs before rendering. Use it to set properties that can't be expressed as attributes. | |
| `afterSsr(document)` | Runs after rendering, before serialization. Setting component props here doesn't change the output: the components have rendered already. | |
| `prettyHtml` | Indent the output. | `false` |
| `approximateLineWidth` | Wrap lines at about this width, where the HTML allows it. | no wrapping |
| `removeHtmlComments` | Remove comments. Stencil's own hydration comments are kept. | `false` |
| `removeAttributeQuotes` | Remove quotes from attribute values where possible. | `false` |
| `removeBooleanAttributeQuotes` | Write boolean attributes as `hidden` instead of `hidden=""`. | `false` |
| `removeEmptyAttributes` | Remove empty `class`, `dir`, `id`, `lang`, `name`, and `title` attributes. | `true` |

`beforeSsr` is one way to pass complex data to a component on the server; see [Complex Props](#complex-props):

```ts
await renderToString(html, {
  beforeSsr(doc) {
    doc.querySelector('my-chart').data = new Map(/* ... */);
  },
});
```

### serializeShadowRoot

Controls how `encapsulation: { type: 'shadow' }` components are rendered:

- `'declarative-shadow-dom'` - inside a `<template shadowrootmode="open">`, including the component's styles.
- `'scoped'` - as light DOM with [scoped](../../components/styling/01-overview.md#scoped) styles, written once to the document `<head>`. The client converts it to a real shadow root during hydration.
- An object, to choose per component:
  ```ts
  serializeShadowRoot: {
    scoped: ['my-button'],
    default: 'declarative-shadow-dom',
  }
  ```
- `false` - don't render shadow DOM components on the server.

Declarative Shadow DOM repeats a component's styles in every instance. For a component used many times on a page, `'scoped'` sends its styles once.

### reuseWindow

Every render normally gets a new mock window, and sets up Stencil's server runtime and all your components in it. That setup is most of the cost of rendering a small fragment, and a good part of a whole page. With `reuseWindow: true`, renders share one long-lived window instead. It's reset between renders and keeps the runtime it already set up.

```ts
const { html } = await renderToString('<my-card heading="Hi"></my-card>', {
  fullDocument: false,
  reuseWindow: true,
});
```

- It applies when the input is an HTML string. A `Document` passed to `ssrDocument()` is rendered as it is.
- Each distinct [`serializeShadowRoot`](#serializeshadowroot) value gets its own window.
- Renders that share a window run one at a time. Calls you make concurrently wait for each other, so for parallel rendering, use several worker threads or processes.
- [`setTagTransformer()`](#rendering) discards the reused windows, so later renders pick up the new tag names.

Output is the same as without `reuseWindow`. It's worth turning on whenever you render many fragments or pages in one process, such as one call per component from a template helper.

## Results

`renderToString()` and `ssrDocument()` resolve to an object that includes:

| Property | Contents |
|---|---|
| `html` | The rendered HTML (`null` from `ssrDocument()`) |
| `diagnostics` | Errors and warnings from rendering |
| `components` | Every component rendered |
| `hydratedCount` | How many components were rendered |
| `title` | The document's title |
| `httpStatus` | `200`, or the value of a `<meta http-equiv="status">` tag if the page has one - for example, set by a not-found component |
| `anchors`, `imgs`, `scripts`, `styles` | Elements found in the rendered document |
