---
title: Properties
sidebar_label: Properties
description: Properties
slug: /properties
---

# Properties

Props are custom attributes/properties exposed publicly on an HTML element. They allow developers to pass data to a
component to render or otherwise use.

## The Prop Decorator (`@Prop()`)

Props are declared on a component using Stencil's `@Prop()` decorator, like so:

```tsx
// First, we import Prop from '@stencil/core'
import { Component, Prop, h } from '@stencil/core';

@Component({
    tag: 'todo-list',
})
export class TodoList {
    // Second, we decorate a class member with @Prop()
    @Prop() name: string;
    
    render() {
        // Within the component's class, its props are
        // accessed via `this`. This allows us to render
        // the value passed to `todo-list`
        return <div>To-Do List Name: {this.name}</div>
    }
}
```

In the example above, `@Prop()` is placed before (decorates) the `name` class member, which is a string. By adding
`@Prop()` to `name`, Stencil will expose `name` as an attribute on the element, which can be set wherever the component
is used:

```tsx
{/* Here we use the component in a TSX file */}
<todo-list name={"Tuesday's To-Do List"}></todo-list>
```
```html
<!-- Here we use the component in an HTML file -->
<todo-list name="Tuesday's To-Do List"></todo-list>
```

In the example above the `todo-list` component is used almost identically in TSX and HTML. The only difference between
the two is that in TSX, the value assigned to a prop (in this case, `name`) is wrapped in curly braces. In some cases
however, the way props are passed to a component differs slightly between HTML and TSX.

## Variable Casing

In the JavaScript ecosystem, it's common to use 'camelCase' when naming variables. The example component below has a
class member, `thingToDo` that is camelCased.

```tsx
import { Component, Prop, h } from '@stencil/core';

@Component({
    tag: 'todo-list-item',
})
export class ToDoListItem {
    // thingToDo is 'camelCased'
    @Prop() thingToDo: string;

    render() {
        return <div>{this.thingToDo}</div>;
    }
}
```

Since `thingToDo` is a prop, we can provide a value for it when we use our `todo-list-item` component. Providing a
value to a camelCased prop like `thingToDo` is nearly identical in TSX and HTML.

When we use our component in a TSX file, an attribute uses camelCase:

```tsx
<todo-list-item thingToDo={"Learn about Stencil Props"}></todo-list-item>
```

In HTML, the attribute must use 'dash-case' like so:

```html
<todo-list-item thing-to-do="Learn about Stencil Props"></todo-list-item>
```

## Data Flow

Props should be used to pass data down from a parent component to its child component(s).

The example below shows how a `todo-list` component uses three `todo-list-item` child components to render a ToDo list.

```tsx
import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'todo-list',
})
export class TodoList {
  render() {
    return (
      <div>
        <h1>To-Do List Name: Stencil To Do List</h1>
        <ul> 
           {/* Below are three Stencil components that are children of `todo-list`, each representing an item on our list */}
           <todo-list-item thingToDo={"Learn about Stencil Props"}></todo-list-item>
           <todo-list-item thingToDo={"Write some Stencil Code with Props"}></todo-list-item>
           <todo-list-item thingToDo={"Dance Party"}></todo-list-item>
        </ul>
      </div>
    )
  }
}
```
```tsx
import { Component, Prop, h } from '@stencil/core';

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

:::note
Children components should not know about or reference their parent components.  This allows Stencil to
efficiently re-render your components. Passing a reference to a component as a prop may cause unintended side effects.
:::

## Mutability

A Prop is by default immutable from inside the component logic. Once a value is set by a user, the component cannot
update it internally. For more advanced control over the mutability of a prop, please see the 
[mutable option](#prop-mutability-mutable) section of this document.

## Types

Props can be a `boolean`, `number`, `string`, or even an `Object` or `Array`.  The example below expands the 
`todo-list-item` to add a few more props with different types.

```tsx
import { Component, Prop, h } from '@stencil/core';
// `MyHttpService` is an `Object` in this example
import { MyHttpService } from '../some/local/directory/MyHttpService';

