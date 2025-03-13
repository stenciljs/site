---
title: Hydrate App
sidebar_label: Hydrate App
description: Hydrate App
slug: /hydrate-app
---

# Hydrate App

The hydrate app is a Stencil output target which generates a module that can be
used on a NodeJS server to hydrate HTML and implement server side rendering (SSR).
This functionality is used internally by the Stencil compiler for
prerendering, as well as for the Angular Universal SSR for the Ionic
framework. However, like Stencil components, the hydrate app itself is not
restricted to one framework.

_Note that Stencil does **NOT** use Puppeteer for SSR or prerendering._

## How to Use the Hydrate App

Server side rendering (SSR) can be accomplished in a similar way to
prerendering. Instead of using the `--prerender` CLI flag, you can an output
target of type `'dist-hydrate-script'` to your `stencil.config.ts`, like so:

```ts
outputTargets: [
  {
    type: 'dist-hydrate-script',
  },
];
```

This will generate a `hydrate` app in your root project directory that can be
imported and used by your Node server.

After publishing your component library, you can import the hydrate app into
your server's code like this:

```javascript
import { createWindowFromHtml, hydrateDocument, renderToString, streamToString } from 'yourpackage/hydrate';
```

The hydrate app module exports 3 functions, `hydrateDocument`, `renderToString` and `streamToString`. `hydrateDocument` takes a [document](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDocument) as its input while `renderToString` as well as `streamToString` takes a raw HTML string. While `hydrateDocument` and `renderToString` return a Promise which wraps a result object, `streamToString` returns a [`Readable`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) stream that can be passed into a server response.

### hydrateDocument

You can use `hydrateDocument` as a part of your server's response logic before serving the web page. `hydrateDocument` takes two arguments, a [document](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDocument) and a config object. The function returns a promise with the hydrated results, with the hydrated HTML under the `html` property.

*Example taken from Ionic Angular server*

 ```ts
import { hydrateDocument, createWindowFromHtml } from 'yourpackage/hydrate';

export function hydrateComponents(template: string) {
  const win = createWindowFromHtml(template, Math.random().toString())

  return hydrateDocument(win.document)
    .then((hydrateResults) => {
      // execute logic based on results
      console.log(hydrateResults.html);
      return hydrateResults;
    });
}
```

You can call the `hydrateComponents` function from your Node.js server, e.g.:

```ts
import Koa from 'koa';

const app = new Koa();
app.use(async (ctx) => {
  const res = await hydrateComponents(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <link rel="preconnect" href="https://some-url.com" />
    <style>
      // custom styles here
    </style>
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>`)
  ctx.body = res
})
```

Please note that Stencil injects scoped component styles immediately after `<link />` tags with a `rel="preconnect"` attribute, but before your custom styles. This setup allows you to define custom styles for your components effectively.

#### hydrateDocument Options

  - `canonicalUrl` - string
  - `constrainTimeouts` - boolean
  - `clientHydrateAnnotations` - boolean
  - `cookie` - string
  - `direction` - string
  - `language` - string
  - `maxHydrateCount` - number
  - `referrer` - string
  - `removeScripts` - boolean
  - `removeUnusedStyles` - boolean
  - `resourcesUrl` - string
  - `timeout` - number
  - `title` - string
  - `url` - string
  - `userAgent` - string

### renderToString

The hydrate app also has a `renderToString` function that takes an HTML string
and returns a promise of `HydrateResults`. The optional second parameter is a
config object that can alter the output of the markup. Like `hydrateDocument`,
the hydrated HTML can be found under the `html` property.

*Example taken from Ionic Core*

```javascript
const results = await hydrate.renderToString(
  `<my-component first="Stencil" last="'Don't call me a framework' JS"></my-component>`,
  {
    fullDocument: false,
    serializeShadowRoot: 'declarative-shadow-dom',
    prettyHtml: true,
  }
);

console.log(results.html);
/**
 * outputs:
 * ```html
 * <my-component class="hydrated" first="Stencil" last="'Don't call me a framework' JS" s-id="1">
 *   <template shadowrootmode="open">
 *     <style> :host { display: block; } </style>
 *     <div c-id="1.0.0.0">
 *       <!--t.1.1.1.0-->
 *       Hello, World! I'm Stencil 'Don't call me a framework' JS
 *     </div>
 *   </template>
 *   <!--r.1-->
 * </my-component>
 * ```
 */
