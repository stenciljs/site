---
title: Tag Transformation 
sidebar_label: Tag Transformation
description: Tag Transformation
slug: /tag-transformation
---

# Tag Transformation

## Background

Web components use a global registry to define and look-up custom elements (accessible via `window.customElements`). 
If an application tries to define 2 custom elements with the same tag name (e.g. `customElements.define('my-component', MyComponent)` x2) 
an error will be thrown and the application will fail.

It's quite common for multiple versions of a component library to be loaded into an application. For example:

- Application root loads version `v1.0.0` of `@component/library` which defines `<my-button>`
- `/admin` loads version `v2.0.0` of `@component/library` which also defines `<my-button>` with breaking changes

In this scenario the second version of the library will fail to load and throw an error, crashing the application.

[Scoped custom element registries](https://wicg.github.io/webcomponents/proposals/Scoped-Custom-Element-Registries.html) 
are a proposed web standard that would allow multiple versions of the same 
component library to be loaded into an application without conflicts. 
However at the time of writing [vendor adoption is limited](https://caniuse.com/wf-scoped-custom-element-registries).

Until scoped custom element registries are more widely supported, Stencil provides runtime tag transformation utilities for use when authoring and consuming web components.

## `setTagTransformer` and `transformTag`

As of Stencil v4.39, Stencil makes available two utilities to help manage dynamic tag names:

1) `setTagTransformer` allows application developers (your component library consumers) to assign a tag transformer function.
2) `transformTag` is mainly used *within* your component libraries - transforming any static string tag names using the tag transformer function assigned via `setTagTransformer` (Alternatively, you can auto apply `transformTag` to all tag names via the [`extras.additionalTagTransformers` config option](#extrasadditionaltagtransformers).)


### Using `setTagTransformer`

Stencil exports `setTagTransformer` which you can optionally make available to application developers:

1) Make `setTagTransformer` available by exporting it from your component library's main entry point (e.g. `src/index.ts`):

```ts
// Within your lib's `src/index.ts` expose `setTagTransformer`
export { setTagTransformer } from '@stencil/core';
```

2) Application developers can then import and use `setTagTransformer` (*before component definition*)

#### Usage via the `dist` output

```html
<!-- Setup a tag transformer -->
<script type="module">
  import { setTagTransformer } from 'https://cdn.jsdelivr.net/npm/@component/library/dist/index.esm.js';
    
  setTagTransformer((tag) => {
    if (tag.startsWith('my-')) {
      return tag.replace('my-', 'your-');
    }
    return tag;
  });
</script>

<!-- Use the lazy loader as normal -->
 
<script type="module" src="https://cdn.jsdelivr.net/npm/@component/library/dist/my-app.esm.js"></script>

<body>
  <your-button></your-button> 
  <!-- ^^^ note the transformed tag name -->
</body>
```

#### Usage via a the `dist-custom-elements` output

```js
import { setTagTransformer } from '@component/library';
import { defineCustomElement } from '@component/library/my-component.js';

// setup a tag transformer

setTagTransformer((tag) => {
  if (tag.startsWith('my-')) {
    return tag.replace('my-', 'your-');
  }
  return tag;
})

// define components as normal

defineCustomElement();
```

#### Usage via `dist-hydrate-script` output (on a Node.js server)

```js
import { renderToString } from '@component/library/v1/hydrate/index.mjs';
import { setTagTransformer, renderToString as renderToStringV2 } from '@component/library/v2/hydrate/index.mjs';

// setup a tag transformer

setTagTransformer((tag) => {
  if (tag.startsWith('my-')) {
    return tag.replace('my-', 'your-');
  }
  return tag;
})

/** 
 * // handle incoming / outgoing html e.g.
 * const incomingHtmlString = `
 * <html>
 *  </body>
 *    <my-button></my-button> <!-- from v1.0.0 -->
 *    <your-button></your-button> <!-- from v2.0.0 -->
 *  </body>
 * </html>
 * `;
 */
return await renderToStringV2(
  (await renderToString(incomingHtmlString)).html
).html;
```

### Using `transformTag`

If you make `setTagTransformer` available, 
Stencil also exports `transformTag` which you can use within your component code; 
transforming static tag names via any assigned tag transformer function.

```tsx
import { h, Component, Element, transformTag } from '@stencil/core';

@Component({
  tag: 'my-component',
  shadow: true,
})
export class MyComponent {
  @Element() host: HTMLElement;

  connectedCallback() {
    const ele = this.host.querySelector(transformTag('my-other-element'));
    const anotherEle = document.createElement(transformTag('my-another-element'));
    ...
  }

  render() {
    return (
      <div>
        <my-button>Click here</my-button>  
        {/* ^^ jsx tags are automatically transformed */}
      </div>
    );
  }
}
```

#### Notes on CSS

Unless using `extras.additionalTagTransformers`, 
you need to be thoughtful when writing CSS selectors within a component library that exposes `setTagTransformer`. 

For example, if `my-button` is transformed to `your-button` this won't work:

```css
:host {
  display: block;

  my-button {
    color: red;
  }
}
```

Instead, structure your components to use other selectors:

```tsx
import { h, Component, Host } from '@stencil/core';

@Component({
  tag: 'my-button',
  shadow: true,
})
export class MyComponent {
  @Element() host: HTMLElement;

  render() {
    return (
      <Host class="my-button">...</Host>
    );
  }
}
```

```css
:host {
  display: block;

  .my-button {
    color: red;
  }
}
```

## `extras.additionalTagTransformers`

Setting the experimental `extras.additionalTagTransformers` configuration option to `true` (or `prod` to only apply to production builds) 
will auto-wrap `transformTag(...)` to most static tag names within your component library (including CSS selectors!).

Examples of auto-transformations include:

```js
document.createElement('my-element');
// becomes
document.createElement(transformTag('my-element'));

document.querySelectorAll('my-element');
// becomes
document.querySelectorAll(transformTag('my-element'));

document.createElement('my-element');
// becomes
document.createElement(transformTag('my-element'));
```

Incoming CSS like:

```css
:host my-element {}

my-element::before {}

my-element.active:hover {}
```

Is transformed for use at runtime to:

```ts
`:host ${transformTag('my-element')} {}

${transformTag('my-element')}::before {}

${transformTag('my-element')}.active:hover {}
```