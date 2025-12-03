---
title: Methods
sidebar_label: Methods
description: methods
slug: /methods
---

# Method Decorator

The `@Method()` decorator is used to expose methods on the public API. Functions decorated with the `@Method()` decorator can be called directly from the element, i.e. they are intended to be callable from the outside!

:::note
Developers should try to rely on publicly exposed methods as little as possible, and instead default to using properties and events as much as possible. As an app scales, we've found it's easier to manage and pass data through @Prop rather than public methods.
:::

```tsx
import { Method } from '@stencil/core';

export class TodoList {

  @Method()
  async showPrompt() {
    // show a prompt
  }
}
```

Call the method like this:

:::note
Developers should ensure that the component is defined by using the whenDefined method of the custom element registry before attempting to call public methods.
:::

```tsx
(async () => {
  await customElements.whenDefined('todo-list');
  const todoListElement = document.querySelector('todo-list');
  await todoListElement.showPrompt();
})();
```

## Public methods must be async

Stencil's architecture is async at all levels which allows for many performance benefits and ease of use. By ensuring publicly exposed methods using the `@Method` decorator return a promise:

- Developers can call methods before the implementation was downloaded without componentOnReady(), which queues the method calls and resolves after the component has finished loading.

- Interaction with the component is the same whether it still needs to be lazy-loaded, or is already fully hydrated.

- By keeping a component's public API async, apps could move the components transparently to [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) and the API would still be the same.

- Returning a promise is only required for publicly exposed methods which have the `@Method` decorator. All other component methods are private to the component and are not required to be async.


```tsx
// VALID: using async
@Method()
async myMethod() {
  return 42;
}

// VALID: using Promise.resolve()
@Method()
myMethod2() {
  return Promise.resolve(42);
}

// VALID: even if it returns nothing, it needs to be async
@Method()
async myMethod3() {
  console.log(42);
}

// INVALID
@Method()
notOk() {
  return 42;
}
```

## Private methods

Non-public methods can still be used to organize the business logic of your component and they do NOT have to return a Promise.

```tsx
class Component {
  // Since `getData` is not a public method exposed with @Method
  // it does not need to be async
  getData() {
    return this.someData;
  }
  render() {
    return (
      <div>{this.getData()}</div>
    );
  }
}
```
