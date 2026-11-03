---
title: Internal State
sidebar_label: Internal State
description: Use @State() for values a component manages itself
slug: /state
---

# Internal State

`@State()` marks a value that a component manages itself, where a [prop](./properties.md) is passed in from outside. Changing a state value re-renders the component:

```tsx
import { Component, State } from '@stencil/core';

@Component({ tag: 'my-toggle' })
export class MyToggle {
  @State() open = false;

  render() {
    return (
      <button onClick={() => (this.open = !this.open)}>
        {this.open ? 'Open' : 'Closed'}
      </button>
    );
  }
}
```

State is private to each component instance. To share a value between components, see [Signals](../guides/patterns/signals.md).

## When to Use `@State()`

Use `@State()` only for values that the render depends on. Anything else can be a plain class member, which changes without triggering a render. In this clock, `currentTime` is state because it's displayed, and `timer` isn't:

```tsx
import { Component, State } from '@stencil/core';

@Component({ tag: 'current-time' })
export class CurrentTime {
  @State() currentTime = Date.now();

  private timer: number;

  connectedCallback() {
    this.timer = window.setInterval(() => (this.currentTime = Date.now()), 1000);
  }

  disconnectedCallback() {
    window.clearInterval(this.timer);
  }

  render() {
    return <span>{new Date(this.currentTime).toLocaleTimeString()}</span>;
  }
}
```

## Arrays and Objects

Stencil detects a change by comparing references, for state and props alike. Changing an array or object in place keeps the same reference, so nothing re-renders:

```tsx
@State() items: string[] = [];
@State() user = { name: 'Ada', age: 36 };

// no re-render
this.items.push('Stencil');
this.user.age = 37;
```

Assign a new array or object instead:

```tsx
this.items = [...this.items, 'Stencil'];
this.user = { ...this.user, age: 37 };
```

The same applies to [`@Watch()`](./reactive-data.md): a watcher only runs when the member is assigned a new value.
