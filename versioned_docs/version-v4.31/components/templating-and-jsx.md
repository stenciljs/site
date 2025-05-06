---
title: Using JSX
sidebar_label: Using JSX
description: Using JSX
slug: /templating-jsx
---

# Using JSX

Stencil components are rendered using JSX, a popular, declarative template syntax. Each component has a `render` function that returns a tree of components that are rendered to the DOM at runtime.

## Basics

The `render` function is used to output a tree of components that will be drawn to the screen.

```tsx
class MyComponent {
  render() {
    return (
      <div>
        <h1>Hello World</h1>
        <p>This is JSX!</p>
      </div>
    );
  }
}
```

In this example we're returning the JSX representation of a `div`, with two child elements: an `h1` and a `p`.

### Host Element

If you want to modify the host element itself, such as adding a class or an attribute to the component itself, use the `<Host>` functional component. Check for more details [here](./host-element.md)


## Data Binding

Components often need to render dynamic data. To do this in JSX, use `{ }` around a variable:

```tsx
render() {
  return (
    <div>Hello {this.name}</div>
  )
}
```

:::note
If you're familiar with ES6 template variables, JSX variables are very similar, just without the `$`:
:::

```tsx
//ES6
`Hello ${this.name}`

//JSX
Hello {this.name}
```


## Conditionals

If we want to conditionally render different content, we can use JavaScript if/else statements:
Here, if `name` is not defined, we can just render a different element.

```tsx
render() {
  if (this.name) {
    return ( <div>Hello {this.name}</div> )
  } else {
    return ( <div>Hello, World</div> )
  }
}
```

Additionally, inline conditionals can be created using the JavaScript ternary operator:

```tsx
render() {
  return (
    <div>
    {this.name
      ? <p>Hello {this.name}</p>
      : <p>Hello World</p>
    }
    </div>
  );
}
```

**Please note:** Stencil reuses DOM elements for better performance. Consider the following code:

```tsx
{someCondition
  ? <my-counter initialValue={2} />
  : <my-counter initialValue={5} />
}
```

The above code behaves exactly the same as the following code:

```tsx
<my-counter initialValue={someCondition ? 2 : 5} />
```

Thus, if `someCondition` changes, the internal state of `<my-counter>` won't be reset and its lifecycle methods such as `componentWillLoad()` won't fire. Instead, the conditional merely triggers an update to the very same component.

If you want to destroy and recreate a component in a conditional, you can assign the `key` attribute. This tells Stencil that the components are actually different siblings:

```tsx
{someCondition
  ? <my-counter key="a" initialValue={2} />
  : <my-counter key="b" initialValue={5} />
}
```

This way, if `someCondition` changes, you get a new `<my-counter>` component with fresh internal state that also runs the lifecycle methods `componentWillLoad()` and `componentDidLoad()`.


## Slots

Components often need to render dynamic children in specific locations in their component tree, allowing a developer to supply child content when using our component, with our component placing that child component in the proper location.

To do this, you can use the [Slot](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot) tag inside of your `my-component`.

```tsx
// my-component.tsx

render() {
  return (
    <div>
      <h2>A Component</h2>
      <div><slot /></div>
    </div>
  );
}

```

Then, if a user passes child components when creating our component `my-component`, then `my-component` will place that
component inside of the second `<div>` above:

```tsx
render(){
  return(
    <my-component>
      <p>Child Element</p>
    </my-component>
  )
}
```

Slots can also have `name`s to allow for specifying slot output location:

```tsx
// my-component.tsx

render(){
  return [
    <slot name="item-start" />,
    <h1>Here is my main content</h1>,
    <slot name="item-end" />
  ]
}
```

```tsx
render(){
  return(
    <my-component>
      <p slot="item-start">I'll be placed before the h1</p>
      <p slot="item-end">I'll be placed after the h1</p>
    </my-component>
  )
}
```

### Slots Outside Shadow DOM

:::caution
Slots are native to the [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM), but Stencil polyfills
the behavior to work for non-shadow components as well. However, you may encounter issues using slots outside the Shadow DOM especially with
component trees mixing shadow and non-shadow components, or when passing a slot through many levels of components. In many cases, this behavior can
be remedied by wrapping the `slot` in an additional element (like a `div` or `span`) so the Stencil runtime can correctly "anchor" the relocated
content in its new location.
:::

There are known use cases that the Stencil runtime is not able to support:

- Forwarding slotted content to another slot with a different name:<br/>
  It is recommended that slot names stay consistent when slotting content through multiple levels of components. **Avoid** defining slot tags like
  `<slot name="start" slot="main" />`.

## Dealing with Children

