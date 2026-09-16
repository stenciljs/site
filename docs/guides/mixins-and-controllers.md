---
title: Mixins & Reactive Controllers
sidebar_label: Mixins & Reactive Controllers
description: Compose component logic with Mixin() and reactive controllers
slug: /mixins-and-controllers
---

# Mixins & Reactive Controllers

Stencil composes component logic through `Mixin()`, a function that folds one or more mixin factories over a base class. A mixin factory is a function that takes a base class and returns a new class extending it: `(Base) => class extends Base { ... }`. See the [`Mixin()` reference](../components/api.md#mixin) for its full type signature.

## Combine your own mixin factories

Write each behavior as its own mixin factory, then pass as many as you need to `Mixin()`:

<!--
  TODO(live-demo): replace/supplement this static example with a live,
  editable demo 
-->

```typescript
import { Component, Mixin } from '@stencil/core';
import { ValidationControllerMixin } from './validation-controller-mixin';
import { FocusControllerMixin } from './focus-controller-mixin';

@Component({ tag: 'my-component' })
export class MyComponent extends Mixin(ValidationControllerMixin, FocusControllerMixin) {
  componentDidLoad() {
    super.componentDidLoad?.();
    // Your logic here
  }

  private onBlur = () => {
    this.handleBlur();
    this.validate(this.values);
  };
}
```

`Mixin(A, B, C)` applies the factories right to left, so `A` ends up closest to `MyComponent` in the prototype chain. Call `super.<method>?.()` in any lifecycle method you override, since an earlier factory in the chain might not define it.

:::note
Methods and properties from different mixins can collide if they share a name. Stencil doesn't detect this for you. Pick distinct names, or keep the mixin count small enough to track by eye.
:::

If a mixin factory declares `@Prop`, `@State`, or other decorated members, write it as a named class declaration with an explicit `return`. TypeScript doesn't allow decorators on the members of a class expression, so a factory that returns one directly fails to compile the moment you add one:


```typescript
// ✅ Do this: a named class declaration supports decorated members.
function ValidationControllerMixin(Base) {
  class ValidationControllerMixinClass extends Base {
    @State() errors: string[] = [];
    validate(values) {
      /* ... */
    }
  }
  return ValidationControllerMixinClass;
}

// ❌ Not this: TypeScript rejects decorators here with "Decorators are not valid here",
// whether the class is named or anonymous.
const ValidationControllerMixin = (Base) =>
  class extends Base {
    @State() errors: string[] = [];
    validate(values) {
      /* ... */
    }
  };
```

## Compose reactive controllers

A reactive controller is an object that hooks into a component's lifecycle without living inside the component class. Write the behavior once as a controller, and any component can add it.

Mix in Stencil's built-in `ReactiveControllerHost`, then construct controller instances and pass them `this`:

```typescript
import { Component, Mixin, ReactiveControllerHost } from '@stencil/core';
import { MouseController } from './mouse-controller';

@Component({ tag: 'my-component' })
export class MyComponent extends Mixin(ReactiveControllerHost) {
  private mouse = new MouseController(this);

  componentDidLoad() {
    super.componentDidLoad?.();
    // Your logic here
  }

  render() {
    return (
      <div>
        x: {this.mouse.pos.x}, y: {this.mouse.pos.y}
      </div>
    );
  }
}
```

:::note
`ReactiveControllerHost` is itself a mixin factory, so it always goes through `Mixin()`
:::

A controller takes the host in its constructor and registers itself:

```typescript
import type { ReactiveController, ReactiveControllerHostInterface } from '@stencil/core';

export class MouseController implements ReactiveController {
  pos = { x: 0, y: 0 };
  private host: ReactiveControllerHostInterface;

  constructor(host: ReactiveControllerHostInterface) {
    this.host = host;
    host.addController(this);
  }

  hostConnected() {
    window.addEventListener('mousemove', this.onMouseMove);
  }

  hostDisconnected() {
    window.removeEventListener('mousemove', this.onMouseMove);
  }

  private onMouseMove = (event: MouseEvent) => {
    this.pos = { x: event.clientX, y: event.clientY };
    this.host.requestUpdate();
  };
}
```

If using the [`loader-bundle`](../output-targets/loader-bundle.md) output target, a controller that also needs the real host element (e.g. `@lit/context`'s `ContextProvider` which dispatches DOM events), cannot use a field initializer (like the `MouseController` above), but must instead use `connectedCallback()`.
In the loader-bundle, `this` and the host element are different objects until `connectedCallback` runs: `this` has `addController` / `requestUpdate` / `updateComplete`, the element does not yet. 

```typescript
import { Component, getElement, Mixin, ReactiveControllerHost } from '@stencil/core';
import { ContextProvider } from '@lit/context';
import { myContext } from './my-context';

@Component({ tag: 'my-provider' })
export class MyProvider extends Mixin(ReactiveControllerHost) {
  private provider?: ContextProvider<typeof myContext>;

  connectedCallback() {
    super.connectedCallback?.();
    this.provider ??= new ContextProvider(getElement(this), { context: myContext });
  }
}
```

:::note
The `??=` guard matters: `connectedCallback` can run again if the element disconnects and reconnects, and re-creating the provider each time would lose its state.
:::

### Reactive controller lifecycle hooks

`ReactiveController` supports numerous `host` lifecycle hooks, all optional - mirroring the same load/render/update split [`componentWillLoad`, `componentWillRender`, and `componentWillUpdate`](../components/component-lifecycle.md) use on the component itself.

import LifecycleMethodsChart from '@site/src/components/LifecycleMethodsChart';
import TableAnchor from '@site/src/components/TableAnchor';

<LifecycleMethodsChart variant="controller" />

:::note
`render()`, `componentShouldUpdate()` and `@Watch()` are only on the component host. They're just shown here as they gate `hostWillUpdate` / `hostDidUpdate`.
:::

<table>
<thead>
<tr><th>Hook</th><th>Called</th><th>Useful for</th></tr>
</thead>
<tbody>
<tr id="hostconnected"><td><TableAnchor id="hostconnected" /><code>hostConnected</code></td><td>When the host connects to the DOM</td><td>Setting up event listeners, observers, or subscriptions</td></tr>
<tr id="hostdisconnected"><td><TableAnchor id="hostdisconnected" /><code>hostDisconnected</code></td><td>When the host disconnects from the DOM</td><td>Tearing down whatever <code>hostConnected</code> set up</td></tr>
<tr id="hostwillload"><td><TableAnchor id="hostwillload" /><code>hostWillLoad</code></td><td>Once, before the host's first render</td><td>Async setup that should delay the first render - return a promise and Stencil waits for it</td></tr>
<tr id="hostdidload"><td><TableAnchor id="hostdidload" /><code>hostDidLoad</code></td><td>Once, after the host's first render</td><td>Work that needs the rendered DOM, run a single time</td></tr>
<tr id="hostwillrender"><td><TableAnchor id="hostwillrender" /><code>hostWillRender</code></td><td>Before every render, including the first</td><td>Reading DOM state before it changes</td></tr>
<tr id="hostdidrender"><td><TableAnchor id="hostdidrender" /><code>hostDidRender</code></td><td>After every render, including the first</td><td>Reading or measuring the DOM after it changes</td></tr>
<tr id="hostwillupdate"><td><TableAnchor id="hostwillupdate" /><code>hostWillUpdate</code></td><td>Before a re-render; never fires on the first render</td><td>Work that should skip the initial mount</td></tr>
<tr id="hostdidupdate"><td><TableAnchor id="hostdidupdate" /><code>hostDidUpdate</code></td><td>After a re-render; never fires on the first render</td><td>Side effects that depend on what changed</td></tr>
</tbody>
</table>

The host itself exposes `requestUpdate()`, which schedules a re-render, and `updateComplete`, a promise that resolves once the current render finishes.

Add several controllers to one host the same way: construct each with `this` and let it register itself.

```typescript
@Component({ tag: 'text-input' })
export class TextInput extends Mixin(ReactiveControllerHost) {
  private validation = new ValidationController(this);
  private focus = new FocusController(this);

  getValidationState() {
    return this.validation.getValidationState();
  }
}
```

You can combine both patterns in one call, `Mixin(ReactiveControllerHost, SomeOtherMixin)`, if a component needs both.

## Choosing between them

| | Custom mixin factories | Reactive controllers |
|---|---|---|
| Logic lives | On the component's own prototype chain | On separate controller objects |
| Access to component members | Direct | Only through what you pass in or expose |
| Naming collisions | Possible, between mixins or with the component | Not possible; controllers stay off the prototype chain |
| Best fit | Behavior that feels native to the component | Behavior you want to test or reuse independently of any component |
