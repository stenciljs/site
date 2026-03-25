---
title: Component Lifecycle Methods
sidebar_label: Lifecycle Methods
description: Component Lifecycle Methods
slug: /component-lifecycle
---

# Component Lifecycle Methods

Components have numerous lifecycle methods which can be used to know when the component "will" and "did" load, update, and render. These methods can be added to a component to hook into operations at the right time.

Implement one of the following methods within a component class and Stencil will automatically call them in the right order:

import LifecycleMethodsChart from '@site/src/components/LifecycleMethodsChart';

<LifecycleMethodsChart />

## connectedCallback()

Called every time the component is connected to the DOM.
When the component is first connected, this method is called before `componentWillLoad`.

It's important to note that this method can be called more than once, every time, the element is **attached** or **moved** in the DOM. For logic that needs to run every time the element is attached or moved in the DOM, it is considered a best practice to use this lifecycle method.

```tsx
const el = document.createElement('my-cmp');
document.body.appendChild(el);
// connectedCallback() called
// componentWillLoad() called (first time)

el.remove();
// disconnectedCallback()

document.body.appendChild(el);
// connectedCallback() called again, but `componentWillLoad()` is not.
```


This `lifecycle` hook follows the same semantics as the one described by the [Custom Elements Spec](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)

## disconnectedCallback()

Called every time the component is disconnected from the DOM, ie, it can be dispatched more than once, DO not confuse with a "onDestroy" kind of event.

This `lifecycle` hook follows the same semantics as the one described by the [Custom Elements Spec](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements).

## componentWillLoad()

Called once just after the component is first connected to the DOM. Since this method is only called once, it's a good place to load data asynchronously and to setup the state without triggering extra re-renders.

A promise can be returned, that can be used to wait for the first `render()`.

## componentDidLoad()

Called once just after the component is fully loaded and the first `render()` occurs.

## componentShouldUpdate()

This hook is called when a component's [`Prop`](./properties.md) or [`State`](./state.md) property changes and a rerender is about to be requested. This hook receives three arguments: the new value, the old value and the name of the changed state. It should return a boolean to indicate if the component should rerender (`true`) or not (`false`).

A couple of things to notice is that this method will not be executed before the initial render, that is, when the component is first attached to the dom, nor when a rerender is already scheduled in the next frame.

Let’s say the following two props of a component change synchronously:

```tsx
component.somePropA = 42;
component.somePropB = 88;
```

The `componentShouldUpdate` will be first called with arguments: `42`, `undefined` and `somePropA`. If it does return `true`, the hook will not be called again since the rerender is already scheduled to happen. Instead, if the first hook returned `false`, then `componentShouldUpdate` will be called again with `88`, `undefined` and `somePropB` as arguments, triggered by the `component.somePropB = 88` mutation.

Since the execution of this hook might be conditioned, it's not good to rely on it to watch for prop changes, instead use the `@Watch` decorator for that.

## componentWillRender()

Called before every `render()`.

A promise can be returned, that can be used to wait for the upcoming render.

## componentDidRender()

Called after every `render()`.


## componentWillUpdate()

Called when the component is about to be updated because some `Prop()` or `State()` changed.
It's never called during the first `render()`.

A promise can be returned, that can be used to wait for the next render.


## componentDidUpdate()

Called just after the component updates.
It's never called during the first `render()`.


## Rendering State

It's always recommended to make any rendered state updates within `componentWillRender()`, since this is the method which get called _before_ the `render()` method. Alternatively, updating rendered state with the `componentDidLoad()`, `componentDidUpdate()` and `componentDidRender()` methods will cause another rerender, which isn't ideal for performance.

If state _must_ be updated in `componentDidUpdate()` or `componentDidRender()`, it has the potential of getting components stuck in an infinite loop. If updating state within `componentDidUpdate()` is unavoidable, then the method should also come with a way to detect if the props or state is "dirty" or not (is the data actually different or is it the same as before). By doing a dirty check, `componentDidUpdate()` is able to avoid rendering the same data, and which in turn calls `componentDidUpdate()` again.


## Lifecycle Hierarchy

A useful feature of lifecycle methods is that they take their child component's lifecycle into consideration too. For example, if the parent component, `cmp-a`, has a child component, `cmp-b`, then `cmp-a` isn't considered "loaded" until `cmp-b` has finished loading. Another way to put it is that the deepest components finish loading first, then the `componentDidLoad()` calls bubble up.

It's also important to note that even though Stencil can lazy-load components, and has asynchronous rendering, the lifecycle methods are still called in the correct order. So while the top-level component could have already been loaded, all of its lifecycle methods are still called in the correct order, which means it'll wait for a child components to finish loading. The same goes for the exact opposite, where the child components may already be ready while the parent isn't.

In the example below we have a simple hierarchy of components. The numbered list shows the order of which the lifecycle methods will fire.

```markup
  <cmp-a>
    <cmp-b>
      <cmp-c></cmp-c>
    </cmp-b>
  </cmp-a>
```

1. `cmp-a` - `componentWillLoad()`
2. `cmp-b` - `componentWillLoad()`
3. `cmp-c` - `componentWillLoad()`
4. `cmp-c` - `componentDidLoad()`
5. `cmp-b` - `componentDidLoad()`
6. `cmp-a` - `componentDidLoad()`

Even if some components may or may not be already loaded, the entire component hierarchy waits on its child components to finish loading and rendering.


## Async Lifecycle Methods

Some lifecycle methods, e.g. `componentWillRender`, `componentWillLoad` and `componentWillUpdate`, can also return promises which allows the method to asynchronously retrieve data or perform any async tasks. A great example of this is fetching data to be rendered in a component. For example, this very site you're reading first fetches content data before rendering. But because `fetch()` is async, it's important that `componentWillLoad()` returns a `Promise` to ensure its parent component isn't considered "loaded" until all of its content has rendered.

Below is a quick example showing how `componentWillLoad()` is able to have its parent component wait on it to finish loading its data.

```tsx
componentWillLoad() {
  return fetch('/some-data.json')
    .then(response => response.json())
    .then(data => {
      this.content = data;
    });
}
```

## Example

This simple example shows a clock and updates the current time every second. The timer is started when the component is added to the DOM. Once it's removed from the DOM, the timer is stopped.

```tsx
import { Component, State, h } from '@stencil/core';

@Component({
  tag: 'custom-clock'
})
export class CustomClock {

  timer: number;

  @State() time: number = Date.now();

  connectedCallback() {
    this.timer = window.setInterval(() => {
      this.time = Date.now();
    }, 1000);
  }

  disconnectedCallback() {
    window.clearInterval(this.timer);
  }

  render() {
    const time = new Date(this.time).toLocaleTimeString();

    return (
      <span>{ time }</span>
    );
  }
}
```