```

#### renderToString Options

##### `approximateLineWidth`

__Type:__ `number`

Determines when line breaks are being set when serializing the component.

##### `prettyHtml`

__Default:__ `false`

__Type:__ `boolean`

If set to `true` it prettifies the serialized HTML code, intends elements and escapes text nodes.

##### `removeAttributeQuotes`

__Type:__ `boolean`

__Default:__ `false`

If set to `true` it removes attribute quotes when possible, e.g. replaces `someAttribute="foo"` to `someAttribute=foo`.

##### `removeEmptyAttributes`

__Type:__ `boolean`

__Default:__ `true`

If set to `true` it removes attribute that don't have values, e.g. remove `class=""`.

##### `removeHtmlComments`

__Type:__ `boolean`

__Default:__ `false`

If set to `true` it removes any abundant HTML comments. Stencil still requires to insert hydration comments to be able to reconcile the component.

##### `beforeHydrate`

__Type:__ `(document: Document, url: URL) => <void> | Promise<void>`

Allows to modify the document and all its containing components to be modified before the hydration process starts.

##### `afterHydrate`

__Type:__ `(document: Document, url: URL, results: PrerenderUrlResults) => <void> | Promise<void>`

Allows to modify the document and all its containing components after the component was rendered in the virtual DOM and before the serialization process starts.

##### `serializeShadowRoot`

__Default:__ `'declarative-shadow-dom'`

__Type:__ 

```ts
'declarative-shadow-dom' | 'scoped' | {
  'declarative-shadow-dom'?: string[];
  scoped?: string[];
  default: 'declarative-shadow-dom' | 'scoped';
} | false;
```

Configure how Stencil serializes a component's shadow-root:
- `declarative-shadow-dom` - all `shadow: true` components will be rendered with a [Declarative Shadow DOM](https://developer.chrome.com/docs/css-ui/declarative-shadow-dom).
- `scoped` - all `shadow: true` components will be rendered with Stencil's custom scoped behavior; a light-dom tree and single `<style />` during SSR which is converted into a shadow-root during client-side hydration.
- Alternatively you can mix `scoped` and `declarative-shadow-dom` behavior, for example:
  * `{ 'declarative-shadow-dom': ['tag-1'], default: 'scoped'; }` will render component `tag-1` with DSD, but all others with Stencil's scoped behavior.
  * `{ 'scoped': ['tag-1'], default: 'declarative-shadow-dom'; }` will render component tag `tag-1` with Stencil's scoped behavior, but all others with DSD.
- `false`, will not render any `shadow: true` component on the server; delaying hydration until runtime.


**Declarative Shadow DOM Example:**

```javascript
const results = await hydrate.renderToString(
  `<my-component first="Stencil" last="'Don't call me a framework' JS"></my-component>`,
  {
    fullDocument: false,
    serializeShadowRoot: 'declarative-shadow-dom',
    prettyHtml: true,
  }
);

console.log(results.html);
/**
 * outputs:
 * ```html
 * <my-component class="hydrated" first="Stencil" last="'Don't call me a framework' JS" s-id="1">
 *   <template shadowrootmode="open">
 *     <style> :host { display: block; } </style>
 *     <div c-id="1.0.0.0">
 *       <!--t.1.1.1.0-->
 *       Hello, World! I'm Stencil 'Don't call me a framework' JS
 *     </div>
 *   </template>
 *   <!--r.1-->
 * </my-component>
 * ```
 */
```

**Scoped Example:**

```javascript
const results = await hydrate.renderToString(
  `<my-component first="Stencil" last="'Don't call me a framework' JS"></my-component>`,
  {
    fullDocument: true,
    serializeShadowRoot: `scoped`,
    prettyHtml: true,
  }
);

console.log(results.html);
/**
 * outputs:
 * ```html
 * <head>
 *   <style sty-id="sc-my-component"> .sc-my-component-h { display: block; } </style>
 * </head>
 * <body>
 *   <my-component class="hydrated sc-my-component-h" first="Stencil" last="'Don't call me a framework' JS" s-id="1">
 *     <!--r.1-->
 *     <div c-id="1.0.0.0" class="sc-my-component">
 *       <!--t.1.1.1.0-->
 *       Hello, World! I'm Stencil 'Don't call me a framework' JS
 *     </div>
 *   </my-component>
 * </body>
 * ```
 */
```

##### `fullDocument`

__Type:__ `boolean`

__Default:__ `true`

If set to `true`, Stencil will serialize a complete HTML document for a server to respond. If set to `false` it will only render the components within the given template.
