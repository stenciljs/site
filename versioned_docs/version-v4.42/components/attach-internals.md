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

Read the dedicated guide on [Form Associated Components](./form-associated.md) and how to use `@AttachInternals` there.

## Custom States

You can use the `@AttachInternals` decorator to define [Custom States](https://developer.mozilla.org/en-US/docs/Web/API/CustomStateSet) for your component.

```tsx
import { Component, h, AttachInternals } from '@stencil/core';
/**
 * My Element component
 */
@Component({
  tag: 'my-element',
  styleUrl: 'my-element.css',
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

You or your element users can then use custom states in CSS like so:

```css
/* Use them internally... */
:host(:state(my-custom-state)) {
  background-color: yellow;
}
/* ... Or use them externally */
my-element:state(another-state) {
  border: 2px solid red;
} 
```