@Component({
    tag: 'todo-list-item',
})
export class ToDoListItem {
    @Prop() isComplete: boolean;
    @Prop() timesCompletedInPast: number;
    @Prop() thingToDo: string;
    @Prop() myHttpService: MyHttpService;
}
```

### Boolean Props

A property on a Stencil component that has a type of `boolean` may be declared as:

```tsx
import { Component, Prop, h } from '@stencil/core';

@Component({
    tag: 'todo-list-item',
})
export class ToDoListItem {
    @Prop() isComplete: boolean;
}
```

To use this version of `todo-list-item` in HTML, we pass the string `"true"`/`"false"` to the component:
```html
<!-- Set isComplete to 'true' -->
<todo-list-item is-complete="true"></todo-list-item>
<!-- Set isComplete to 'false' -->
<todo-list-item is-complete="false"></todo-list-item>
```

To use this version of `todo-list-item` in TSX, `true`/`false` is used, surrounded by curly braces:
```tsx
// Set isComplete to 'true'
<todo-list-item isComplete={true}></todo-list-item>
// Set isComplete to 'false'
<todo-list-item isComplete={false}></todo-list-item>
```

There are a few ways in which Stencil treats props that are of type `boolean` that are worth noting:

1. The value of a boolean prop will be `false` if provided the string `"false"` in HTML

```html
<!-- The 'todo-list-item' component will have an isComplete value of `false` -->
<todo-list-item is-complete="false"></todo-list-item>
```
2. The value of a boolean prop will be `true` if provided a string that is not `"false"` in HTML

```html
<!-- The 'todo-list-item' component will have an isComplete value of -->
<!-- `true` for each of the following examples -->
<todo-list-item is-complete=""></todo-list-item>
<todo-list-item is-complete="0"></todo-list-item>
<todo-list-item is-complete="False"></todo-list-item>
```
3. The value of a boolean prop will be `undefined` if it has no [default value](#default-values) and one of
the following applies:
   1. the prop is not included when using the component
   2. the prop is included when using the component, but is not given a value

```html
<!-- Both examples using the 'todo-list-item' component will have an --> 
<!-- isComplete value of `undefined` -->
<todo-list-item></todo-list-item>
<todo-list-item is-complete></todo-list-item>
```

### Number Props

A property on a Stencil component that has a type of `number` may be declared as:

```tsx
import { Component, Prop, h } from '@stencil/core';

@Component({
    tag: 'todo-list-item',
})
export class ToDoListItem {
    @Prop() timesCompletedInPast: number;
}
```

To use this version of `todo-list-item` in HTML, we pass the numeric value as a string to the component:
```html
<!-- Set timesCompletedInPast to '0' -->
<todo-list-item times-completed-in-past="0"></todo-list-item>
<!-- Set timesCompletedInPast to '23' -->
<todo-list-item times-completed-in-past="23"></todo-list-item>
```

To use this version of `todo-list-item` in TSX, a number surrounded by curly braces is passed to the component:
```tsx
// Set timesCompletedInPast to '0'
<todo-list-item timesCompletedInPast={0}></todo-list-item>
// Set timesCompletedInPast to '23'
<todo-list-item timesCompletedInPast={23}></todo-list-item>
```

### String Props

A property on a Stencil component that has a type of `string` may be declared as:

```tsx
import { Component, Prop, h } from '@stencil/core';

@Component({
    tag: 'todo-list-item',
})
export class ToDoListItem {
    @Prop() thingToDo: string;
}
```

To use this version of `todo-list-item` in HTML, we pass the value as a string to the component:
```html
<!-- Set thingToDo to 'Learn about Stencil Props' -->
<todo-list-item thing-to-do="Learn about Stencil Props"></todo-list-item>
<!-- Set thingToDo to 'Write some Stencil Code with Props' -->
<todo-list-item thing-to-do="Write some Stencil Code with Props"></todo-list-item>
```

To use this version of `todo-list-item` in TSX, we pass the value as a string to the component. Curly braces aren't
required when providing string values to props in TSX, but are permitted:
```tsx
// Set thingToDo to 'Learn about Stencil Props'
<todo-list-item thingToDo="Learn about Stencil Props"></todo-list-item>
// Set thingToDo to 'Write some Stencil Code with Props'
<todo-list-item thingToDo="Write some Stencil Code with Props"></todo-list-item>
// Set thingToDo to 'Write some Stencil Code with Props' with curly braces
<todo-list-item thingToDo={"Learn about Stencil Props"}></todo-list-item>
```

### Object Props

A property on a Stencil component that has a type of `Object` may be declared as:

```tsx
// TodoListItem.tsx
import { Component, Prop, h } from '@stencil/core';
import { MyHttpService } from '../path/to/MyHttpService';

