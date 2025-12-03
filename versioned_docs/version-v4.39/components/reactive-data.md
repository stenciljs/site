---
title: Reactive Data, Handling arrays and objects
sidebar_label: Reactive Data
description: Reactive Data, Handling arrays and objects
slug: /reactive-data
---

# Reactive Data

Stencil components update when props or state on a component change.

## Rendering methods

When props or state change on a component, the [`render()` method](./templating-and-jsx.md) is scheduled to run.

## The Watch Decorator (`@Watch()`)

`@Watch()` is a decorator that is applied to a method of a Stencil component.
The decorator accepts a single argument, the name of a class member that is decorated with `@Prop()` or `@State()`, or
a host attribute. A method decorated with `@Watch()` will automatically run when its associated class member or attribute changes.

```tsx
// We import Prop & State to show how `@Watch()` can be used on
// class members decorated with either `@Prop()` or `@State()`
import { Component, Prop, State, Watch } from '@stencil/core';

@Component({
  tag: 'loading-indicator' 
})
export class LoadingIndicator {
  // We decorate a class member with @Prop() so that we
  // can apply @Watch()
  @Prop() activated: boolean;
  // We decorate a class member with @State() so that we
  // can apply @Watch()
  @State() busy: boolean;

  // Apply @Watch() for the component's `activated` member.
  // Whenever `activated` changes, this method will fire.
  @Watch('activated')
  watchPropHandler(newValue: boolean, oldValue: boolean) {
    console.log('The old value of activated is: ', oldValue);
    console.log('The new value of activated is: ', newValue);
  }

  // Apply @Watch() for the component's `busy` member.
  // Whenever `busy` changes, this method will fire.
  @Watch('busy')
  watchStateHandler(newValue: boolean, oldValue: boolean) {
    console.log('The old value of busy is: ', oldValue);
    console.log('The new value of busy is: ', newValue);
  }
  
  @Watch('activated')
  @Watch('busy')
  watchMultiple(newValue: boolean, oldValue: boolean, propName:string) {
    console.log(`The new value of ${propName} is: `, newValue);
  }
}
```

In the example above, there are two `@Watch()` decorators.
One decorates `watchPropHandler`, which will fire when the class member `activated` changes.
The other decorates `watchStateHandler`, which will fire when the class member `busy` changes.

When fired, the decorated method will receive the old and new values of the prop/state.
This is useful for validation or the handling of side effects.

:::info
The `@Watch()` decorator does not fire when a component initially loads.
:::

### Watching Native HTML Attributes

Stencil's `@Watch()` decorator also allows you to watch native HTML attributes on the constructed host element. Simply
include the attribute name as the argument to the decorator (this is case-sensitive):

```tsx
@Watch('aria-label')
onAriaLabelChange(newVal: string, oldVal: string) {
  console.log('Label changed:', newVal, oldVal);
}
```

:::note
Since native attributes are not `@Prop()` or `State()` members of the Stencil component, they will not automatically trigger a
re-render when changed. If you wish to re-render a component in this instance, you can leverage the `forceUpdate()` method:

```tsx
import { Component, forceUpdate, h } from '@stencil/core';

@Watch('aria-label')
onAriaLabelChange() {
  forceUpdate(this); // Forces a re-render
}
```
:::

## Handling Arrays and Objects

When Stencil checks if a class member decorated with `@Prop()` or `@State()` has changed, it checks if the reference to the class member has changed.
When a class member is an object or array, and is marked with `@Prop()` or `@State`, in-place mutation of an existing entity will _not_ cause `@Watch()` to fire, as it does not change the _reference_ to the class member.

### Updating Arrays

For arrays, the standard mutable array operations such as `push()` and `unshift()` won't trigger a component update.
These functions will change the content of the array, but won't change the reference to the array itself.

In order to make changes to an array, non-mutable array operators should be used.
Non-mutable array operators return a copy of a new array that can be detected in a performant manner.
These include `map()` and `filter()`, and the [spread operator syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator).
The value returned by `map()`, `filter()`, etc., should be assigned to the `@Prop()` or `@State()` class member being watched.

For example, to push a new item to an array, create a new array with the existing values and the new value at the end:

```tsx
import { Component, State, Watch, h } from '@stencil/core';

@Component({
  tag: 'rand-numbers'
})
export class RandomNumbers {
  // We decorate a class member with @State() so that we
  // can apply @Watch(). This will hold a list of randomly
  // generated numbers
  @State() randNumbers: number[] = [];

  private timer: NodeJS.Timer;

  // Apply @Watch() for the component's `randNumbers` member.
  // Whenever `randNumbers` changes, this method will fire.
  @Watch('randNumbers')
  watchStateHandler(newValue: number[], oldValue: number[]) {
    console.log('The old value of randNumbers is: ', oldValue);
    console.log('The new value of randNumbers is: ', newValue);
  }

  connectedCallback() {
    this.timer = setInterval(() => {
      // generate a random whole number
      const newVal = Math.ceil(Math.random() * 100);

      /**
       * This does not create a new array. When stencil
       * attempts to see if any Watched members have changed,
       * it sees the reference to its `randNumbers` State is
       * the same, and will not trigger `@Watch` or a re-render
       */
      // this.randNumbers.push(newVal)

      /**
       * Using the spread operator, on the other hand, does
       * create a new array. `randNumbers` is reassigned
       * using the value returned by the spread operator.
       * The reference to `randNumbers` has changed, which
       * will trigger `@Watch` and a re-render
       */
      this.randNumbers = [...this.randNumbers, newVal]
    }, 1000)
  }

  disconnectedCallback() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }

  render() {
    return(
      <div>
        randNumbers contains:
        <ol>
          {this.randNumbers.map((num) => <li>{num}</li>)}
        </ol>
      </div>
    )
  }
}
```

### Updating an object

The spread operator should be used to update objects.
As with arrays, mutating an object will not trigger a view update in Stencil.
However, using the spread operator and assigning its return value to the `@Prop()` or `@State()` class member being watched will.
Below is an example:

```tsx
import { Component, State, Watch, h } from '@stencil/core';

export type NumberContainer = {
  val: number,
}

@Component({
  tag: 'rand-numbers'
})
export class RandomNumbers {
  // We decorate a class member with @State() so that we
  // can apply @Watch(). This will hold a randomly generated
  // number.
  @State() numberContainer: NumberContainer = { val: 0 };

  private timer: NodeJS.Timer;

  // Apply @Watch() for the component's `numberContainer` member.
  // Whenever `numberContainer` changes, this method will fire.
  @Watch('numberContainer')
  watchStateHandler(newValue: NumberContainer, oldValue: NumberContainer) {
    console.log('The old value of numberContainer is: ', oldValue);
    console.log('The new value of numberContainer is: ', newValue);
  }

  connectedCallback() {
    this.timer = setInterval(() => {
      // generate a random whole number
      const newVal = Math.ceil(Math.random() * 100);

      /**
       * This does not create a new object. When stencil
       * attempts to see if any Watched members have changed,
       * it sees the reference to its `numberContainer` State is
       * the same, and will not trigger `@Watch` or are-render
       */
      // this.numberContainer.val = newVal;

      /**
       * Using the spread operator, on the other hand, does
       * create a new object. `numberContainer` is reassigned
       * using the value returned by the spread operator.
       * The reference to `numberContainer` has changed, which
       * will trigger `@Watch` and a re-render
       */
      this.numberContainer = {...this.numberContainer, val: newVal};
    }, 1000)
  }

  disconnectedCallback() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }

  render() {
    return <div>numberContainer contains: {this.numberContainer.val}</div>;
  }
}
```
