---
title: Internal state
sidebar_label: Internal State
description: Use the State() for component's internal state
slug: /state
---

# State

'State' is a general term that refers to the values and objects that are stored on a class or an instance of a class for
use now or in the future.

Like a regular TypeScript class, a Stencil component may have one or more internal class members for holding value(s)
that make up the component's state. Stencil allows developers to optionally mark class members holding some part of the
class's state with the `@State()` decorator to trigger a rerender when the state changes.

## The State Decorator (`@State`)

Stencil provides a decorator to trigger a rerender when certain class members change. A component's class members that
should trigger a rerender must be decorated using Stencil's `@State()` decorator, like so:
```tsx
// First, we import State from '@stencil/core'
import { Component, State, h } from '@stencil/core';

@Component({
    tag: 'current-time',
})
export class CurrentTime {
    // Second, we decorate a class member with @State()
    // When `currentTime` changes, a rerender will be
    // triggered
    @State() currentTime: number = Date.now();

    render() {
        // Within the component's class, its members are
        // accessed via `this`. This allows us to render
        // the value stored in `currentTime`
        const time = new Date(this.currentTime).toLocaleTimeString();

        return (
            <span>{time}</span>
        );
    }
}
```

In the example above, `@State()` is placed before (decorates) the `currentTime` class member, which is a number. This
marks `currentTime` so that any time its value changes, the component rerenders.

However, the example above doesn't demonstrate the real power of using `@State`. `@State` members are meant to only be
updated within a class, which the example above never does after the initial assignment of `currentTime`. This means
that our `current-time` component will never rerender! We fix that in the example below to update `current-time` every
1000 milliseconds (1 second):

```tsx
import { Component, State, h } from '@stencil/core';

@Component({
    tag: 'current-time',
})
export class CurrentTime {
    timer: number;

    // `currentTime` is decorated with `@State()`,
    // as we need to trigger a rerender when its
    // value changes to show the latest time
    @State() currentTime: number = Date.now();
    
    connectedCallback() {
        this.timer = window.setInterval(() => {            
            // the assignment to `this.currentTime`
            // will trigger a re-render
            this.currentTime = Date.now();
        }, 1000);
    }

    disconnectedCallback() {
        window.clearInterval(this.timer);
    }

    render() {
        const time = new Date(this.currentTime).toLocaleTimeString();

        return (
            <span>{time}</span>
        );
    }
}
```

The example above makes use of the [connectedCallback() lifecycle method](./component-lifecycle.md#connectedcallback)
to set `currentTime` to the value of `Date.now()` every 1000 milliseconds (or, every one second). Because the value of 
`currentTime` changes every second, Stencil calls the `render` function on `current-time`, which pretty-prints the
current time.

The example above also makes use of the 
[disconnectedCallback() lifecycle method](./component-lifecycle.md#disconnectedcallback) to properly clean up the timer
that was created using `setInterval` in `connectedCallback()`. This isn't necessary for using `@State`, but is a general
good practice when using `setInterval`.

## When to Use `@State()`?

`@State()` should be used for all class members that should trigger a rerender when they change. However, not all
internal state might need to be decorated with `@State()`. If you know for sure that the value will either not change or
that it does not need to trigger a re-rendering, `@State()` is not necessary. It is considered a 'best practice' to
only use `@State()` when absolutely necessary. Revisiting our `current-time` component:

```tsx
import { Component, State, h } from '@stencil/core';

@Component({
    tag: 'current-time',
})
export class CurrentTime {
    // `timer` is not decorated with `@State()`, as
    // we do not wish to trigger a rerender when its
    // value changes
    timer: number;

    // `currentTime` is decorated with `@State()`,
    // as we need to trigger a rerender when its
    // value changes to show the latest time
    @State() currentTime: number = Date.now();

    connectedCallback() {
        // the assignment to `this.timer` will not
        // trigger a re-render
        this.timer = window.setInterval(() => {
            // the assignment to `this.currentTime`
            // will trigger a re-render
            this.currentTime = Date.now();
        }, 1000);
    }

    disconnectedCallback() {
        window.clearInterval(this.timer);
    }

    render() {
        const time = new Date(this.currentTime).toLocaleTimeString();

        return (
            <span>{time}</span>
        );
    }
}
```

## Examples

### Using `@State()` with `@Listen()`

This example makes use of `@State` and [`@Listen`](./events.md#listen-decorator) decorators. We define a class member
called `isOpen` and decorate it with `@State()`. With the use of `@Listen()`, we respond to click events toggling the
value of `isOpen`.

```tsx
import { Component, Listen, State, h } from '@stencil/core';

@Component({
  tag: 'my-toggle-button'
})
export class MyToggleButton {
    // `isOpen` is decorated with `@State()`,
    // changes to it will trigger a rerender
    @State() isOpen: boolean = true;

    @Listen('click', { capture: true })
    handleClick() {
        // whenever a click event occurs on
        // the component, update `isOpen`,
        // triggering the rerender
        this.isOpen = !this.isOpen;
    }

    render() {
        return <button>
          {this.isOpen ? "Open" : "Closed"}
        </button>;
    }
}
```

### Complex Types

For more advanced use cases, `@State()` can be used with a complex type. In the example below, we print a list of `Item`
entries. Although we start with zero `Item`s initially, we use the same pattern as we did before to add a new `Item` to 
`ItemList`'s `items` array once every 2000 milliseconds (2 seconds). Every time a new entry is added to `items`, a
rerender occurs:

```tsx
import { Component, State, h } from '@stencil/core';

// a user defined, complex type describing an 'Item'
type Item = {
    id: number;
    description: string,
}

@Component({
    tag: 'item-list',
})
export class ItemList {
    // `timer` is not decorated with `@State()`, as
    // we do not wish to trigger a rerender when its
    // value changes
    timer: number;

    // `items` will trigger a rerender if
    // the value assigned to the variable changes
    @State() items: Item[] = [];

    connectedCallback() {
        // the assignment to `this.timer` will not
        // trigger a re-render
        this.timer = window.setInterval(() => {
            const newTodo: Item = {
                description: "Item",
                id: this.items.length + 1
            };
            // the assignment to `this.items` will
            // trigger a re-render. the assignment
            // using '=' is important here, as we
            // need that to make sure the rerender
            // occurs
            this.items = [...this.items, newTodo];
        }, 2000);
    }

    disconnectedCallback() {
        window.clearInterval(this.timer);
    }

    render() {
        return (
            <div>
                <h1>To-Do List</h1>
                <ul>
                    {this.items.map((todo) => <li>{todo.description} #{todo.id}</li>)}
                </ul>
            </div>
        );
    }
}
```

It's important to note that it's the reassignment of `this.items` that is causing the rerender in `connectedCallback()`:
```ts
this.items = [...this.items, newTodo];
```

Mutating the existing reference to `this.items` like in the examples below will not cause a rerender, as Stencil will
not know that the contents of the array has changed:
```ts
// updating `items` either of these ways will not
// cause a rerender
this.items.push(newTodo);
this.items[this.items.length - 1] = newTodo;
```

Similar to the examples above, this code sample makes use of the
[connectedCallback() lifecycle method](./component-lifecycle.md#connectedcallback) to create a new `Item` and add
it to `items` every 2000 milliseconds (every two seconds). The example above also makes use of the
[disconnectedCallback() lifecycle method](./component-lifecycle.md#disconnectedcallback) to properly clean up the timer
that was created using `setInterval` in `connectedCallback()`.