@Component({
    tag: 'todo-list-item',
})
export class ToDoListItem {
    // Use `@Prop()` to declare the `httpService` class member
    @Prop() httpService: MyHttpService;
}
```
```tsx
// MyHttpService.ts 
export class MyHttpService {
    // This implementation intentionally left blank
}
```

In TypeScript, `MyHttpService` is both an `Object` and a 'type'. When using user-defined types like `MyHttpService`, the
type must always be exported using the `export` keyword where it is declared. The reason for this is Stencil needs to
know what type the prop `httpService` is when passing an instance of `MyHttpService` to `TodoListItem` from a parent
component.

To set `httpService` in TSX, assign the property name in the custom element's tag to the desired value like so:
```tsx
// TodoList.tsx
import { Component, h } from '@stencil/core';
import { MyHttpService } from '../MyHttpService';

@Component({
   tag: 'todo-list',
   styleUrl: 'todo-list.css',
   shadow: true,
})
export class ToDoList {
   private httpService = new MyHttpService();

   render() {
      return <todo-list-item httpService={this.httpService}></todo-list-item>;
   }
}
```
Note that the prop name is using `camelCase`, and the value is surrounded by curly braces.

It is not possible to set `Object` props via an HTML attribute like so:
```html
<!-- this will not work -->
<todo-list-item http-service="{ /* implementation omitted */ }"></todo-list-item>
```
The reason for this is that Stencil will not attempt to serialize object-like strings written in HTML into a JavaScript object.
Similarly, Stencil does not have any support for deserializing objects from JSON.
Doing either can be expensive at runtime, and runs the risk of losing references to other nested JavaScript objects.

Instead, properties may be set via `<script>` tags in a project's HTML:
```html
<script>
   document.querySelector('todo-list-item').httpService = { /* implementation omitted */ };
</script>
```


### Array Props

A property on a Stencil component that is an Array may be declared as:

```tsx
// TodoList.tsx
import { Component, Prop, h } from '@stencil/core';

@Component({
    tag: 'todo-list-item',
})
export class ToDoListItem {
    @Prop() itemLabels: string[];
}
```

To set `itemLabels` in TSX, assign the prop name in the custom element's tag to the desired value like so:
```tsx
// TodoList.tsx
import { Component, h } from '@stencil/core';
import { MyHttpService } from '../MyHttpService';

@Component({
   tag: 'todo-list',
   styleUrl: 'todo-list.css',
   shadow: true,
})
export class ToDoList {
   private labels = ['non-urgent', 'weekend-only'];

   render() {
      return <todo-list-item itemLabels={this.labels}></todo-list-item>;
   }
}
```
Note that the prop name is using `camelCase`, and the value is surrounded by curly braces.

It is not possible to set `Array` props via an HTML attribute like so:
```html
<!-- this will not work -->
<todo-list-item item-labels="['non-urgent', 'weekend-only']"></todo-list-item>
```
The reason for this is that Stencil will not attempt to serialize array-like strings written in HTML into a JavaScript object.
Doing so can be expensive at runtime, and runs the risk of losing references to other nested JavaScript objects.

Instead, properties may be set via `<script>` tags in a project's HTML:
```html
<script>
   document.querySelector('todo-list-item').itemLabels = ['non-urgent', 'weekend-only'];
</script>
```

### Advanced Prop Types

#### `any` Type

TypeScript's [`any` type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any) is a special type
that may be used to prevent type checking of a specific value. Because `any` is a valid type in TypeScript, Stencil
props can also be given a type of `any`. The example below demonstrates three different ways of using props with type
`any`:

```tsx
import { Component, Prop, h } from '@stencil/core';

