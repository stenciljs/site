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
└── index.d.ts
```

Expose the module to consumers through your package's `exports`:

```json title="package.json"
{
  "exports": {
    "./ssr": {
      "types": "./dist/ssr/index.d.ts",
      "import": "./dist/ssr/index.js"
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

Server-rendered HTML can only pass props as attributes, which are strings. To give a component an object, array, or other complex value on the server, set it as a property in the [`beforeSsr`](#render-options) hook:

```ts
await renderToString(html, {
  beforeSsr(doc) {
    doc.querySelector('my-menu').items = menuItems;
  },
});
```

The browser doesn't receive a value set this way. For the component to keep it after hydration, serialize it to an attribute with [`@PropSerialize()`](../../components/serialization-deserialization.md#practical-uses-of-propserialize).

Alternatively, write the value into the HTML as a JSON attribute, and have the component convert it with [`@AttrDeserialize()`](../../components/serialization-deserialization.md#the-attrdeserialize-decorator-attrdeserialize). The server and the browser then both read it from the attribute. The [`ssr-wasm`](./ssr-wasm.md#complex-props) output target supports only this approach.

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

`renderToString()` and `streamToString()` also accept options for the serialized HTML:

| Option | Description | Default |
|---|---|---|
| `fullDocument` | Serialize a complete document. Set to `false` to return only the rendered components, preceded by the `<style>` elements their scoped styles need. | `true` |
| `beforeSsr(document)` | Runs before rendering. Use it to set properties that can't be expressed as attributes. | |
| `afterSsr(document)` | Runs after rendering, before serialization. | |
| `prettyHtml` | Indent the output. | `false` |
| `approximateLineWidth` | Wrap lines at about this width, where the HTML allows it. | no wrapping |
| `removeHtmlComments` | Remove comments. Stencil's own hydration comments are kept. | `false` |
| `removeAttributeQuotes` | Remove quotes from attribute values where possible. | `false` |
| `removeBooleanAttributeQuotes` | Write boolean attributes as `hidden` instead of `hidden=""`. | `false` |
| `removeEmptyAttributes` | Remove empty `class`, `dir`, `id`, `lang`, `name`, and `title` attributes. | `true` |

`beforeSsr` is the way to pass complex data to a component on the server:

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
