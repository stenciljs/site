---
title: Functional Components
sidebar_label: Functional Components
description: Reusable pieces of JSX, written as plain functions
slug: /functional-components
---

# Functional Components

A functional component is a plain function that takes props and returns JSX. Use one to reuse a piece of markup across your components' `render()` functions, the way you'd pull repeated code out into a helper function:

```tsx
const Hello = (props) => <h1>Hello, {props.name}!</h1>;
```

Render it like any other JSX element, with a capitalized name. Its attributes are passed to the function as `props`:

```tsx
render() {
  return <Hello name="World" />;
}
```

The `<h1>` it returns goes straight into the component's output. There's no `<hello>` element: unlike a class component, a functional component isn't a custom element, so it has no tag, styles, state, or lifecycle methods of its own. Its markup is styled by the component that renders it.

## Typing Props

Use the `FunctionalComponent` type to declare the props a functional component accepts:

```tsx title="src/components/hello.tsx"
import { FunctionalComponent } from '@stencil/core';

interface HelloProps {
  name: string;
}

export const Hello: FunctionalComponent<HelloProps> = ({ name }) => <h1>Hello, {name}!</h1>;
```

JSX that uses `<Hello>` is then type-checked against `HelloProps`.

A functional component returns a single element, or `null`. To return several, wrap them in a fragment (`<>...</>`).

## Children

Children passed to a functional component arrive as its second argument. Render them wherever they should go:

```tsx
const Card: FunctionalComponent<{ heading: string }> = ({ heading }, children) => (
  <>
    <h2>{heading}</h2>
    {children}
  </>
);
```

```tsx
<Card heading="Welcome">
  <p>I'm a child element.</p>
</Card>
```

### Inspecting and Changing Children

The children are Stencil's internal virtual DOM nodes. Their property names are shortened in production builds, so code that reads them directly breaks there. To read or change children, use the `utils` object passed as the third argument instead:

- `utils.forEach(children, cb)` calls `cb` with each child.
- `utils.map(children, cb)` calls `cb` with each child and returns the children it returns.

Each child is given to `cb` in this form:

```ts
interface ChildNode {
  vtag?: string | number | Function | null; // the tag name or functional component; null for text
  vattrs?: any;                      // attributes and props
  vchildren?: VNode[];               // the child's own children
  vtext?: string;                    // the text of a text node
  vkey?: string | number;
  vname?: string;
}
```

This functional component adds a class to each child element, and returns text children unchanged:

```tsx
const AddClass: FunctionalComponent = (_, children, utils) => (
  <>
    {utils.map(children, (child) =>
      child.vtag
        ? {
            ...child,
            vattrs: {
              ...child.vattrs,
              class: [child.vattrs?.class, 'add-class'].filter(Boolean).join(' '),
            },
          }
        : child,
    )}
  </>
);
```

```tsx
<AddClass>
  <p class="intro">First</p>
  <p>Second</p>
  Some text
</AddClass>
// renders <p class="intro add-class">First</p><p class="add-class">Second</p>Some text
```

## Class or Functional Component?

Functional components suit markup you want to reuse inside your own components. Make it a class component instead when it needs any of these:

- its own tag, so it can be used in HTML or by other frameworks
- state, or lifecycle methods
- its own styles, or shadow DOM
