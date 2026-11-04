---
title: Your First Component
sidebar_label: Your First Component
description: Generate a component, preview it in the dev server, and give it a prop
slug: /your-first-component
---

# Your First Component

In this walkthrough you'll generate a component, preview it in the dev server, and give it a prop. Run the commands from the project you created in [Installation](./02-installation.md).

## Generate the Component

Stencil's generator creates the files for a new component. Give it the component's tag name:

```bash
npx stencil generate my-greeting
```

It asks a few questions. Choose **Component**, **CSS**, and **Usage example**. It then creates these files:

```tree
src/components/my-greeting/
├── my-greeting.css
├── my-greeting.tsx
└── usage/
    └── example.md
```

`my-greeting.tsx` is the component itself:

```tsx title="src/components/my-greeting/my-greeting.tsx"
import { Component, Host } from '@stencil/core';

@Component({
  tag: 'my-greeting',
  styleUrl: 'my-greeting.css',
  encapsulation: { type: 'shadow' },
})
export class MyGreeting {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
```

`usage/example.md` shows how to use the component in HTML. The dev server uses it to preview the component, and it's included in the documentation that Stencil generates.

## Preview It

Start the dev server:

```bash npm2yarn
npm run dev
```

Then open [http://localhost:3333/src/components/my-greeting/](http://localhost:3333/src/components/my-greeting/). The dev server renders the component from its usage example (see [Component Previews](../config/dev-server.md#component-previews)). It doesn't show anything yet, because the component only renders a `<slot>` and the example puts nothing in it.

## Give It a Prop

Add a `name` prop, and render a greeting with it:

```tsx title="src/components/my-greeting/my-greeting.tsx"
import { Component, Host, Prop } from '@stencil/core';

@Component({
  tag: 'my-greeting',
  styleUrl: 'my-greeting.css',
  encapsulation: { type: 'shadow' },
})
export class MyGreeting {
  /** Who to greet */
  @Prop() name = 'Stencil';

  render() {
    return (
      <Host>
        <p>Hello, {this.name}!</p>
        <slot></slot>
      </Host>
    );
  }
}
```

Save the file, and the preview shows "Hello, Stencil!" without a page reload.

Now set the prop from HTML. Change the usage example:

````md title="src/components/my-greeting/usage/example.md"
# Example

```html
<my-greeting name="World"></my-greeting>
```
````

The preview updates to "Hello, World!".

## What You Just Wrote

The [`@Component()` decorator](../components/component.md) tells Stencil about the component:

- `tag` is the [element's name](../components/component.md#tag), `my-greeting`.
- `styleUrl` [applies the stylesheet](../components/component.md#styleurl) next to it.
- `encapsulation` renders the component in a [shadow root](../components/component.md#encapsulation), one of [several options](../concepts/component-archetypes.md).

[`@Prop()`](../components/properties.md) makes `name` part of the component's public API. Stencil sets it from the `name` attribute in HTML, or from the `name` property in JavaScript, and renders the component again whenever it changes. The `= 'Stencil'` is its default value.

[`render()`](../components/templating-and-jsx.md) returns what the component displays, written in JSX. `<Host>` is the component's own element, and `<slot>` is where any content placed inside the element appears.

Here's the finished component. Change `name` in `index.html`, or edit the component itself:

:::playground{preview-height=70}
```html title="index.html"
<script type="module" src="./components/my-greeting/my-greeting.js"></script>

<my-greeting name="World"></my-greeting>
```

```tsx title="src/components/my-greeting/my-greeting.tsx" hidden
import { Component, Host, Prop } from '@stencil/core';

@Component({
  tag: 'my-greeting',
  styleUrl: 'my-greeting.css',
  encapsulation: { type: 'shadow' },
})
export class MyGreeting {
  /** Who to greet */
  @Prop() name = 'Stencil';

  render() {
    return (
      <Host>
        <p>Hello, {this.name}!</p>
        <slot></slot>
      </Host>
    );
  }
}
```

```css title="src/components/my-greeting/my-greeting.css"
:host {
  display: block;
}
```
:::

The project also includes a starter component, `my-component`, created by `stencil init`. It's another example to look at, and you can delete it.

## Next Steps

You've built and rendered your first component. To see everything a component can do, from state and events to methods and lifecycle hooks, explore the [component API](../components/api.md).

When you're ready to share your components, see [Publishing to NPM](../guides/distribution/publishing.md) for packaging, publishing, and how consumers pull your components into their own projects.

If you also want consumers to get idiomatic React, Angular, or Vue components instead of raw custom elements, see [Framework Integration](../framework-integration/01-overview.md) for generating those wrapper packages on top of your published library.
