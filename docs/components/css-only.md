---
title: CSS-Only Components
sidebar_label: CSS-Only Components
description: Custom elements defined entirely in CSS, with no backing JS class
slug: /css-only
---

# CSS-Only Components

Some components are only styles: a badge, a divider, a layout grid. You can write one as a plain stylesheet. Stencil picks it up as a component, adds its attributes to your types and generated docs, and ships its CSS with your global styles. There's no JavaScript class, so there's nothing to load or register.

See [Component Archetypes](../concepts/component-archetypes.md) for how this compares with Stencil's other kinds of component.

## A First Example

Put a `/** @component */` comment above a rule. The rule's selector becomes the tag name:

```css title="src/components/my-badge/my-badge.css"
/**
 * @component
 * A small label for a status or count.
 */
my-badge {
  /** The badge's background color. */
  --badge-color: #e0e0e0;

  display: inline-flex;
  gap: 4px;
  padding: 2px 8px;
  background: var(--badge-color);

  &[variant='success'] {
    --badge-color: #c8f0d0;
  }

  &[variant='danger'] {
    --badge-color: #f8d0d0;
  }

  &[pill] {
    border-radius: 999px;
  }

  > [slot='icon'] {
    width: 1em;
  }
}
```

Use it like any other element:

```html
<my-badge variant="success" pill>
  <svg slot="icon">...</svg>
  Shipped
</my-badge>
```

Stencil works out the component's API from the CSS. Your generated `components.d.ts` gets a type for the tag, so attributes are checked in JSX:

```ts title="src/components.d.ts"
interface MyBadge {
  "pill"?: boolean;
  "variant"?: "success" | "danger" | (string & {});
}
```

And a [readme](../output-targets/documentation-generation/docs-readme.md) or any other [docs output](../output-targets/documentation-generation/01-overview.md) describes it:

```md title="src/components/my-badge/readme.md"
## Properties

| Attribute | Description | Type                                     | Default |
| --------- | ----------- | ---------------------------------------- | ------- |
| `pill`    |             | `boolean`                                | --      |
| `variant` |             | `"success" \| "danger" \| (string & {})` | --      |

## Slots

| Slot     | Description |
| -------- | ----------- |
| `"icon"` |             |

## CSS Custom Properties

| Name            | Description                   |
| --------------- | ----------------------------- |
| `--badge-color` | The badge's background color. |
```

## What Stencil Detects

### Attributes

An attribute selector on the component itself becomes an attribute. Values you style are combined into a union type, and an attribute with no value becomes a `boolean`:

```css
my-badge {
  &[variant='success'] { /* ... */ }
  &[variant='danger'] { /* ... */ }
  &[pill] { /* ... */ }
}
```

```ts
"variant"?: "success" | "danger" | (string & {});
"pill"?: boolean;
```

The `(string & {})` keeps other strings valid while your editor still suggests the known values. Selectors that target a descendant, such as `my-badge [data-x]`, are about a different element and aren't picked up.

### Slots

An `[slot="name"]` selector directly inside the component's rule becomes a named slot:

```css
my-badge {
  [slot='icon'] { /* ... */ }
}
```

Slot selectors nested any deeper aren't picked up.

### CSS Custom Properties

A custom property declared in the component's rule is documented when it has a doc comment above it. Custom properties without one are treated as internal and left out:

```css
my-badge {
  /** The badge's background color. */
  --badge-color: #e0e0e0;

  --badge-gap: 4px; /* not documented */
}
```

A native [`@property`](https://developer.mozilla.org/en-US/docs/Web/CSS/@property) rule documents a property too. Its `syntax` and `initial-value` appear in the generated docs as the property's syntax and default, whether the description is on the `@property` rule or on the declaration in the component's rule:

```css
/** The badge's height. */
@property --badge-size {
  syntax: '<length>';
  inherits: true;
  initial-value: 20px;
}
```

`@property` rules apply to every CSS-only component in the same file.

## Adding Descriptions

A doc comment directly above an attribute or slot rule becomes its description:

```css
my-badge {
  /** Shows the badge with fully rounded ends. */
  &[pill] { /* ... */ }

  /** An icon shown before the label. */
  [slot='icon'] { /* ... */ }
}
```

You can also describe them with JSDoc tags in the `@component` comment, which is also how to document anything the CSS doesn't show:

```css
/**
 * @component
 * A small label for a status or count.
 * @attr {'success' | 'danger'} variant - The badge's color scheme.
 * @attr {boolean} pill - Shows the badge with fully rounded ends.
 * @slot - The badge's label.
 * @slot icon - An icon shown before the label.
 * @cssprop --badge-color - The badge's background color.
 */
my-badge {
  /* ... */
}
```

| Tag | Documents |
|---|---|
| `@attr {type} name - description` | An attribute. Its type replaces the detected one. |
| `@slot name - description` | A slot. Leave out the name, or use `default`, for the default slot. |
| `@cssprop --name - description` | A CSS custom property. `--name: description` also works, and so do `@cssproperty` and `@prop`. |

A tag always wins over a detected entry with the same name. Any other `@tag` is kept in the docs as-is, the same as on a regular component.

## Getting the Styles onto the Page

Stencil adds every CSS-only component's CSS to your [global stylesheet](../output-targets/asset-outputs/global-style.md) by placing it before your own global styles. If the project has no global stylesheet, Stencil writes one for you.

To choose where the CSS goes, import `stencil-css-components` in your global stylesheet. The import takes the usual `layer()`, `supports()` and media modifiers:

```css title="src/global.css"
@import "stencil-css-components" layer(components);
```

With more than one `global-style` output target, the import is required: Stencil can't choose which file should hold the CSS, so the build fails with an error until you add it to one.

## Details

- **File location and format.** The stylesheet can live anywhere under `srcDir`, and can use any extension your configured style `plugins` handle (`.scss`, `.sass`, `.less`, `.styl`, `.stylus`, `.pcss`).
- **Other ways to write the defining rule.** It must name exactly one tag. Besides a plain selector, a `:where()` or `:is()` wrapper (useful for adding a class fallback) and an `@scope` rule work:

  ```css
  /** @component */
  :where(my-badge, .my-badge) {
    /* ... */
  }

  /** @component */
  @scope (my-badge) to ([slot]) {
    /* ... */
  }
  ```

- **Tag collisions.** If a CSS-only component uses the same tag as a regular component, the regular component wins and the build reports an error naming both files. If two CSS-only components use the same tag, the first one found wins, also with an error.
- **Turning it off.** Set `enableCssOnlyComponents: false` in `stencil.config.ts` to stop Stencil looking for CSS-only components:

  ```ts title="stencil.config.ts"
  export const config: Config = {
    enableCssOnlyComponents: false,
  };
  ```
