---
title: Authoring Components for SSR
sidebar_label: Authoring for SSR
description: Writing Stencil components that render correctly on the server
slug: /ssr-authoring
sidebar_position: 3
---

# Authoring Components for SSR

Most components render on the server without changes: Stencil's server runtime implements the DOM APIs components normally use. The points below cover what does need care, for both [server-side rendering](./01-overview.md) and [prerendering](../../../guides/applications/prerendering/01-overview.md).

## Browser-Only Code

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

## Async Data

The server waits for a component's `componentWillLoad()` to finish before rendering it. Return a promise to render with fetched data:

```tsx
async componentWillLoad() {
  const response = await fetch('https://example.com/api/items');
  this.items = await response.json();
}
```

## Complex Props

Server-rendered HTML can only pass props as attributes, which are strings. To give a component an object, array, or other complex value on the server, set it as a property in the [`beforeSsr`](./01-overview.md#render-options) hook:

```ts
await renderToString(html, {
  beforeSsr(doc) {
    doc.querySelector('my-menu').items = menuItems;
  },
});
```

The browser doesn't receive a value set this way. For the component to keep it after hydration, serialize it to an attribute with [`@PropSerialize()`](../../../components/serialization-deserialization.md#practical-uses-of-propserialize).

## Style Size

With Declarative Shadow DOM, each instance of a shadow DOM component carries its own copy of the component's styles. A component used many times on a page can add a lot of repeated CSS. To avoid this:

- Render frequently used components as `scoped` with [`serializeShadowRoot`](./01-overview.md#serializeshadowroot), so their styles are sent once.
- Keep shared styles out of component stylesheets, in a [global stylesheet](../../asset-outputs/global-style.md) instead.
- Theme components with [CSS custom properties](../../../components/styling.md#css-custom-properties) and [`::part()`](../../../components/styling.md#css-parts) rather than extra internal CSS.

Components with `encapsulation: { type: 'scoped' }` or `{ type: 'none' }` don't have this cost: their styles are always sent once.
