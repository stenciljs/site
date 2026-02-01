---
title: Docs Custom Elements Manifest Output Target
sidebar_label: CEM (docs-custom-elements-manifest)
description: Custom Elements Manifest
slug: /docs-custom-elements-manifest
---

# Generating Documentation in Custom Elements Manifest (CEM) format

Since Stencil v4.42, Stencil supports automatically generating a [Custom Elements Manifest (CEM)](https://custom-elements-manifest.open-wc.org/)
file in your project. The CEM format is a standardized JSON format for describing
custom elements and is supported by a variety of tools in the web components ecosystem.


```tsx title="stencil.config.ts"
import { Config } from '@stencil/core';

export const config: Config = {
  outputTargets: [
    {
      type: 'docs-custom-elements-manifest',
      file: 'path/to/cem.json'
    }
  ]
};
```

The JSON file output by Stencil conforms to the [CEM Schema interface](https://github.com/webcomponents/custom-elements-manifest/blob/main/schema.d.ts).

## Properties, Methods, Events, and Attributes

The CEM output target includes information about your components' properties,
methods, events, and attributes based on the decorators you use in your Stencil
components.

## CSS Properties

Stencil can document CSS variables if you annotate them with JSDoc-style
comments in your CSS/SCSS files. If, for instance, you had a component with a
CSS file like the following:

```css title="src/components/my-button/my-button.css"
:host {
  /**
   * @prop --background: Background of the button
   * @prop --background-activated: Background of the button when activated
   * @prop --background-focused: Background of the button when focused
   */
  --background: pink;
  --background-activated: aqua;
  --background-focused: fuchsia;
}
```

Then you'd get the following in the JSON output:

```json title="Example docs-custom-elements-manifest Output"
[
  {
    "cssProperties": [
      {
        "name": "background",
        "description": "Background of the button"
      },
      {
        "name": "background-activated",
        "description": "Background of the button when activated"
      },
      {
        "name": "background-focused",
        "description": "Background of the button when focused"
      }
    ]
  }
]   
```

## Slots

If one of your Stencil components makes use of
[slots](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot) for
rendering children you can document them by using the `@slot` JSDoc tag in the
component's comment.

For instance, if you had a `my-button` component with a slot you might document
it like so:

```tsx title="src/components/my-button/my-button.tsx"
import { Component, h } from '@stencil/core';

/**
 * @slot buttonContent - Slot for the content of the button
 */
@Component({
  tag: 'my-button',
  styleUrl: 'my-button.css',
  shadow: true,
})
export class MyButton {
  render() {
    return <button><slot name="buttonContent"></slot></button>
  }
}
```

This would show up in the generated JSON file like so:

```json
"slots": [
  {
    "name": "buttonContent",
    "description": "Slot for the content of the button"
  }
]
```

:::caution
Stencil does not check that the slots you document in a component's JSDoc
comment using the `@slot` tag are actually present in the JSX returned by the
component's `render` function.

It is up to you as the component author to ensure the `@slot` tags on a
component are kept up to date.
:::

## Custom States

You can document [Custom States](https://developer.mozilla.org/en-US/docs/Web/API/CustomStateSet) for your components using the `@AttachInternals` decorator
and JSDoc comments. 

For example:

```tsx title="src/components/my-element/my-element.tsx"
import { Component, h, AttachInternals } from '@stencil/core';
/**
 * My Element component
 */
@Component({
  tag: 'my-element',
  styleUrl: 'my-element.css',
  shadow: true,
})
export class MyElement {
  @AttachInternals({
    states: {
      new: true, 
      /** If this item is older than 6 months old. Use via `:state(archived)` */
      archived: false
  },
  }) internals!: ElementInternals;
```

This would show up in the generated JSON file like so:

```json
"customStates": [
  {
    "name": "new",
    "description": ""
  },
  {    
    "name": "archived",
    "description": "If this item is older than 6 months old. Use via `:state(archived)"
  }
]
```

## Demos

You can save demos for a component in the `usage/` subdirectory within
that component's directory. The content of these files will be added to the
`demos` property of the generated JSON. This allows you to keep examples right
next to the code, making it easy to include them in a documentation site or
other downstream consumer(s) of your docs.

:::caution
Stencil doesn't check that your demos are up-to-date! If you make any
changes to your component's API you'll need to remember to update your demos
manually.
:::

If, for instance, you had a usage example like this:

````md title="src/components/my-button/usage/my-button-usage.md"
# How to use `my-button`

A button is often a great help in adding interactivity to an app!

You could use it like this:

```html
<my-button>My Button!</my-button>
```
````


You'd get the following in the JSON output under the `"usage"` key:

```json
"demos": [{
  "url": "my-button-usage.md",
  "description": "# How to use `my-button`\n\nA button is often a great help in adding interactivity to an app!\n\nYou could use it like this:\n\n```html\n<my-button>My Button!</my-button>\n```\n"
}]
```