@Component({
    tag: 'todo-list-item',
})
export class ToDoListItem {
    // isComplete has an explicit type annotation
    // of `any`, and no default value
    @Prop() isComplete: any;
    // label has an explicit type annotation of
    // `any` with a default value of 'urgent',
    // which is a string
    @Prop() label: any = 'urgent';
    // thingToDo has no type and no default value,
    // and will be considered to be type `any` by
    // TypeScript
    @Prop() thingToDo;

    render() {
        return (
            <ul>
                <li>isComplete has a value of - {this.isComplete} - and a typeof value of "{typeof this.isComplete}"</li>
                <li>label has a value of - {this.label} - and a typeof value of "{typeof this.label}"</li>
                <li>thingToDo has a value of - {this.thingToDo} - and a typeof value of "{typeof this.thingToDo}"</li>
            </ul>
        );
    }
}
```

When using a Stencil prop typed as `any` (implicitly or explicitly), the value that is provided to a prop retains its
own type information. Neither Stencil nor TypeScript will try to change the type of the prop. To demonstrate, let's use
`todo-list-item` twice, each with different prop values:

```tsx
{/* Using todo-list-item in TSX using differnt values each time */}
<todo-list-item isComplete={42} label={null} thingToDo={"Learn about any-typed props"}></todo-list-item>
<todo-list-item isComplete={"42"} label={1} thingToDo={"Learn about any-typed props"}></todo-list-item>
```

The following will be rendered from the usage example above: 
```md
- isComplete has a value of - 42 - and a typeof value of "number" 
- label has a value of -  - and a typeof value of "object"
- thingToDo has a value of - Learn about any-typed props - and a typeof value of "string"

- isComplete has a value of - 42 - and a typeof value of "string"
- label has a value of - 1 - and a typeof value of "number"
- thingToDo has a value of - Learn about any-typed props - and a typeof value of "string"
```

In the first usage of `todo-list-item`, `isComplete` is provided a number value of 42, whereas in the second usage it 
receives a string containing "42". The types on `isComplete` reflect the type of the value it was provided, 'number' and
'string', respectively.

Looking at `label`, it is worth noting that although the prop has a [default value](#default-values), it does
not narrow the type of `label` to be of type 'string'. In the first usage of `todo-list-item`, `label` is provided a
value of null, whereas in the second usage it receives a number value of 1. The types of the values stored in `label`
are correctly reported as 'object' and 'number', respectively.

#### Optional Types

TypeScript allows members to be marked optional by appending a `?` at the end of the member's name. The example below
demonstrates making each a component's props optional:

```tsx
import { Component, Prop, h } from '@stencil/core';

@Component({
    tag: 'todo-list-item',
})
export class ToDoListItem {
    // completeMsg is optional, has an explicit type
    // annotation of `string`, and no default value
    @Prop() completeMsg?: string;
    // label is optional, has no explicit type
    // annotation, but does have a default value
    // of 'urgent'
    @Prop() label? = 'urgent';
    // thingToDo has no type annotation and no 
    // default value
    @Prop() thingToDo?;

    render() {
        return (
            <ul>
                <li>completeMsg has a value of - {this.completeMsg} - and a typeof value of "{typeof this.completeMsg}"</li>
                <li>label has a value of - {this.label} - and a typeof value of "{typeof this.label}"</li>
                <li>thingToDo has a value of - {this.thingToDo} - and a typeof value of "{typeof this.thingToDo}"</li>
            </ul>
        );
    }
}
```

When using a Stencil prop that is marked as optional, Stencil will try to infer the type of the prop if a type is
not explicitly given.  In the example above, Stencil is able to understand that:

- `completeMsg` is of type string, because it has an explicit type annotation
- `label` is of type string, because it has a [default value](#default-values) that is of type string
- `thingToDo` [is of type `any`](#any-type), because it has no explicit type annotation, nor default value

Because Stencil can infer the type of `label`, the following will fail to compile due to a type mismatch:

```tsx
{/* This fails to compile with the error "Type 'number' is not assignable to type 'string'" for the label prop. */}
<todo-list-item completeMsg={"true"} label={42} thingToDo={"Learn about any-typed props"}></todo-list-item>
```

It is worth noting that when using a component in an HTML file, such type checking is unavailable. This is a constraint
on HTML, where all values provided to attributes are of type string:

```html
<!-- using todo-list-item in HTML -->
<todo-list-item complete-msg="42" label="null" thing-to-do="Learn about any-typed props"></todo-list-item>
```
renders:
```md
- completeMsg has a value of - 42 - and a typeof value of "string"
- label has a value of - null - and a typeof value of "string"
- thingToDo has a value of - Learn about any-typed props - and a typeof value of "string"
```

#### Union Types

Stencil allows props types be [union types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types),
which allows you as the developer to combine two or more pre-existing types to create a new one. The example below shows
a `todo-list-item` who accepts a `isComplete` prop that can be either a string or boolean.

```tsx
import { Component, Prop, h } from '@stencil/core';

