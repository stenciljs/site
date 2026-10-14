---
title: Content Security Policy Nonces
description: How to leverage CSP nonces in Stencil projects.
slug: /csp-nonce
---

# Using Content Security Policy Nonces in Stencil

A [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) helps protect an application from Cross-Site Scripting (XSS) attacks by restricting which scripts and styles the browser will run.

Stencil adds some of your components' styles to the page in `<style>` elements. A policy whose `style-src` doesn't allow `'unsafe-inline'` blocks those elements, and the browser's console reports that an inline style violates the policy. This affects:

- components that use [`scoped` encapsulation, or none](../../components/styling.md)
- the style the [lazy loader](../../output-targets/main/loader-bundle.md) adds to hide components until they've loaded
- styles in [server-rendered](../../output-targets/main/ssr/01-overview.md) HTML

Shadow DOM components rendered in the browser aren't affected, because their styles are applied as [constructable stylesheets](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/CSSStyleSheet).

To let these styles through, Stencil can add a [nonce](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce) to every `<style>` element it creates.

## Generating a Nonce

Generating the nonce and sending the policy are your server's job. For each page view, the server creates a new nonce, includes it in the `Content-Security-Policy` header, and passes it to Stencil in one of the ways below:

```
Content-Security-Policy: style-src 'self' 'nonce-r4nd0m'
```

Per the [MDN guide on nonces](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce#generating_values), a nonce should be "a random base64-encoded string of at least 128 bits of data from a cryptographically secure random number generator".

## Passing the Nonce to Stencil

### With a Meta Tag

Add a `meta` element to the document's head on each page request:

```html
<meta name="csp-nonce" content="r4nd0m" />
```

Stencil reads it when it creates a `<style>` element. This works for every output target, and needs no JavaScript from the application.

This isn't a security risk because, for an attacker to run a script that reads the nonce from the meta tag, they would have needed to know the nonce _ahead_ of the script's execution.

### With `setNonce()`

Applications that register your components from JavaScript can call `setNonce()` instead. Call it before the components are defined.

With the [`loader-bundle`](../../output-targets/main/loader-bundle.md) output, it's exported from the loader:

```ts
import { defineCustomElements, setNonce } from 'my-lib/dist/loader-bundle/loader';

setNonce('r4nd0m');
defineCustomElements();
```

With the [`standalone`](../../output-targets/main/standalone.md) output, it's exported from the output's index file:

```ts
import { setNonce } from 'my-lib/dist/standalone';
import { defineCustomElement } from 'my-lib/dist/standalone/my-component';

setNonce('r4nd0m');
defineCustomElement();
```

If your library sets [`generateExportMaps`](../../config/01-overview.md#generateexportmaps), these imports are `my-lib/loader` and `my-lib/standalone`.

## Server-Side Rendering

Server-rendered HTML contains `<style>` elements for the components on the page, and these need the nonce as well. Include the meta tag in the document you pass to [`renderToString()`](../../output-targets/main/ssr/01-overview.md), and Stencil adds the nonce to them:

```ts
import { renderToString } from 'my-lib/dist/ssr';

const { html } = await renderToString(`
  <html>
    <head>
      <meta name="csp-nonce" content="${nonce}" />
    </head>
    <body>
      <my-component></my-component>
    </body>
  </html>
`);
```

The meta tag is part of the rendered HTML, so the components pick up the same nonce when they load in the browser.

## Static Site Generation

Stencil can't add nonces to [prerendered](../applications/prerendering/01-overview.md) pages. A nonce has to be different for each page view, and a prerendered page is generated once, at build time. To use nonces with prerendered pages, your server has to add the `nonce` attribute to each `<style>` element in the page as it serves it.
