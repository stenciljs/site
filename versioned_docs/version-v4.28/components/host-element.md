---
title: Working with host elements
sidebar_label: Host Element
description: Working with host elements
slug: /host-element
---

# Working with host elements

Stencil components render their children declaratively in their `render` method [using JSX](./templating-and-jsx.md). Most of the time, the `render()` function describes the children elements that are about to be rendered, but it can also be used to render attributes of the host element itself.


## `<Host>`

The `Host` functional component can be used at the root of the render function to set attributes and event listeners to the host element itself. This works just like any other JSX:

```tsx
// Host is imported from '@stencil/core'
import { Component, Host, h } from '@stencil/core';

@Component({tag: 'todo-list'})
export class TodoList {
  @Prop() open = false;
  render() {
    return (
      <Host
        aria-hidden={this.open ? 'false' : 'true'}
        class={{
          'todo-list': true,
          'is-open': this.open
        }}
      />
    )
  }
}
```

If `this.open === true`, it will render:
```tsx
<todo-list class="todo-list is-open" aria-hidden="false"></todo-list>
```

similarly, if `this.open === false`:

```tsx
<todo-list class="todo-list" aria-hidden="true"></todo-list>
```

`<Host>` is a virtual component, a virtual API exposed by stencil to declaratively set the attributes of the host element, it will never be rendered in the DOM, i.e. you will never see `<Host>` in Chrome Dev Tools for instance.


### `<Host>` can work as a `<Fragment>`

`<Host>` can also be used when more than one component needs to be rendered at the root level for example:

It could be achieved by a `render()` method like this:

```tsx
@Component({tag: 'my-cmp'})
export class MyCmp {
  render() {
    return (
      <Host>
        <h1>Title</h1>
        <p>Message</p>
      </Host>
    );
  }
}
```

This JSX would render the following HTML:

```markup
<my-cmp>
  <h1>Title</h1>
  <p>Message</p>
</my-cmp>
```

Even if we don't use `<Host>` to render any attribute in the host element, it's a useful API to render many elements at the root level.

## Element Decorator

The `@Element()` decorator is how to get access to the host element within the class instance. This returns an instance of an `HTMLElement`, so standard DOM methods/events can be used here.

```tsx
import { Element } from '@stencil/core';

...
export class TodoList {

  @Element() el: HTMLElement;

  getListHeight(): number {
    return this.el.getBoundingClientRect().height;
  }
}
```

In order to reference the host element when initializing a class member you'll need to use TypeScript's definite assignment assertion modifier to avoid a 
type error:

```tsx
import { Element } from '@stencil/core';

...
export class TodoList {

  @Element() el!: HTMLElement;

  private listHeight = this.el.getBoundingClientRect().height;
}
```

If you need to update the host element in response to prop or state changes, you should do so in the `render()` method using the `<Host>` element.

## Styling

See full information about styling on the [Styling page](./styling.md#shadow-dom-in-stencil).

CSS can be applied to the `<Host>` element by using its component tag defined in the `@Component` decorator.

```tsx
@Component({
  tag: 'my-cmp',
  styleUrl: 'my-cmp.css'
})
...
```

my-cmp.css:

```css
my-cmp {
  width: 100px;
}
```

### Shadow DOM

Something to beware of is that Styling the `<Host>` element when using shadow DOM does not work quite the same. Instead of using the `my-cmp` element selector you must use `:host`.

```tsx
@Component({
  tag: 'my-cmp',
  styleUrl: 'my-cmp.css',
  shadow: true
})
...
```

my-cmp.css:

```css
:host {
  width: 100px;
}
```