@Component({
    tag: 'todo-list-item',
})
export class ToDoListItem {
    @Prop() isComplete: string | boolean;
}
```

This component can be used in both HTML:
```html
<todo-list-item is-complete="true"></todo-list-item>
<todo-list-item is-complete="false"></todo-list-item>
<todo-list-item is-complete></todo-list-item>
<todo-list-item></todo-list-item>
```
and TSX:
```tsx
<todo-list-item isComplete={true}></todo-list-item>
<todo-list-item isComplete={false}></todo-list-item>
```

When using union types, the type of a component's `@Prop()` value can be ambiguous at runtime.
In the provided example, under what circumstances does `@Prop() isComplete` function as a `string`, and when does it serve as a `boolean`?

When using a component in HTML, the runtime value of a `@Prop()` is a string whenever an attribute is set.
This is a result of setting the HTML attribute for the custom element.
```html
<!-- Since this is HTML, the value of `isComplete` in `ToDoListItem` will be a string -->

<!-- Set isComplete to "true". -->
<todo-list-item is-complete="true"></todo-list-item>
<!-- Set isComplete to "false" -->
<todo-list-item is-complete="false"></todo-list-item>
<!-- Set isComplete to "" -->
<todo-list-item is-complete></todo-list-item>
```
However, if an attribute is not specified, the runtime value of the property will be `undefined`:
```html
<!-- Since `is-complete` is omitted, the value of `isComplete` in `ToDoListItem` will be `undefined` -->
<todo-list-item></todo-list-item>
```

When the attribute on a component is set using `setAttribute`, the runtime value of a `@Prop()` is always [coerced to a string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#string_coercion).
```html
<script>
  // both of these `setAttribute` calls set the property `isComplete` to "true" (string)
  document.querySelector('todo-list-item').setAttribute('is-complete', true);
  document.querySelector('todo-list-item').setAttribute('is-complete', "true");
  // both of these `setAttribute` calls set the property `isComplete` to "false" (string)
  document.querySelector('todo-list-item').setAttribute('is-complete', false);
  document.querySelector('todo-list-item').setAttribute('is-complete', "false");
</script>
```

However, if the property of a custom element is directly changed, its type will match the value that was provided. 
```html
<script>
  // Set the property `isComplete` to `true` (boolean)
  document.querySelector('todo-list-item').isComplete = true;
  // Set the property `isComplete` to "true" (string)
  document.querySelector('todo-list-item').isComplete = "true";
  // Set the property `isComplete` to `false` (boolean)
  document.querySelector('todo-list-item').isComplete = false;
  // Set the property `isComplete` to "false" (string)
  document.querySelector('todo-list-item').isComplete = "false";
</script>
```

When using a component in TSX, a `@Prop()`'s type will match the value that was provided.
```tsx
// Since this is TSX, the value of `isComplete` in `ToDoListItem`
// depends on the type of the value passed to the component.
//
// Set the property `isComplete` to `true` (boolean)
<todo-list-item isComplete={true}></todo-list-item>
// Set the property `isComplete` to "true" (string)
<todo-list-item isComplete={"true"}></todo-list-item>
// Set the property `isComplete` to `false` (boolean)
<todo-list-item isComplete={false}></todo-list-item>
// Set the property `isComplete` to "false" (string)
<todo-list-item isComplete={"false"}></todo-list-item>
```

## Default Values

Stencil props can be given a default value as a fallback in the event a prop is not provided:

```tsx
import { Component, Prop, h } from '@stencil/core';

