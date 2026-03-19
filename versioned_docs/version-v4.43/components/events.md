---
title: Events
sidebar_label: Events
description: Events
slug: /events
---

# Events

There is **NOT** such a thing as *stencil events*, instead, Stencil encourages the use of [DOM events](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events).
However, Stencil does provide an API to specify the events a component can emit, and the events a component listens to. It does so with the `Event()` and `Listen()` decorators.

## Event Decorator

Components can emit data and events using the Event Emitter decorator.

To dispatch [Custom DOM events](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events) for other components to handle, use the `@Event()` decorator.

```tsx
import { Event, EventEmitter } from '@stencil/core';

...
export class TodoList {

  @Event() todoCompleted: EventEmitter<Todo>;

  todoCompletedHandler(todo: Todo) {
    this.todoCompleted.emit(todo);
  }
}
```

The code above will dispatch a custom DOM event called `todoCompleted`.

The `Event(opts: EventOptions)` decorator optionally accepts an options object to shape the behavior of dispatched events. The options and defaults are described below.

```tsx
export interface EventOptions {
  /**
   * A string custom event name to override the default.
   */
  eventName?: string;
  /**
   * A Boolean indicating whether the event bubbles up through the DOM or not.
   */
  bubbles?: boolean;

  /**
   * A Boolean indicating whether the event is cancelable.
   */
  cancelable?: boolean;

  /**
   * A Boolean value indicating whether or not the event can bubble across the boundary between the shadow DOM and the regular DOM.
   */
  composed?: boolean;
}
```

Example:

```tsx
import { Event, EventEmitter } from '@stencil/core';

...
export class TodoList {

  // Event called 'todoCompleted' that is "composed", "cancellable" and it will bubble up!
  @Event({
    eventName: 'todoCompleted',
    composed: true,
    cancelable: true,
    bubbles: true,
  }) todoCompleted: EventEmitter<Todo>;

  todoCompletedHandler(todo: Todo) {
    const event = this.todoCompleted.emit(todo);
    if(!event.defaultPrevented) {
      // if not prevented, do some default handling code
    }
  }
}
```

:::note
In the case where the Stencil `Event` type conflicts with the native web `Event` type, there are two possible solutions:

1. Import aliasing:
```tsx
import { Event as StencilEvent, EventEmitter } from '@stencil/core';

@StencilEvent() myEvent: EventEmitter<{value: string, ev: Event}>;
```

2. Namespace the native web `Event` type with `globalThis`:
```tsx
@Event() myEvent: EventEmitter<{value: string, ev: globalThis.Event}>;
```
:::

## Listen Decorator

The `Listen()` decorator is for listening to DOM events, including the ones dispatched from `@Events`. The event listeners are automatically added and removed when the component gets added or removed from the DOM.

In the example below, assume that a child component, `TodoList`, emits a `todoCompleted` event using the `EventEmitter`.

```tsx
import { Listen } from '@stencil/core';

...
export class TodoApp {

  @Listen('todoCompleted')
  todoCompletedHandler(event: CustomEvent<Todo>) {
    console.log('Received the custom todoCompleted event: ', event.detail);
  }
}
```

### Listen's options

The `@Listen(eventName, opts?: ListenOptions)` includes a second optional argument that can be used to configure how the DOM event listener is attached.

```tsx
export interface ListenOptions {
  target?: 'body' | 'document' | 'window';
  capture?: boolean;
  passive?: boolean;
}
```

The available options are `target`, `capture` and `passive`:


#### target

Handlers can also be registered for an event other than the host itself.
The `target` option can be used to change where the event listener is attached, this is useful for listening to application-wide events.

In the example below, we're going to listen for the scroll event, emitted from `window`:

```tsx
  @Listen('scroll', { target: 'window' })
  handleScroll(ev) {
    console.log('the body was scrolled', ev);
  }
```

#### passive

By default, Stencil uses several heuristics to determine if it must attach a `passive` event listener or not. The `passive` option can be used to change the default behavior.

Please check out [https://developers.google.com/web/updates/2016/06/passive-event-listeners](https://developers.google.com/web/updates/2016/06/passive-event-listeners) for further information.


#### capture

Event listener attached with `@Listen` does not "capture" by default.
When a event listener is set to "capture", it means the event will be dispatched during the "capture phase".
Check out [https://www.quirksmode.org/js/events_order.html](https://www.quirksmode.org/js/events_order.html) for further information.


```tsx
  @Listen('click', { capture: true })
  handleClick(ev) {
    console.log('click');
  }
```

## Keyboard events

For keyboard events, you can use the standard `keydown` event in `@Listen()` and use `event.keyCode` or `event.which` to get the key code, or `event.key` for the string representation of the key.

```tsx
@Listen('keydown')
handleKeyDown(ev: KeyboardEvent){
  if (ev.key === 'ArrowDown'){
    console.log('down arrow pressed')
  }
}
```
More info on event key strings can be found in the [w3c spec](https://www.w3.org/TR/uievents-key/#named-key-attribute-values).


## Using events in JSX

Within a stencil compiled application or component you can also bind listeners to events directly in JSX. This works very similar to normal DOM events such as `onClick`.

Let's use our TodoList component from above:

```tsx
import { Event, EventEmitter } from '@stencil/core';

...
export class TodoList {

  @Event() todoCompleted: EventEmitter<Todo>;

  todoCompletedHandler(todo: Todo) {
    this.todoCompleted.emit(todo);
  }
}
```

We can now listen to this event directly on the component in our JSX using the following syntax:

```tsx
<todo-list onTodoCompleted={ev => this.someMethod(ev)} />
```

This property is generated automatically and is prefixed with "on". For example, if the event emitted is called `todoDeleted` the property will be called `onTodoDeleted`:

```tsx
<todo-list onTodoDeleted={ev => this.someOtherMethod(ev)} />
```

## Listening to events from a non-JSX element

```tsx
<todo-list></todo-list>
<script>
  const todoListElement = document.querySelector('todo-list');
  todoListElement.addEventListener('todoCompleted', event => { /* your listener */ })
</script>
```
