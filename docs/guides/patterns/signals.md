---
title: Signals
sidebar_label: Signals
description: Share reactive state between Stencil components, and with other frameworks, using signals
slug: /signals
---

# Signals

A signal holds a value, and tells whatever reads it when that value changes. A signal lives outside any one component, so several components can share it. Stencil can also put a signal straight into the DOM, and update that one node when the value changes without rendering the component again.

Stencil's signals are [Preact Signals](https://github.com/preactjs/signals). The `@stencil/core/signals` module exports `signal`, `computed`, `effect`, `batch`, and `untracked` from `@preact/signals-core`, along with Stencil's own `@Effect()` and `getSignal()`.

## Share State with a Signal

Create a signal in a module of its own, and export it:

```ts title="src/count.ts"
import { signal } from '@stencil/core/signals';

export const count = signal(0);
```

Any component can import it. Read and write the current value through `.value`, and place the signal itself in JSX to display it:

```tsx title="src/components/my-counter/my-counter.tsx"
import { Component } from '@stencil/core';
import { count } from '../../count';

@Component({
  tag: 'my-counter',
  encapsulation: { type: 'shadow' },
})
export class MyCounter {
  private increment = () => {
    count.value = count.value + 1;
  };

  render() {
    return <button onClick={this.increment}>{count}</button>;
  }
}
```

Every `<my-counter>` on the page now shows the same number, and a click on any of them updates all of them.

### Put the Signal in JSX, Not Its Value

When a signal is a child or an attribute value in JSX, Stencil subscribes to it and updates that text node or attribute directly. The component's `render()` doesn't run again.

That only happens when you pass the signal itself. Reading `.value` in `render()` gives the value at the time of that render, and nothing tells Stencil to render again:

```tsx
render() {
  return (
    <div>
      {/* Updates when count changes */}
      <span>{count}</span>

      {/* Shows the first value, and never updates */}
      <span>{count.value}</span>
    </div>
  );
}
```

The same goes for anything computed from `.value` inside `render()`, such as `count.value % 2` or a template string.

## React to a Signal with `@Effect()`

When a signal should change what a component renders, and not only a value in it, copy what you need into `@State()` from a method marked with `@Effect()`:

```tsx title="src/components/my-parity/my-parity.tsx"
import { Component, State } from '@stencil/core';
import { Effect } from '@stencil/core/signals';
import { count } from '../../count';

@Component({
  tag: 'my-parity',
  encapsulation: { type: 'shadow' },
})
export class MyParity {
  @State() private isEven = true;

  @Effect()
  syncIsEven() {
    this.isEven = count.value % 2 === 0;
  }

  render() {
    return this.isEven ? <p>even</p> : <p>odd</p>;
  }
}
```

Stencil runs the method once when the component loads, and again whenever a signal that it read changes. Setting `@State()` then renders the component in the usual way. The effect stops when the component is removed from the page.

## Back Props and State with Signals

Signals in JSX and `@Effect()` work in any Stencil v5 project. To also store each component's own `@Prop()` and `@State()` values in signals, set `signalBacking` in your config:

```tsx title="stencil.config.ts"
import { Config } from '@stencil/core';

export const config: Config = {
  signalBacking: true,
};
```

Your components don't change. `@Prop()` and `@State()` behave as before, and two more things become possible.

**`@Effect()` tracks a component's own members.** An effect that reads `this.step` or `this.clicks` runs again when they change. Without `signalBacking`, an effect only tracks signals:

```tsx
@Prop() step = 1;
@State() clicks = 0;

@Effect()
log() {
  console.log(this.step, this.clicks);
}
```

**Code outside a component can subscribe to its props.** `getSignal()` returns a read-only signal for one of an element's `@Prop()` members, or `null` if the element has no such prop. Use it once the component has loaded:

```ts
import { computed, effect, getSignal } from '@stencil/core/signals';

const slider = document.querySelector('my-slider');
await slider.componentOnReady();

const value = getSignal<number>(slider, 'value');
const percent = computed(() => `${value.value}%`);

effect(() => {
  console.log(percent.value);
});
```

`@State()` members aren't available this way. They're internal to the component.

### Reading Signals Without Importing Stencil

Framework adapters and other code that can't import `@stencil/core` can read the same signals from the element. Each signal-backed element has a `Map` of prop names to signals, under the symbol `Symbol.for('stencil.signals')`:

```ts
const signals = slider[Symbol.for('stencil.signals')];
const stop = signals.get('value').subscribe((value) => {
  console.log(value);
});
```

`@stencil/core/signals` exports the same symbol as `STENCIL_SIGNALS_SYMBOL`.

## Signals or `@stencil/store`?

Both share state between components. [`@stencil/store`](./store.md) keeps a set of named values in one object, and renders every component that read a value when it changes. A signal is one value, and can update a single node without a render. Use a store for a group of related values that components read in `render()`, and a signal for an individual value that changes often or that code outside Stencil needs to follow.