@Component({
    tag: 'component-with-some-props',
})
export class ComponentWithSomeProps {
    @Prop() aNumber = 42;
    @Prop() aString = 'defaultValue';

    render() {
        return <div>The number is {this.aNumber} and the string is {this.aString}</div>
    }
}
```
Regardless of if we use this component in HTML or TSX, "The number is 42 and the string is defaultValue" is displayed
when no values are passed to our component:
```html
<component-with-some-props></component-with-some-props>
```

The default values on a component can be overridden by specifying a value for a prop with a default value. For the
example below, "The number is 7 and the string is defaultValue" is rendered. Note how the value provided to `aNumber`
overrides the default value, but the default value of `aString` remains the same:
```html
<component-with-some-props a-number="7"></component-with-some-props>
```

### Inferring Types from Default Values

When a default value is provided, Stencil is able to infer the type of the prop from the default value:

```tsx
import { Component, Prop, h } from '@stencil/core';
@Component({
    tag: 'component-with-many-props',
})
export class ComponentWithManyProps {
    // both props below are of type 'boolean'
    @Prop() boolean1: boolean;
    @Prop() boolean2 = true;

    // both props below are of type 'number'
    @Prop() number1: number;
    @Prop() number2 = 42;
    
    // both props below are of type 'string'
    @Prop() string1: string;
    @Prop() string2 = 'defaultValue';
}
```

## Required Properties

By placing a `!` after a prop name, Stencil mark that the attribute/property as required. This ensures that when the
component is used in TSX, the property is used:

```tsx
import { Component, Prop, h } from '@stencil/core';

@Component({
   tag: 'todo-list-item',
})
export class ToDoListItem {
   // Note the '!' after the variable name.
   @Prop() thingToDo!: string;
}
```

## Prop Validation

To do validation of a Prop, you can use the [@Watch()](./reactive-data.md#the-watch-decorator-watch) decorator:

```tsx
import { Component, Prop, Watch, h } from '@stencil/core';

@Component({
   tag: 'todo-list-item',
})
export class TodoList {
  // Mark the prop as required, to make sure it is provided when we use `todo-list-item`.
  // We want stricter guarantees around the contents of the string, so we'll use `@Watch` to perform additional validation.
  @Prop() thingToDo!: string;

  @Watch('thingToDo')
  validateName(newValue: string, _oldValue: string) {
    // don't allow `thingToDo` to be the empty string  
    const isBlank = typeof newValue !== 'string' || newValue === '';
    if (isBlank) { 
        throw new Error('thingToDo is a required property and cannot be empty') 
    };
    // don't allow `thingToDo` to be a string with a length of 1
    const has2chars = typeof newValue === 'string' && newValue.length >= 2;
    if (!has2chars) {
       throw new Error('thingToDo must have a length of more than 1 character')
    };
  }
}
```

Alternatively, you could do validation within a setter. [Read about using `get()` / `set()` methods with decorated props](#prop-getters-and-setters)

## @Prop() Options

The `@Prop()` decorator accepts an optional argument to specify certain options to modify how a prop on a component
behaves. `@Prop()`'s optional argument is an object literal containing one or more of the following fields: 

```tsx
export interface PropOptions {
  attribute?: string;
  mutable?: boolean;
  reflect?: boolean;
}
```

### Attribute Name (`attribute`)

Properties and component attributes are strongly connected but not necessarily the same thing. While attributes are an
HTML concept, properties are a JavaScript concept inherent to Object-Oriented Programming.

In Stencil, the `@Prop()` decorator applied to a **property** will instruct the Stencil compiler to also listen for
changes in a DOM attribute.

Usually, the name of a property is the same as the attribute, but this is not always the case. Take the following
component as example:

```tsx
import { Component, Prop, h } from '@stencil/core';
// `MyHttpService` is an `Object` in this example
import { MyHttpService } from '../some/local/directory/MyHttpService';

