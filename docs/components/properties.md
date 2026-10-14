---
title: Properties
sidebar_label: Properties
description: Declare a component's public properties and attributes with the Prop decorator
slug: /properties
---

# Properties

Props are the public properties of a component. The code that uses a component sets them, as HTML attributes or as JavaScript properties, to pass it data.

## The Prop Decorator (`@Prop()`)

Declare a prop by decorating a class member with `@Prop()`:

```tsx
import { Component, Prop } from '@stencil/core';

@Component({
  tag: 'todo-list-item',
})
export class ToDoListItem {
  @Prop() thingToDo: string;

  render() {
    return <li>{this.thingToDo}</li>;
  }
}
```

Stencil exposes `thingToDo` as a property on the element, and as an attribute. The attribute name is the property name in dash-case, so the component is used like this in HTML:

```html
<todo-list-item thing-to-do="Learn about Stencil props"></todo-list-item>
```

In TSX, use the property name:

```tsx
<todo-list-item thingToDo="Learn about Stencil props"></todo-list-item>
```

When a prop changes, the component renders again.

## Types

A prop can have any TypeScript type. A value set as a property, from JavaScript or TSX, is used as it is. An attribute is always a string, so Stencil converts it according to the prop's type:

| Prop type | Attribute | Prop value |
| --- | --- | --- |
| `string` | `label="Save"` | `'Save'` |
| `number` | `count="7"` | `7` |
| `number` | `count="abc"` | `NaN` |
| `boolean` | `disabled`, `disabled=""`, `disabled="false"` | `true` |
| `boolean` | no attribute | `undefined`, or the prop's default |
| `any`, or a union that includes `string` | `value="42"` | `'42'` |
| an object or an array | `items='["a"]'` | the string `'["a"]'` |

A boolean prop is `true` whenever its attribute is present, whatever the attribute's value, as with native attributes such as `disabled`. That includes the string `"false"`. To turn a boolean prop off in HTML, leave the attribute out.

### Object and Array Props

Stencil doesn't parse an attribute into an object or an array. Take a list component:

```tsx
import { Component, Prop } from '@stencil/core';

@Component({
  tag: 'todo-list',
})
export class TodoList {
  @Prop() items: string[] = [];

  render() {
    return (
      <ul>
        {this.items.map((item) => (
          <li>{item}</li>
        ))}
      </ul>
    );
  }
}
```

Pass it an array by setting the property, from TSX or from JavaScript:

```tsx
<todo-list items={['Learn about props', 'Write a component']}></todo-list>
```

```js
document.querySelector('todo-list').items = ['Learn about props', 'Write a component'];
```

An `items` attribute in HTML would give the component a string, and `this.items.map` would fail. To accept the attribute as well, add an [`@AttrDeserialize()`](./serialization-deserialization.md) method that turns the string into the value:

```tsx
@AttrDeserialize('items')
parseItems(value: string) {
  return JSON.parse(value);
}
```

```html
<todo-list items='["Learn about props", "Write a component"]'></todo-list>
```

The same method can change how any attribute is converted, whatever the prop's type.

A prop marked optional with `?` is converted in the same way as its type.

## Default Values

Give a prop an initial value to use when none is passed. TypeScript infers the prop's type from it:

```tsx
@Prop() size = 42;
@Prop() variant = 'primary';
```

```html
<!-- size is 42 -->
<my-button></my-button>

<!-- size is 9 -->
<my-button size="9"></my-button>
```

## Required Properties

Place a `!` after a prop's name to mark it as required:

```tsx
@Prop() thingToDo!: string;
```

TSX that uses the component without the prop then fails to type-check, in your own project and in projects that use your component's types. Nothing checks the prop when the component runs. To do that, see [Prop Validation](#prop-validation).

## Prop Validation

To check a prop's value, use the [`@Watch()`](./reactive-data.md#the-watch-decorator-watch) decorator. A watch method runs when the prop changes. Add `immediate: true` to have it check the first value as well:

```tsx
import { Component, Prop, Watch } from '@stencil/core';

@Component({
  tag: 'todo-list-item',
})
export class ToDoListItem {
  @Prop() thingToDo!: string;

  @Watch('thingToDo', { immediate: true })
  validateThingToDo(newValue: string) {
    if (typeof newValue !== 'string' || newValue === '') {
      throw new Error('thingToDo is required and cannot be empty');
    }
  }
}
```

A [setter](#prop-getters-and-setters) can validate a value too, and can also reject or change it.

## @Prop() Options

`@Prop()` takes an optional object of options:

```tsx
export interface PropOptions {
  attribute?: string;
  mutable?: boolean;
  reflect?: boolean;
}
```

### Attribute Name (`attribute`)

Set `attribute` to use an attribute name other than the dash-case form of the property name:

```tsx
@Prop({ attribute: 'complete' }) isComplete: boolean;
```

```html
<todo-list-item complete></todo-list-item>
```

### Prop Mutability

A prop is meant to be set from outside the component. A component can still assign to one of its own props, and the component renders again when it does. In a development build, Stencil logs a warning in the browser console each time:

```
@Prop() "open" on <my-dialog> is immutable but was modified from within the component.
```

If the component is meant to change the prop, such as an `open` prop that the component sets to `false` when it closes itself, declare that with `mutable: true`. The warning goes away:

```tsx
@Prop({ mutable: true }) open = false;

private close = () => {
  this.open = false;
};
```

Stencil compares a prop's old and new values by reference, for props and for [state](./state.md) alike. Changing an array or an object in place leaves the reference the same, so the component doesn't render again. Assign a new array or object instead:

```tsx
// Doesn't render again
this.items.push('Stencil');

// Renders again
this.items = [...this.items, 'Stencil'];
```

### Reflect Properties Values to Attributes (`reflect`)

By default, setting a property doesn't change the element's attributes. Set `reflect: true` to keep the attribute in step with the property, which lets CSS selectors and other code that reads attributes follow the value:

```tsx
@Prop({ reflect: true }) variant = 'primary';
@Prop({ reflect: true }) active = false;
```

```html
<!-- As rendered. The default value of `variant` is reflected. -->
<my-button variant="primary"></my-button>

<!-- After `el.active = true` -->
<my-button variant="primary" active></my-button>
```

A boolean prop is reflected as an attribute with no value when it's `true`, and the attribute is removed when it's `false`.

### Prop Getters and Setters

A `@Prop()` can be a getter, with or without a setter. Use one to validate or transform incoming values, or to expose a read-only property:

```tsx
import { Component, Prop } from '@stencil/core';

@Component({
  tag: 'get-set-props',
})
export class GetSetProps {
  // A read-only prop. Setting it from outside has no effect.
  @Prop()
  get version() {
    return '1.0';
  }

  // A validated prop. Values that aren't allowed are ignored.
  private safeValue: 'this' | 'or maybe this' = 'this';
  @Prop()
  get validatedProp() {
    return this.safeValue;
  }
  set validatedProp(incomingValue: any) {
    if (['this', 'or maybe this'].includes(incomingValue)) {
      this.safeValue = incomingValue;
    }
  }

  // A transformed prop. It accepts a string and stores a Date.
  private dateValue = new Date();
  @Prop()
  get transformedProp() {
    return this.dateValue;
  }
  set transformedProp(incomingValue: string) {
    this.dateValue = new Date(Date.parse(incomingValue));
  }
}
```

The `attribute` and `reflect` options work with these props as well.
