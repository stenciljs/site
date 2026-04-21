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

## Framework integrations

The tag transformation also works for the Stencil framework integrations but requires a bit of extra setup that is framework specific.

### React

Adding `transformTag: true` to the output:

```ts
reactOutputTarget({
    ...
    transformTag: true,
}),
```

Will cause `setTagTransformer` and `tagTransformer` to be automatically exported from your React lib. It generates a new file called `tag-transformer.ts`. This file depends on the `setTagTransformer` exported from the index file in your main web components package. So make sure you export that as described in the sections above. To export the tag-transformer to your consumers you need to add an export in the package.json of your React package.

```json
 "exports": {
    ...
    "./tag-transformer": {
      "types": "./dist/tag-transformer.d.ts",
      "import": "./dist/tag-transformer.js"
    }
  },
```

Application users can then import the tag transformer and set their own custom tag.

It's important to bear in mind, that if any of the React application's initializing modules import any components from your React wrapper library (`import { MyButton } from 'component-library-react'`), they will immediately define before the transformer is registered and so not be applied. So it is very important that `setTagTransformer` is called before any components are imported.

One approach to solve this is that the React app creates a file that includes a side effect call to `setTagTransformer` that is then imported before the root `App.tsx`. An example setup:

```jsx
//initTagTransformer.ts

import { setTagTransformer } from "component-library-react/tag-transformer";

setTagTransformer((tag) => {
  if (tag.startsWith("my-component-lib-")) {
    return tag.replace("my-component-lib-", "my-component-lib-v2-");
  }

  return tag;
});
```

```tsx
//main.tsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./initTagTransformer.ts"; // This has to come before the import of App.tsx
import App from "./App.tsx";

const rootElement = document.getElementById("root");

const queryClient = new QueryClient();

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

```jsx
// App.tsx
import { MyComponentLibButton } from "component-library-react";

function App() {
  const [count, setCount] = useState(0);

  const handleIncreaseCount = () => setCount(count + 1);

  return (
    <div>
      <h1>My React app</h1>
      {/* Should render my-component-lib-v2-button in the DOM */}
      <MyComponentLibButton onClick={handleIncreaseCount}>Increase count</MyComponentLibButton>
    </div>
  );
}

export default App;
```

**Note** some linters re-organize imports as they see fit which might cause `import "./initTagTransformer.ts";` to be placed after `import App from "./App.tsx";`. Though most linters do not move side effect imports, so hopefully this shouldn't be an issue. But something to keep in mind if you notice that the tag transformation doesn't work like it should.

### Vue

Adding `transformTag: true` to the output:

```ts
vueOutputTarget({
    ...
    transformTag: true,
}),
```

Will cause `setTagTransformer` and `tagTransformer` to be automatically exported from your Vue lib. It generates a new file called `tag-transformer.ts`. This file depends on the `setTagTransformer` exported from the index file in your main web components package. So make sure you export that as described in the sections above. To export the tag-transformer to your consumers you need to add an export in the package.json of your Vue package.

```json
 "exports": {
    ...
    "./tag-transformer": {
      "types": "./dist/tag-transformer.d.ts",
      "import": "./dist/tag-transformer.js"
    }
  },
```

Application users can then import add a transformer. e.g.

```ts
// main.ts
import { setTagTransformer } from 'component-library-vue/tag-transformer'

setTagTransformer((tag: string) => tag.startsWith('my-transform-') ? `v1-${tag}` : tag)

const app = createApp(App)
```

It's important to bear in mind, that if any of the Vue application's initializing modules import any components from your vue wrapper library (`import { MyButton } from 'component-library-vue'`), they will immediately define before the transformer is registered and so not be applied.


### Angular

Adding `transformTag: true` to the output:

```ts
angularOutputTarget({
    ...
    transformTag: true,
}),
```

Will cause `setTagTransformer` and `tagTransformer` to be automatically exported from your Angular lib. It generates a new file called `tag-transformer.ts`. This file depends on the `setTagTransformer` exported from the index file in your main web components package. So make sure you export that as described in the sections above.

Because Angular has no hooks for template compilation (e.g. in an Angular template, <my-button>, cannot be intercepted and re-written at runtime to be <my-button-v1>) the output to produces a build-time script which consumers can use as a postinstall script for example. Make sure to make it available via:

```json
"bin": {
    "patch-transform-selectors": "./scripts/patch-transform-selectors.mjs"
  },
```

in your Angular wrapper package.json.

Applications consumers set a tag-transformer by adding a `tag-transformer.config.mjs` to the root of their project:
```ts
export default (tag) => {
  return tag.replace('my-button', 'my-button-v1');
}
```

The transformer will then be applied at buildtime to Angular selectors and at runtime.