@Component({
   tag: 'todo-list-item',
})
export class ToDoListItem {
   @Prop() isComplete: boolean;
   @Prop() thingToDo: string;
   @Prop() httpService: MyHttpService;
}
```

This component has **3 properties**, but the compiler will create **only 2 attributes**: `is-complete` and
`thing-to-do`.

```html
<todo-list-item is-complete="false" thing-to-do="Read Attribute Naming Section of Stencil Docs"></todo-list-item>
```

Notice that the `httpService` type is not a primitive (e.g. not a `number`, `boolean`, or `string`). Since DOM
attributes can only be strings, it does not make sense to have an associated DOM attribute called `"http-service"`.
Stencil will not attempt to serialize object-like strings written in HTML into a JavaScript object.
See [Object Props](#object-props) for guidance as to how to configure `httpService`.

At the same time, the `isComplete` & `thingToDo` properties follow 'camelCase' naming, but attributes are 
case-insensitive, so the attribute names will be `is-complete` & `thing-to-do` by default.

Fortunately, this "default" behavior can be changed using the `attribute` option of the `@Prop()` decorator:

```tsx
import { Component, Prop, h } from '@stencil/core';
// `MyHttpService` is an `Object` in this example
import { MyHttpService } from '../some/local/directory/MyHttpService';

@Component({
   tag: 'todo-list-item',
})
export class ToDoListItem {
   @Prop({ attribute: 'complete' }) isComplete: boolean;
   @Prop({ attribute: 'thing' }) thingToDo: string;
   @Prop({ attribute: 'my-service' }) httpService: MyHttpService;
}
```

By using this option, we are being explicit about which properties have an associated DOM attribute and the name of it
when using the component in HTML.

```html
<todo-list-item complete="false" thing="Read Attribute Naming Section of Stencil Docs" my-service="{}"></todo-list-item>
```

### Prop Mutability (`mutable`)

A Prop is by default immutable from inside the component logic.
However, it's possible to explicitly allow a Prop to be mutated from inside the component, by declaring it as mutable, as in the example below:

```tsx
import { Component, Prop, h } from '@stencil/core';

@Component({
   tag: 'todo-list-item',
})
export class ToDoListItem {
   @Prop({ mutable: true }) thingToDo: string;

   componentDidLoad() {
      this.thingToDo = 'Ah! A new value!';
   }
}
```

#### Mutable Arrays and Objects

Stencil compares Props by reference in order to efficiently rerender components.
Setting `mutable: true` on a Prop that is an object or array allows the _reference_ to the Prop to change inside the component and trigger a render.
It does not allow a mutable change to an existing object or array to trigger a render. 

For example, to update an array Prop:

```tsx
import { Component, Prop, h } from '@stencil/core';

@Component({
   tag: 'my-component',
})
export class MyComponent {
   @Prop({mutable: true}) contents: string[] = [];
   timer: NodeJS.Timer;

   connectedCallback() {
      this.timer = setTimeout(() => {
         // this does not create a new array. when stencil
         // attempts to see if any of its Props have changed,
         // it sees the reference to its `contents` Prop is
         // the same, and will not trigger a render
         
         // this.contents.push('Stencil')
         
         // this does create a new array, and therefore a
         // new reference to the Prop. Stencil will pick up
         // this change and rerender
         this.contents = [...this.contents, 'Stencil'];
         // after 3 seconds, the component will re-render due
         // to the reference change in `this.contents`
      }, 3000);
   }

   disconnectedCallback() {
      if (this.timer) {
         clearTimeout(this.timer);
      }
   }

   render() {
      return <div>Hello, World! I'm {this.contents[0]}</div>;
   }
}
```

In the example above, updating the Prop in place using `this.contents.push('Stencil')` would have no effect.
Stencil does not see the change to `this.contents`, since it looks at the _reference_ of the Prop, and sees that it has not changed.
This is done for performance reasons.
If Stencil had to walk every slot of the array to determine if it changed, it would incur a performance hit.
Rather, it is considered better for performance and more idiomatic to re-assign the Prop (in the example above, we use the spread operator).

The same holds for objects as well.
Rather than mutating an existing object in-place, a new object should be created using the spread operator. This object will be different-by-reference and therefore will trigger a re-render:  


```tsx
import { Component, Prop, h } from '@stencil/core';

