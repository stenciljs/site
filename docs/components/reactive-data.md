---
title: Watching Changes
sidebar_label: Watch
description: Run code when a prop or state value changes, with the @Watch() decorator
slug: /reactive-data
---

# Watching Changes

A component re-renders on its own when a [prop](./properties.md) or [state](./state.md) value changes. To run other code when a value changes, such as validating it or fetching data, decorate a method with `@Watch()` and give it the member's name:

```tsx
import { Component, Prop, Watch } from '@stencil/core';

@Component({ tag: 'user-profile' })
export class UserProfile {
  @Prop() userId: string;

  @Watch('userId')
  userIdChanged(newValue: string, oldValue: string) {
    console.log(`userId changed from ${oldValue} to ${newValue}`);
  }
}
```

The method receives the new value, then the old one.

## Running on the First Value

A watcher doesn't run for a member's initial value, only when it changes later. Add `immediate: true` to run it for the initial value too:

```tsx
@Watch('userId', { immediate: true })
userIdChanged(newValue: string) {
  this.loadUser(newValue);
}
```

An immediate watcher runs before the component's first render, so its rendered elements don't exist yet.

## Watching Several Members

Stack `@Watch()` decorators to run one method for several members. The third argument is the name of the member that changed:

```tsx
@Watch('firstName')
@Watch('lastName')
nameChanged(newValue: string, oldValue: string, name: string) {
  console.log(`${name} changed to ${newValue}`);
}
```

## Watching Native Attributes

`@Watch()` also takes the name of an HTML attribute on the host element, such as `aria-label`. The name is case-sensitive:

```tsx
@Watch('aria-label')
ariaLabelChanged(newValue: string) {
  console.log('Label changed:', newValue);
}
```

A native attribute isn't a prop or state, so changing it doesn't re-render the component. Call [`forceUpdate()`](./api.md#forceupdate) in the watcher if the render depends on it:

```tsx
import { Component, Watch, forceUpdate } from '@stencil/core';

@Watch('aria-label')
ariaLabelChanged() {
  forceUpdate(this);
}
```

## Arrays and Objects

Stencil detects a change by comparing references, so a watcher runs when you assign a new array or object, and not when you change one in place (`this.items.push(item)`). See [Arrays and Objects](./state.md#arrays-and-objects) for how to update them.
