---
title: Attach Internals
sidebar_label: Attach Internals
description: attach internals decorator
slug: /attach-internals
---

# Attach Internals Decorator

The `@AttachInternals` decorator is used to attach [ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) to a Stencil component.
This allows you to leverage features such as [Custom States](https://developer.mozilla.org/en-US/docs/Web/API/CustomStateSet) and [Form Association](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals#form_association).

## Form Association

Decorating a property with `@AttachInternals()` automatically marks the component as [form-associated](https://html.spec.whatwg.org/#custom-elements-face-example) — there's no separate `formAssociated` option on `@Component()`. To attach `ElementInternals` for something like [Custom States](#custom-states) *without* form association, use `@AttachInternals({ formAssociated: false })`.

Read the dedicated guide on [Form Associated Components](./form-associated.md) and how to use `@AttachInternals` there.

Note that `ElementInternals` on a [closed shadow root](./component.md#encapsulation) (`encapsulation: { type: 'shadow', mode: 'closed' }`) is still accessible via `@AttachInternals()` from inside the component — closed mode only prevents access to `shadowRoot` from *outside* the component.

## Custom States

You can use the `@AttachInternals` decorator to define [Custom States](https://developer.mozilla.org/en-US/docs/Web/API/CustomStateSet) for your component.

```tsx
import { Component, AttachInternals } from '@stencil/core';
/**
 * My Element component
 */
@Component({
  tag: 'my-element',
  styleUrl: 'my-element.css',
  encapsulation: { type: 'shadow' },
})
export class MyElement {
  @AttachInternals({
    states: {
      /** A custom state for my element */
      'my-custom-state': true,
      /** Another custom state for my element */
      'another-state': false
    }
  }) internals: ElementInternals;
  render() {
    return <div>My Element</div>;
  }
}
``` 

In the example above, we define two custom states: `my-custom-state` and `another-state`.

The initial values of the custom states can be set via the `states` object and 
later on, you can update the states dynamically using the `internals.states` property. For example:

```tsx
handleClick() {
  this.internals.states.add('another-state'); // to add a state
  this.internals.states.delete('my-custom-state'); // to remove a state
}
```

You or your element users can then use custom states in CSS. Use them internally, in the component's stylesheet, or externally, from the page. Click the element below to run `handleClick()`:

:::playground{preview-height=90}
```css title="my-element.css"
:host(:state(my-custom-state)) {
  background-color: yellow;
}
```

```html title="index.html"
<style>
  my-element:state(another-state) {
    border: 2px solid red;
  }
</style>

<script type="module" src="./my-element.js"></script>

<my-element></my-element>
```

```tsx title="my-element.tsx" hidden
import { Component, AttachInternals } from '@stencil/core';
/**
 * My Element component
 */
@Component({
  tag: 'my-element',
  styleUrl: 'my-element.css',
  encapsulation: { type: 'shadow' },
})
export class MyElement {
  @AttachInternals({
    states: {
      /** A custom state for my element */
      'my-custom-state': true,
      /** Another custom state for my element */
      'another-state': false
    }
  }) internals: ElementInternals;

  handleClick() {
    this.internals.states.add('another-state'); // to add a state
    this.internals.states.delete('my-custom-state'); // to remove a state
  }

  render() {
    return <div onClick={() => this.handleClick()}>My Element</div>;
  }
}
```
:::
