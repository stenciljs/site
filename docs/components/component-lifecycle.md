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

Called every time the component is disconnected from the DOM. This can happen more than once: moving an element disconnects it and connects it again.

This `lifecycle` hook follows the same semantics as the one described by the [Custom Elements Spec](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements).

Use it to undo what `connectedCallback()` set up. This clock starts a timer when it's added to the DOM, and stops it when it's removed:

```tsx
import { Component, State } from '@stencil/core';

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

## componentWillLoad()

Called once just after the component is first connected to the DOM. Since this method is only called once, it's a good place to load data asynchronously and to setup the state without triggering extra re-renders.

A promise can be returned, that can be used to wait for the first `render()`.

## componentDidLoad()

Called once just after the component is fully loaded and the first `render()` occurs.

## componentShouldUpdate()

This hook is called when one or more of a component's [`Prop`](./properties.md) or [`State`](./state.md) properties change and a rerender is about to be requested. It receives a single `changes` argument — a map of every prop/state name that changed since the last render to its `{ newVal, oldVal }` — and should return a boolean to indicate if the component should rerender (`true`) or not (`false`).

This method is not executed before the initial render (when the component is first attached to the DOM). It fires once per render cycle, even if multiple props change synchronously:

```tsx
component.somePropA = 42;
component.somePropB = 88;
```

Both changes are batched into a single call:

```tsx
componentShouldUpdate(changes) {
  if (changes['somePropA'] && changes['somePropA'].newVal === changes['somePropA'].oldVal) {
    return false;
  }
}
```

For stricter per-prop typing, use the `ComponentShouldUpdateChanges<this>` type:

```tsx
import { ComponentShouldUpdateChanges } from '@stencil/core';

componentShouldUpdate(changes: ComponentShouldUpdateChanges<this>) {
  if (changes['somePropA']?.newVal === changes['somePropA']?.oldVal) {
    return false;
  }
}
```

:::note
The per-prop `(newVal, oldVal, propName)` signature from versions before Stencil v5 is no longer supported. Declaring `componentShouldUpdate` with more than one parameter raises a compiler warning, and the extra parameters are `undefined` at runtime.
:::

`componentShouldUpdate()` only decides whether a render goes ahead. It doesn't see changes made before the first render, so to react to a prop or state change, use [`@Watch()`](./reactive-data.md).

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

In this playground, each component adds a line to the list as its methods run:

:::playground{preview-height=190}
```tsx title="cmp-a.tsx"
import { Component } from '@stencil/core';
import { log } from './log';

@Component({ tag: 'cmp-a' })
export class CmpA {
  componentWillLoad() {
    log('cmp-a - componentWillLoad()');
  }

  componentDidLoad() {
    log('cmp-a - componentDidLoad()');
  }

  render() {
    return <slot />;
  }
}
```

```ts title="log.ts"
export const log = (message: string) => {
  const item = document.createElement('li');
  item.textContent = message;
  document.querySelector('#log').append(item);
};
```

```ts title="main.ts"
// Define all three together, as a build's output does
import './cmp-a';
import './cmp-b';
import './cmp-c';
```

```html title="index.html"
<script type="module" src="./main.js"></script>

<cmp-a>
  <cmp-b>
    <cmp-c></cmp-c>
  </cmp-b>
</cmp-a>

<ol id="log"></ol>
```

```tsx title="cmp-b.tsx" hidden
import { Component } from '@stencil/core';
import { log } from './log';

@Component({ tag: 'cmp-b' })
export class CmpB {
  componentWillLoad() {
    log('cmp-b - componentWillLoad()');
  }

  componentDidLoad() {
    log('cmp-b - componentDidLoad()');
  }

  render() {
    return <slot />;
  }
}
```

```tsx title="cmp-c.tsx" hidden
import { Component } from '@stencil/core';
import { log } from './log';

@Component({ tag: 'cmp-c' })
export class CmpC {
  componentWillLoad() {
    log('cmp-c - componentWillLoad()');
  }

  componentDidLoad() {
    log('cmp-c - componentDidLoad()');
  }

  render() {
    return <slot />;
  }
}
```
:::


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
