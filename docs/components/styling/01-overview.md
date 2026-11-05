---
title: Styling Components
sidebar_label: Overview
description: How a component's encapsulation affects its CSS
slug: /styling
---

# Styling Components

## Choosing an Encapsulation Strategy

Styling your components depends partly on their [`encapsulation`](../component.md#encapsulation) choice - `shadow`, `scoped`, or `none`.

```tsx title="my-component.tsx"
@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  encapsulation: { type: 'shadow' }, // or { type: 'scoped' }, or omit entirely for 'none'
})
export class MyComponent {}
```

Here, three components share one stylesheet and differ only in `encapsulation`. The page's `h2` rule turns the `scoped` and `none` headings red, but not the `shadow` one. The `none` component's `h2` rule leaks out and underlines the page's own heading:

:::playground{preview-height=230}
```css title="demo.css"
h2 {
  text-decoration: underline;
}
```

```tsx title="shadow-demo.tsx"
import { Component } from '@stencil/core';

@Component({
  tag: 'shadow-demo',
  styleUrl: 'demo.css',
  encapsulation: { type: 'shadow' },
})
export class ShadowDemo {
  render() {
    return <h2>shadow</h2>;
  }
}
```

```tsx title="scoped-demo.tsx" hidden
import { Component } from '@stencil/core';

@Component({
  tag: 'scoped-demo',
  styleUrl: 'demo.css',
  encapsulation: { type: 'scoped' },
})
export class ScopedDemo {
  render() {
    return <h2>scoped</h2>;
  }
}
```

```tsx title="none-demo.tsx" hidden
import { Component } from '@stencil/core';

@Component({
  tag: 'none-demo',
  styleUrl: 'demo.css',
  encapsulation: { type: 'none' },
})
export class NoneDemo {
  render() {
    return <h2>none</h2>;
  }
}
```

```html title="index.html"
<style>
  h2 {
    color: red;
  }
</style>

<script type="module" src="./shadow-demo.js"></script>
<script type="module" src="./scoped-demo.js"></script>
<script type="module" src="./none-demo.js"></script>

<h2>Page heading</h2>
<shadow-demo></shadow-demo>
<scoped-demo></scoped-demo>
<none-demo></none-demo>
```
:::

| | `shadow` | `scoped` | `none` |
|---|---|---|---|
| Style isolation | Full - styles can't leak in or out | Stencil-applied - a generated class scopes your CSS, but light-DOM styles can still reach in | None by default - pair with native [`@scope`](#real-scoping-with-scope) for real scoping |
| DOM location | Shadow root (unreachable from `document.querySelector()` or external CSS) | Light DOM (reachable with `document.querySelector()` and ordinary CSS) | Light DOM |
| `<slot>` | Native browser slot projection | Stencil-managed light-DOM slotting (see [Slots Without Shadow DOM](../slots.md#slots-without-shadow-dom)) | Same as `scoped` |
| Styling parts from outside | `::part()`, piercing the shadow boundary | A plain attribute selector (e.g. `[part="heading"]`) - there's no boundary for `::part()` to pierce | Same as `scoped` |
| Global stylesheets reach in? | Only via `:host()` in a stylesheet registered as a [constructable stylesheet](./global-styles.md#styling-shadow-dom-components) | Yes, like any other element | Yes, like any other element |

Reach for `shadow` when you want the browser to guarantee isolation for you - publishing a design system used across teams you don't control, or embedding a component into a page whose CSS you don't trust. Reach for `scoped` or `none` when you want your component's DOM to behave like an ordinary part of the page. Page CSS applies to it, and so do the things a shadow root blocks: a `<label for>` or `aria-labelledby` elsewhere on the page can point at an element inside it, and a native `<input>` it renders takes part in the surrounding `<form>` with no extra code (see [Form-Associated Components](../form-associated.md)).

### `shadow`

Full isolation, guaranteed by the browser - not just Stencil. The one addition to your CSS is [`:host`](#styling-the-host-element), which selects the host element itself. Enabled by default for components made with [`stencil generate`](../../config/cli.md#stencil-generate).

### `scoped`

Stencil generates a unique class for your component (e.g. `sc-my-component`), rewrites your stylesheet's selectors to include it, and adds that same class to the component's elements at render time - you write ordinary CSS, Stencil does the scoping. One-directional: page styles can still reach in, even though yours can't leak out. To stop them, see [Keeping Page Styles Out](#keeping-page-styles-out).

### `none`

No scoping at all, and the default. Your styles and the page's mix freely, which suits a component that should share page styles on purpose, such as a typography or layout primitive. To scope its styles yourself, see [Real Scoping With `@scope`](#real-scoping-with-scope) below.

## Styling the Host Element

The host element is your component's own tag, such as `<my-cmp>`. Which selector styles it from the component's stylesheet depends on the encapsulation:

| Encapsulation | Selector |
|---|---|
| `shadow` | `:host` |
| `scoped` | `:host` (Stencil rewrites it to the host's scope class) |
| `none` | the tag name, `my-cmp` |

```css title="my-cmp.css"
:host {
  display: block;
}
```

In a `scoped` component, the tag name doesn't select the host: Stencil scopes it like any other selector, so it only matches `my-cmp` elements rendered inside the component.

## Real Scoping With `@scope`

`type: 'none'` doesn't scope your styles at all, so if you want scoping without `type: 'scoped'`'s generated class, write it yourself with the native [`@scope`](https://developer.mozilla.org/en-US/docs/Web/CSS/@scope) at-rule - no Stencil mechanism involved, just the browser doing what `@scope` was designed for:

```css title="plain-component.css"
@scope (plain-component) {
  :scope {
    display: block;
  }

  h1 {
    color: blue;
  }
}
```

Everything inside the `@scope` block only matches within a `<plain-component>` element's subtree - `h1` here won't touch any other `h1` on the page. This is the evergreen alternative to `type: 'scoped'`: real scoping, native to the platform, with none of Stencil's own generated-class scoping mechanism involved.

:::note
`@scope` reached Baseline "Newly available" as of Firefox 146 (December 2025) - it's also supported in Chrome 118+, Safari 17.4+, and Edge 118+. Choose `type: 'scoped'` instead if you need to support browsers from before this landed.
:::

## Keeping Page Styles Out

Page styles reach the elements of `scoped` and `none` components. To keep them out, reset the component's elements with `all: revert`, then write your own styles after the reset.

In a `scoped` component, the reset is a normal rule:

```css title="scoped-component.css"
*:where(:not(img, svg):not(svg *)) {
  all: revert;
}

h2 {
  font-size: 1.25rem;
}
```

Stencil adds its generated class to the reset, which makes it more specific than the page's element selectors, such as `h2`, and less specific than your own rules. It only matches the elements the component renders, so content slotted in from the page keeps the page's styles.

In a `none` component, nest the reset and your own styles under the component's tag:

```css title="plain-component.css"
plain-component {
  all: revert;

  :not(x):where(:not(img, svg):not(svg *)) {
    all: revert;
  }

  h2 {
    font-size: 1.25rem;
  }
}
```

The tag keeps the reset inside the component. `:not(x)` matches any element that isn't an `<x>`, and adds an element selector's specificity, so the reset outranks the page's `h2`. Your own rules are nested the same way and come after the reset, so they win over it. The reset also applies to content slotted in from the page. Where [`@scope`](#real-scoping-with-scope) is available, `@scope (plain-component) { :scope, :not(x):where(...) { all: revert; } }` works the same.

Both resets skip images and SVG, because `all: revert` also undoes SVG presentation attributes such as `fill`. A more specific page selector, such as `.content h2`, or an `!important` one, still gets through. `all` doesn't reset CSS custom properties, so consumers can still theme the component through them.

## More on Styling

- [Defining a Styling API](./styling-api.md): CSS custom properties and parts, the styles consumers are allowed to change.
- [Global Styles](./global-styles.md): document-level stylesheets, co-locating them with components, and preventing a flash of unstyled content.
- [Style Modes](./style-modes.md): alternative stylesheets for one component, such as iOS and Material Design.
