---
title: Components without a Framework
sidebar_label: JavaScript
description: Using Stencil components in plain HTML and JavaScript
slug: /javascript
---

# Components without a Framework

Stencil components are standard custom elements, so a page with no framework can use them like any built-in HTML element.

## Loading the Components

For a plain HTML page, load the library's [`loader-bundle`](../output-targets/main/loader-bundle.md) with a script tag, for example from a CDN. It registers every component and fetches each one's code when it first appears on the page:

```html
<html>
  <head>
    <script
      type="module"
      src="https://cdn.jsdelivr.net/npm/my-library@1.0.0/dist/loader-bundle/my-library/my-library.js"
    ></script>
  </head>
  <body>
    <my-button variant="primary">Save</my-button>
  </body>
</html>
```

In a project with a bundler, import the components instead. See [Consuming Your Library](../guides/distribution/publishing.md#consuming-your-library) for both approaches.

## Setting Props

Attributes can only carry strings. Use them for strings, numbers, and booleans:

```html
<my-button variant="primary" disabled></my-button>
```

Set objects, arrays, and functions as properties in JavaScript:

```html
<todo-list></todo-list>

<script>
  const todoList = document.querySelector('todo-list');
  todoList.items = [{ text: 'Write docs', done: true }];
</script>
```

This works even if the script runs before the component has loaded. Stencil picks up the value once the component is ready.

A component can also accept this kind of data from an attribute, by parsing it with [`@AttrDeserialize()`](../components/serialization-deserialization.md#the-attrdeserialize-decorator-attrdeserialize).

## Listening to Events

A component's [custom events](../components/events.md) are ordinary DOM events. Listen with `addEventListener()`, and read the data from `event.detail`:

```js
const todoList = document.querySelector('todo-list');

todoList.addEventListener('todoCompleted', (event) => {
  console.log(event.detail);
});
```

## Calling Methods

A component's [public methods](../components/methods.md) exist once the component is defined, and always return a promise:

```js
await customElements.whenDefined('todo-list');

const todoList = document.querySelector('todo-list');
await todoList.showPrompt();
```
