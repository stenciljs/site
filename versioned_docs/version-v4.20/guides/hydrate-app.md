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
import { hydrateDocument, renderToString, streamToString } from 'yourpackage/hydrate';
```

The hydrate app module exports 3 functions, `hydrateDocument`, `renderToString` and `streamToString`. `hydrateDocument` takes a [document](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDocument) as its input while `renderToString` as well as `streamToString` takes a raw HTML string. While `hydrateDocument` and `renderToString` return a Promise which wraps a result object, `streamToString` returns a [`Readable`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) stream that can be passed into a server response.

### hydrateDocument

You can use `hydrateDocument` as a part of your server's response logic before
serving the web page. `hydrateDocument` takes two arguments, a
[document](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDocument) and a
config object. The function returns a promise with the hydrated results, with
the hydrated HTML under the `html` property.

*Example taken from Ionic Angular server*

 ```javascript
import { hydrateDocument } from 'yourpackage/hydrate';

export function hydrateComponents(doc) {
  return hydrateDocument(doc)
    .then((hydrateResults) => {
      // execute logic based on results
      console.log(hydrateResults.html);
      return hydrateResults;
    });
}
```

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
    serializeShadowRoot: true,
    prettyHtml: true,
  }
);

console.log(results.html);
/**
 * outputs:
 * ```html
 * <my-component class="hydrated sc-my-component-h" first="Stencil" last="'Don't call me a framework' JS" s-id="1">
 *   <template shadowrootmode="open">
 *     <style sty-id="sc-my-component">
 *       .sc-my-component-h{display:block}
 *     </style>
 *     <div c-id="1.0.0.0" class="sc-my-component">
 *       <!--t.1.1.1.0-->
 *       Hello, World! I'm Stencil 'Don't call me a framework' JS\n" +
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

Allows to modify the document and all its containing components to be modified before the hydration process starts. This allows e.g. to assign properties to the components dynamically:

```ts
await renderToString(response.body, {
    beforeHydrate: (doc: Document) => {
      doc.querySelector(`my-component`).someComplexThing = new Map(...)
   },
})
```

##### `afterHydrate`

__Type:__ `(document: Document, url: URL, results: PrerenderUrlResults) => <void> | Promise<void>`

Allows to modify the document and all its containing components after the component was rendered in the virtual DOM and before the serialization process starts.

##### `serializeShadowRoot`

__Default:__ `true`

__Type:__ `boolean`

If set to `true` Stencil will render a component defined with a `shadow: true` flag into a [Declarative Shadow DOM](https://developer.chrome.com/docs/css-ui/declarative-shadow-dom), e.g.:

```javascript
const results = await hydrate.renderToString(
  `<my-component first="Stencil" last="'Don't call me a framework' JS"></my-component>`,
  {
    fullDocument: false,
    serializeShadowRoot: true,
    prettyHtml: true,
  }
);

console.log(results.html);
/**
 * outputs:
 * ```html
 * <my-component class="hydrated sc-my-component-h" first="Stencil" last="'Don't call me a framework' JS" s-id="1">
 *   <template shadowrootmode="open">
 *     <style sty-id="sc-my-component">
 *       .sc-my-component-h{display:block}
 *     </style>
 *     <div c-id="1.0.0.0" class="sc-my-component">
 *       <!--t.1.1.1.0-->
 *       Hello, World! I'm Stencil 'Don't call me a framework' JS
 *     </div>
 *   </template>
 *   <!--r.1-->
 * </my-component>
 * ```
 */
```

When set to `false`, the component renders with its light DOM but delays hydration until runtime.

```javascript
const results = await hydrate.renderToString(
  `<my-component first="Stencil" last="'Don't call me a framework' JS">👋</my-component>`,
  {
    fullDocument: false,
    serializeShadowRoot: false,
    prettyHtml: true,
  }
);

console.log(results.html);
/**
 * outputs:
 * ```html
 * <my-component class="hydrated" first=Stencil last="'Don't call me a framework' JS" s-id=1>👋</my-component>
 * ```
 */
```

##### `fullDocument`

__Type:__ `boolean`

__Default:__ `true`

If set to `true`, Stencil will serialize a complete HTML document for a server to respond. If set to `false` it will only render the components within the given template.
