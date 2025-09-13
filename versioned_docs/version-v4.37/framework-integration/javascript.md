---
title: Components without a Framework
sidebar_label: JavaScript
description: Components without a Framework
slug: /javascript
---

# Components without a Framework

Integrating a component built with Stencil to a project without a JavaScript framework is straight forward. If you're using a simple HTML page, you can add your component via a script tag. For example, if we published a component to npm, we could load the component through a CDN like this:

```markup
<html>
  <head>
    <script src="https://cdn.jsdelivr.net/npm/@ionic/core/dist/ionic.js"></script>
  </head>
  <body>
    <ion-toggle></ion-toggle>
  </body>
</html>
```

Alternatively, if you wanted to take advantage of ES Modules, you could include the components using an import statement.

```markup
<html>
  <head>
    <script type="module">
      import { defineCustomElements } from 'https://cdn.jsdelivr.net/npm/@ionic/core/loader/index.es2017.mjs';
      defineCustomElements();
    </script>
  </head>
  <body>
    <ion-toggle></ion-toggle>
  </body>
</html>
```

## Passing object props from a non-JSX element

### Setting the prop manually

```tsx
import { Prop } from '@stencil/core';

export class TodoList {
  @Prop() myObject: object;
  @Prop() myArray: Array<string>;
}
```

```markup
<todo-list></todo-list>
<script>
  const todoListElement = document.querySelector('todo-list');
  todoListElement.myObject = {};
  todoListElement.myArray = [];
</script>
```

### Watching props changes

```tsx
import { Prop, State, Watch } from '@stencil/core';

export class TodoList {
  @Prop() myObject: string;
  @Prop() myArray: string;
  @State() myInnerObject: object;
  @State() myInnerArray: Array<string>;

  componentWillLoad() {
    this.parseMyObjectProp(this.myObject);
    this.parseMyArrayProp(this.myArray);
  }

  @Watch('myObject')
  parseMyObjectProp(newValue: string) {
    if (newValue) this.myInnerObject = JSON.parse(newValue);
  }

  @Watch('myArray')
  parseMyArrayProp(newValue: string) {
    if (newValue) this.myInnerArray = JSON.parse(newValue);
  }
}
```

```tsx
<todo-list my-object="{}" my-array="[]"></todo-list>
```