The children of a node in JSX correspond at runtime to an array of nodes,
whether they are created by mapping across an array with
[`Array.prototype.map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
or simply declared as siblings directly in JSX. This means that at runtime the
children of the two top-level divs below (`.todo-one` and `.todo-two`) will be
represented the same way:


```tsx
render() {
  return (
    <>
      <div class="todo-one">
        {this.todos.map((todo) => (
          <span>{ todo.taskName }</span>
        )}
      </div>
      <div class="todo-two">
        <span>{ todos[0].taskName }</span>
        <span>{ todos[1].taskName }</span>
      </div>
    </>
  )
}
```

If this array of children is dynamic, i.e., if any nodes may be added,
removed, or reordered, then it's a good idea to set a unique `key` attribute on
each element like so:

```tsx
render() {
  return (
    <div>
      {this.todos.map((todo) => (
        <div key={todo.uid}>
          <div>{todo.taskName}</div>
        </div>
      ))}
    </div>
  )
}
```

When nodes in a children array are rearranged Stencil makes an effort to
preserve DOM nodes across renders but it isn't able to do so in all cases.
Setting a `key` attribute lets Stencil ensure it can match up new and old
children across renders and thereby avoid recreating DOM nodes unnecessarily.

:::caution
Do not use an array index or some other non-unique value as a key. Try to
ensure that each child has a key which does not change and which is unique
among all its siblings.
:::

### Automatic Key Insertion

During compilation Stencil will automatically add key attributes to any JSX
nodes in your component's render method which are not nested within curly
braces. This allows Stencil’s runtime to accurately reconcile children when
their order changes or when a child is conditionally rendered.

For instance, consider a render method looking something like this:

```tsx
  render() {
    return (
      <div>
        { this.disabled && <div id="no-key">no key!</div> }
        <div id="slot-wrapper">
          <slot/>
        </div>
      </div>
    );
  }
```

While it might seem like adding a key attribute to the `#slot-wrapper` div
could help ensure that elements will be matched up correctly when the component
re-renders, this is actually superfluous because Stencil will automatically add
a key to that element when it compiles your component.

:::note
The Stencil compiler can only safely perform automatic key insertion in certain
scenarios where there is no danger of the keys accidentally causing elements to
be considered different when they should be treated the same (or vice versa).

In particular, the compiler will not automatically insert `key` attributes if a
component's `render` method has more than one `return` statement or if it
returns a [conditional
expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator).
Additionally, the compiler will not add key attributes to any JSX which is
found within curly braces (`{ }`).
:::

## Handling User Input

Stencil uses native [DOM events](https://developer.mozilla.org/en-US/docs/Web/Events).

Here's an example of handling a button click. Note the use of the [Arrow function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions).

```tsx
...
export class MyComponent {
  private handleClick = () => {
    alert('Received the button click!');
  }

  render() {
    return (
      <button onClick={this.handleClick}>Click Me!</button>
    );
  }
}
```

Here's another example of listening to input `change`. Note the use of the [Arrow function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions).

```tsx
...
export class MyComponent {
  private inputChanged = (event: Event) => {
    console.log('input changed: ', (event.target as HTMLInputElement).value);
  }

  render() {
    return (
      <input onChange={this.inputChanged}/>
    );
  }
}
```


## Complex Template Content

So far we've seen examples of how to return only a single root element. We can also nest elements inside our root element

In the case where a component has multiple "top level" elements, the `render` function can return an array.
Note the comma in between the `<div>` elements.

```tsx
render() {
  return ([
  // first top level element
  <div class="container">
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ul>
  </div>,

  // second top level element, note the , above
  <div class="another-container">
    ... more html content ...
  </div>
  ]);
}
```

Alternatively you can use the `Fragment` functional component, in which case you won't need to add commas:

```tsx
import { Fragment } from '@stencil/core';
...
render() {
  return (<Fragment>
    // first top level element
    <div class="container">
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ul>
    </div>

    <div class="another-container">
      ... more html content ...
    </div>
  </Fragment>);
}
```

It is also possible to use `innerHTML` to inline content straight into an element. This can be helpful when, for example, loading an svg dynamically and then wanting to render that inside of a `div`. This works just like it does in normal HTML:

```markup
<div innerHTML={svgContent}></div>
```

## Getting a reference to a DOM element

In cases where you need to get a direct reference to an element, like you would normally do with `document.querySelector`, you might want to use a `ref` in JSX. Lets look at an example of using a `ref` in a form:

```tsx
@Component({
  tag: 'app-home',
})
export class AppHome {

  textInput!: HTMLInputElement;

  handleSubmit = (event: Event) => {
    event.preventDefault();
    console.log(this.textInput.value);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Name:
          <input type="text" ref={(el) => this.textInput = el as HTMLInputElement} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}
```

In this example we are using `ref` to get a reference to our input `ref={(el) => this.textInput = el as HTMLInputElement}`. We can then use that ref to do things such as grab the value from the text input directly `this.textInput.value`.


## Avoid Shared JSX Nodes

The renderer caches element lookups in order to improve performance. However, a side effect from this is that the exact same JSX node should not be shared within the same renderer.

In the example below, the `sharedNode` variable is reused multiple times within the `render()` function. The renderer is able to optimize its DOM element lookups by caching the reference, however, this causes issues when nodes are reused. Instead, it's recommended to always generate unique nodes like the changed example below.

```diff
@Component({
  tag: 'my-cmp',
})
export class MyCmp {

  render() {
-    const sharedNode = <div>Text</div>;
    return (
      <div>
-        {sharedNode}
-        {sharedNode}
+        <div>Text</div>
+        <div>Text</div>
      </div>
    );
  }
}
```

Alternatively, creating a factory function to return a common JSX node could be used instead since the returned value would be a unique instance. For example:

```tsx
@Component({
  tag: 'my-cmp',
})
export class MyCmp {

  getText() {
    return <div>Text</div>;
  }

  render() {
    return (
      <div>
        {this.getText()}
        {this.getText()}
      </div>
    );
  }
}
```

## Other Resources

- [Understanding JSX for StencilJS Applications](https://www.joshmorony.com/understanding-jsx-for-stencil-js-applications/)
