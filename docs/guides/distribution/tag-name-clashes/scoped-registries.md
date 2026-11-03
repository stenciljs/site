---
title: Scoped Custom Element Registries
sidebar_label: Scoped Registries
description: Define a library's components in their own registry, so two versions can share a page under the same tag names
slug: /scoped-registries
sidebar_position: 3
---

# Scoped Custom Element Registries

A [scoped custom element registry](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry) is a registry the application creates itself. Components defined in it keep their tag names, but only exist in the parts of the page that use that registry, such as a shadow root. Two versions of a library can then each define `<my-button>`, in registries of their own.

See [Avoiding Tag Name Clashes](./01-overview.md) for how scoped registries compare with tag transformation.

## Using a Registry

Create a registry, give it to Stencil before the components are defined, then attach it to a shadow root:

```js
import { defineCustomElements, setRegistry } from 'my-library/dist/loader-bundle/loader';

const registry = new CustomElementRegistry();
setRegistry(registry);
await defineCustomElements();

const root = document.querySelector('#admin').attachShadow({
  mode: 'open',
  customElementRegistry: registry,
});
root.innerHTML = '<my-panel></my-panel>';
```

The library's components are now defined in `registry` only. A `<my-panel>` elsewhere in the document isn't upgraded by this library, which leaves the name free for another version.

With the [`standalone`](../../../output-targets/main/standalone.md) output, either import `setRegistry` from the output's `index.js` before defining components, or pass the registry to each component's `defineCustomElement()`:

```js
import { defineCustomElement } from 'my-library/dist/standalone/my-panel.js';

defineCustomElement({ registry });
```

`setRegistry` is exported from the same files as [`setTagTransformer`](./tag-transformation.md#settagtransformer-and-transformtag).

## Nested Components

Components that the library's components render are handled for you. `defineCustomElement()` also defines a component's children in the same registry, and Stencil creates them from that registry. Shadow DOM components attach their own shadow root with the registry, so the components they render resolve from it too.

## Browser Support

Chromium-based browsers and Safari support scoped registries; Firefox doesn't yet. See [Can I use](https://caniuse.com/wf-scoped-custom-element-registries) for current versions.

The [`@webcomponents/scoped-custom-element-registry`](https://www.npmjs.com/package/@webcomponents/scoped-custom-element-registry) polyfill (0.0.10) implements an older version of the API, which uses `attachShadow({ customElements })`. With it, the components in a scoped root upgrade, but the components they render don't. Where you need to support browsers without scoped registries, use [tag transformation](./tag-transformation.md).
