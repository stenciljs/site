---
title: Component Decorator
sidebar_label: Component
description: Documentation for the @Component decorator
slug: /component
---

# Component Decorator

`@Component()` is a decorator that designates a TypeScript class as a Stencil component.
Every Stencil component gets transformed into a web component at build time.

```tsx
import { Component } from '@stencil/core';

@Component({
  tag: 'todo-list',
  // additional options
})
export class TodoList {
  // implementation omitted
}
```

## Component Options

The `@Component()` decorator takes one argument, an object literal containing configuration options for the component.
This allows each component to be individually configured to suit the unique needs of each project.

Each option, its type, and whether it's required is described below.

### tag

**Required**

**Type: `string`**

**Details:**<br/>
This value sets the name of the custom element that Stencil will generate.
To adhere to the [HTML spec](https://html.spec.whatwg.org/#valid-custom-element-name), the tag name must contain a dash ('-').

Ideally, the tag name is a globally unique value.
Having a globally unique value helps prevent naming collisions with the global `CustomElementsRegistry`, where all custom elements are defined.
It's recommended to choose a unique prefix for all your components within the same collection.

**Example**:<br/>
```tsx
import { Component } from '@stencil/core';

@Component({
  tag: 'todo-list',
})
export class TodoList {
  // implementation omitted
}
```
After compilation, the component defined in `TodoList` can be used in HTML or another TSX file:
```html
<!-- Here we use the component in an HTML file -->
<todo-list></todo-list>
```
```tsx
{/* Here we use the component in a TSX file */}
<todo-list></todo-list>
```

### assetsDirs

**Optional**

**Type: `string[]`**

**Details:**<br/>
`assetsDirs` is an array of relative paths from the component to a directory containing the static files (assets) the component requires.

**Example**:<br/>
Below is an example project's directory structure containing an example component and assets directory.

```
src/
└── components/
    ├── assets/
    │   └── sunset.jpg
    └── todo-list.tsx
```

Below, the `todo-list` component will correctly load the `sunset.jpg` image from the `assets/` directory, using Stencil's [`getAssetPath()`](../guides/assets.md#getassetpath).

```tsx
import { Component, Prop, getAssetPath, h } from '@stencil/core';

@Component({
  tag: 'todo-list',
  // 1. assetsDirs lists the 'assets' directory as a relative (sibling)
  // directory
  assetsDirs: ['assets']
})
export class TodoList {
  image = "sunset.jpg";

  render() {
    // 2. the asset path is retrieved relative to the asset base path to use in
    // the <img> tag
    const imageSrc = getAssetPath(`./assets/${this.image}`);
    return <img src={imageSrc} />
  }
}
```

In the example above, the following allows `todo-list` to display the provided asset:
1. The `TodoList`'s `@Component()` decorator has the `assetsDirs` property, and lists the file's sibling directory, `assets/`.
   This will copy the `assets` directory over to the distribution directory.
2. Stencil's [`getAssetPath()`](../guides/assets.md#getassetpath) is used to retrieve the path to the image to be used in the `<img>` tag

For more information on configuring assets, please see Stencil's [Assets Guide](../guides/assets.md)


### encapsulation

**Optional**

**Type:**
```tsx
type Encapsulation =
  | {
      type: 'shadow';
      mode?: 'open' | 'closed';
      delegatesFocus?: boolean;
      slotAssignment?: 'manual' | 'named';
      clonable?: boolean;
      serializable?: boolean;
    }
  | { type: 'scoped'; patches?: ('all' | 'children' | 'clone' | 'insert')[] }
  | { type: 'none'; patches?: ('all' | 'children' | 'clone' | 'insert')[] };
```

**Default: `{ type: 'none' }`**

**Details:**<br/>
`encapsulation` controls how a component's styles and DOM are isolated from the rest of the page. Stencil supports three encapsulation types:

- `shadow`: uses the browser's native [Shadow DOM](./styling.md#shadow-dom). Styles and internal markup are fully isolated from the rest of the page.
- `scoped`: uses [scoped CSS](./styling.md#scoped-css). Stencil appends a unique data attribute to your styles so they don't leak out, but the component's DOM stays in the light DOM and light-DOM styles can still leak in.
- `none` (default): no style encapsulation. The component's markup and styles behave like any other element on the page.

**Shadow DOM options** (`type: 'shadow'`):

- `mode`: `'open'` (default) or `'closed'`. A closed shadow root can't be reached from `element.shadowRoot` outside the component.
- `delegatesFocus`: [provides focus](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/delegatesFocus) to the first focusable element inside the component when a non-focusable part is clicked.
- `slotAssignment`: `'manual'` enables [manual slot assignment](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/slotAssignment) (otherwise known as [imperative slot assignment](https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Imperative-Shadow-DOM-Distribution-API.md)); `'named'` is the default DOM slotting behavior.
- `clonable`: preserves the shadow root when the host is deep-cloned via [`Node.cloneNode(true)`](https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode). Without it, cloning a shadow host produces an empty shell.
- `serializable`: marks the shadow root serializable, so it's included when the host is serialized via [`Element.getHTML({ serializableShadowRoots: true })`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getHTML).

**Scoped/none options** (`type: 'scoped'` or `type: 'none'`):

- `patches`: which light-DOM slot patches Stencil applies to this component (`'all'`, `'children'`, `'clone'`, `'insert'`). Overrides the project-wide `compat.lightDomPatches` config setting for this component specifically.

**Examples**:<br/>
```tsx
import { Component } from '@stencil/core';

@Component({
  tag: 'todo-list',
  encapsulation: { type: 'shadow' },
})
export class TodoList {
  // implementation omitted
}
```

```tsx title="Closed shadow root with delegated focus"
@Component({
  tag: 'todo-list',
  encapsulation: { type: 'shadow', mode: 'closed', delegatesFocus: true },
})
export class TodoList {
  // implementation omitted
}
```

```tsx title="Scoped CSS"
@Component({
  tag: 'todo-list',
  encapsulation: { type: 'scoped' },
})
export class TodoList {
  // implementation omitted
}
```

:::note
Migrating from Stencil v4? `shadow: true` becomes `encapsulation: { type: 'shadow' }`, `scoped: true` becomes `encapsulation: { type: 'scoped' }`, and no encapsulation option becomes `encapsulation: { type: 'none' }` (or omit the property — `'none'` is the default). `formAssociated: true` is gone too — see the [`@AttachInternals()` decorator](./attach-internals.md), which sets it automatically. Run `stencil migrate --dry-run` to preview the automatic migration.
:::

### styleUrl

**Optional**

**Type: `string`**

**Details:**<br/>
Relative URL to an external stylesheet containing styles to apply to your component.
Out of the box, Stencil will only process CSS files (files ending with `.css`).
Support for additional CSS variants, like Sass, can be added via [a plugin](https://stenciljs.com/docs/plugins#related-plugins).

**Example**:<br/>
Below is an example project's directory structure containing an example component and stylesheet.
```
src/
└── components/
    ├── todo-list.css
    └── todo-list.tsx
```

By setting `styleUrl`, Stencil will apply the `todo-list.css` stylesheet to the `todo-list` component:

```tsx
import { Component } from '@stencil/core';

@Component({
  tag: 'todo-list',
  styleUrl: './todo-list.css',
})
export class TodoList {
  // implementation omitted
}
```

### styleUrls

**Optional**

**Type: `string[] | { [modeName: string]: string | string[]; }`**

**Details:**<br/>
A list of relative URLs to external stylesheets containing styles to apply to your component.

Alternatively, an object can be provided that maps a named "mode" to one or more stylesheets.

Out of the box, Stencil will only process CSS files (ending with `.css`).
Support for additional CSS variants, like Sass, can be added via [a plugin](https://stenciljs.com/docs/plugins#related-plugins).

**Example**:<br/>
Below is an example project's directory structure containing an example component and stylesheet.
```
src/
└── components/
    ├── todo-list-1.css
    ├── todo-list-2.css
    └── todo-list.tsx
```

By setting `styleUrls`, Stencil will apply both stylesheets to the `todo-list` component:

```tsx title="Using an array of styles"
import { Component } from '@stencil/core';

@Component({
  tag: 'todo-list',
  styleUrls: ['./todo-list-1.css', './todo-list-2.css']
})
export class TodoList {
  // implementation omitted
}
```

```tsx title="Using modes"
import { Component } from '@stencil/core';

@Component({
  tag: 'todo-list',
  styleUrls: {
     ios: 'todo-list-1.ios.scss',
     md: 'todo-list-2.md.scss',
  }
})
export class TodoList {
  // implementation omitted
}
```

Read more on styling modes in the Components [Styling](./styling.md#style-modes) section.

### styles

**Optional**

**Type: `string | { [modeName: string]: any }`**

**Details:**<br/>
A string that contains inlined CSS instead of using an external stylesheet.
The performance characteristics of this feature are the same as using an external stylesheet.

When using `styles`, only CSS is permitted.
See [`styleUrl`](#styleurl) if you need more advanced features.

**Example**:<br/>
```tsx 
import { Component } from '@stencil/core';

@Component({
  tag: 'todo-list',
  styles: 'div { background-color: #fff }'
})
export class TodoList {
  // implementation omitted
}
```

## Embedding or Nesting Components

Components can be composed easily by adding the HTML tag to the JSX code. Since the components are just HTML tags, nothing needs to be imported to use a Stencil component within another Stencil component.

Here's an example of using a component within another component:

```tsx
import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'my-embedded-component'
})
export class MyEmbeddedComponent {
  @Prop() color: string = 'blue';

  render() {
    return (
      <div>My favorite color is {this.color}</div>
    );
  }
}
```

```tsx
import { Component, h } from '@stencil/core';

@Component({
  tag: 'my-parent-component'
})
export class MyParentComponent {

  render() {
    return (
      <div>
        <my-embedded-component color="red"></my-embedded-component>
      </div>
    );
  }
}
```

The `my-parent-component` includes a reference to the `my-embedded-component` in the `render()` function.

## Component Architecture Patterns

Stencil supports advanced component architecture patterns including class inheritance and composition. Learn more about organizing component logic with controllers in the [Extends & Mixins](../guides/extends.md) guide.