export type MyContents = {name: string};

@Component({
   tag: 'my-component',
})
export class MyComponent {
   @Prop({mutable: true}) contents: MyContents;
   timer: NodeJS.Timer;

   connectedCallback() {
      this.timer = setTimeout(() => {
         // this does not create a new object. when stencil
         // attempts to see if any of its Props have changed,
         // it sees the reference to its `contents` Prop is
         // the same, and will not trigger a render

         // this.contents.name = 'Stencil';

         // this does create a new object, and therefore a
         // new reference to the Prop. Stencil will pick up
         // this change and rerender
         this.contents = {...this.contents, name: 'Stencil'};
         // after 3 seconds, the component will re-render due
         // to the reference change in `this.contents`
      }, 3000);
   }

   disconnectedCallback() {
      if (this.timer) {
         clearTimeout(this.timer);
      }
   }

   render() {
      return <div>Hello, World! I'm {this.contents.name}</div>;
   }
}
```

### Reflect Properties Values to Attributes (`reflect`)

In some cases it may be useful to keep a Prop in sync with an attribute. In this case you can set the `reflect` option
in the `@Prop()` decorator to `true`. When a prop is reflected, it will be rendered in the DOM as an HTML attribute.

Take the following component as example:

```tsx
import { Component, Prop, h } from '@stencil/core';

@Component({
    tag: 'todo-list-item',
})
export class ToDoListItem {
    @Prop({ reflect: false }) isComplete: boolean = false;
    @Prop({ reflect: true }) timesCompletedInPast: number = 2;
    @Prop({ reflect: true }) thingToDo: string = "Read Reflect Section of Stencil Docs";
}
```

The component in the example above uses [default values](#default-values), and can be used in HTML like so:
```html
<!-- Example of using todo-list-item in HTML -->
<todo-list-item></todo-list-item>
```

When rendered in the DOM, the properties configured with `reflect: true` will be reflected in the DOM:

```html
<todo-list-item times-completed-in-past="2" thing-to-do="Read Reflect Section of Stencil Docs" ></todo-list-item>
```

While the properties not set to "reflect", such as `isComplete`, are not rendered as attributes, it does not mean it's
not there - the `isComplete` property still contains the `false` value as assigned:

```tsx
const cmp = document.querySelector('todo-list-item');
console.log(cmp.isComplete); // it prints 'false'
```

### Prop Getters and Setters

`@Prop` decorated members can additionally be used with `get()` and `set()` methods which can be useful for validation 
([as an alternative to using a @Watch decorator](#prop-validation)), transforming incoming-data or exposing read-only properties. 

```tsx
import { Component, Prop, h } from '@stencil/core';

@Component({
    tag: 'get-set-props',
})
export class GetSetProps {
    // A read-only prop
    private internalValue = 'should not change';
    @Prop()
    get readOnlyProp { return this.internalValue; }

    // A validated prop
    private safeValue: 'this' | 'or maybe this' = 'this';
    @Prop()
    get validatedProp {
      return this.safeValue;
    }
    set validatedProp (incomingDodgyValue: any) {
      if (['this', 'or maybe this'].includes(incomingDodgyValue)) {
        this.safeValue = incomingDodgyValue;
      }
    }

    private dateValue: Date = new Date();
    // A transformed prop
    @Prop()
    get transformedProp {
      return this.dateValue;
    }
    set transformedProp (incomingStringVal: string) {
      this.dateValue = new Date(Date.parse(incomingStringVal));
    }
}
```

Most of the documentation referring to [types](#types) and [options](#prop-options) also apply to get / set `@Prop`s 
(with the exception of [mutable](#prop-mutability-mutable) as this makes little logical sense).

:::note
When using the [dist / 'lazy' output target](../output-targets/dist.md), a known limitation is if an initial value 
is set (via an attribute e.g. `<my-cmp attr="initial">`) in-order to 'hit' the set() method, Stencil can only do so 
*after* lazily fetching / loading the class component. This means one initial render / tick before being able to set the incoming, initial value.

This limitation does not exist on the [custom-elements output-target](../output-targets/custom-elements.md).
:::
