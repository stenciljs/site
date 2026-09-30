---
title: CSS-Only Components
sidebar_label: css-only
description: Custom elements defined entirely in CSS, with no backing JS class
slug: /css-only
---

# CSS-Only Components

A CSS-only component is a custom element with no JS class at all - no `@Component()`, no `render()`, never registered via `customElements.define()`. You write a stylesheet; Stencil turns its top-level rule into a documented, type-checked tag. This is the lightest-weight point on Stencil's [component archetype spectrum](../concepts/component-archetypes.md) - reach for it when a tag only ever needs styling, with no behavior of its own.

## Defining a Component

Mark a top-level rule with a `/** @component */` comment directly above it. The rule's selector becomes the tag name:

```css title="src/components/my-badge/my-badge.css"
/**
 * @component
 * A colored status badge.
 */
my-badge {
  display: inline-block;
  padding: 4px 8px;
}
```

The file can live anywhere under `srcDir` - it doesn't need to sit in `src/components/` - and can be a `.css` file or any preprocessor extension your configured `plugins` already handle (`.scss`, `.sass`, `.less`, `.styl`, `.stylus`, `.pcss`), run through the same pipeline a real component's `styleUrl` uses.

The defining rule must resolve to exactly one tag. Besides a plain selector, two other forms work:

```css
/** @component */
:where(my-badge, .my-badge) {
  /* the leading :where()/:is() form - useful for a class-selector fallback */
}

/** @component */
@scope (my-badge) to ([slot]) {
  /* the tag comes from the scope root */
}
```

A tag that collides with a real component's tag loses - the real component wins, and Stencil raises a build error pointing at both files. Two CSS-only definitions for the same tag: the first one found wins, also with an error.

## Documenting Properties, Attributes, and Slots

Most of a CSS-only component's public API can be **auto-detected** straight from the CSS that's already there. Anything auto-detection can't infer - or a description - needs an explicit JSDoc tag. An explicit tag always wins over an auto-detected entry for the same name.

### Auto-detection

- **CSS custom properties** - a `--custom-property: value;` declaration anywhere inside the component's own rule (or a nested rule under it) is picked up automatically, but only if a `/** comment */` sits directly above it. An undocumented custom property is skipped, not silently included with an empty description.
- **Attributes** - an attribute selector on the tag's own compound (`my-badge[variant='danger']`) becomes an attribute. One with a value becomes part of a literal-union type, merged across every value seen (`'danger' | 'warning' | (string & {})` - the `(string & {})` member is deliberate, so a consumer can still pass a value you didn't enumerate without a type error); one with no value (`[dismissible]`) becomes `boolean`. A descendant-combinator selector like `my-badge [data-x]` targets a *different* element and is never picked up.
- **Slots** - a `[slot="x"]` selector that's a direct child rule of the component's own defining rule (not nested deeper) becomes a documented slot, whether or not it has a comment above it - an undocumented slot is still included, just with an empty description.
- **Native `@property` at-rules** - a real CSS [`@property`](https://developer.mozilla.org/en-US/docs/Web/CSS/@property) rule's `syntax` and `initial-value` descriptors populate that property's type and default automatically. `@property` is file-scoped, not tag-scoped - it applies to every CSS-only component defined in the same file.

### Explicit tags

```css
/**
 * @component
 * A colored status badge.
 * @attr {boolean} dismissible - Whether the badge can be dismissed.
 * @cssproperty --badge-color: The badge's text color.
 * @slot - The badge's label.
 * @slot icon-start - Content shown before the label.
 */
my-badge {
  --badge-padding: 4px;
  color: var(--badge-color);
}
```

- `@attr {type} name - description` - an attribute Stencil couldn't infer a shape for, or one you want documented differently than the auto-detected version.
- `@cssprop` / `@cssproperty` / `@prop` (interchangeable) `--name: description` - a CSS custom property. The name must start with `--`; this isn't for plain attributes.
- `@slot name - description`, or `@slot - description` (blank name, or the literal word `default`) for the default slot.

Any other `@tagname` in the block is preserved as-is alongside the component's other docs, the same way an unrecognized JSDoc tag on a real component's class is.

## Getting the styles onto the page

With zero or one [`global-style`](../output-targets/asset-outputs/global-style.md) output target, this is automatic - Stencil collects every discovered CSS-only component's CSS and places it for you, either prepended to your one global stylesheet or written to its own generated file if you don't have one at all. Nothing to write.

Write `@import "stencil-css-components";` yourself only to control exactly where in the cascade it lands, or if your project configures more than one `global-style` output - the compiler can't guess which one should hold it, and errors naming the import that needs placing:

```css title="src/global.css"
@import "stencil-css-components";
```

It accepts the same `layer()`/`supports()`/media modifiers a normal `@import` does.

## Using the component

There's nothing to import or register. Write the tag directly - `<my-badge variant="danger">Sale</my-badge>` - and Stencil's generated `components.d.ts` gives you full JSX/TSX type-checking on its attributes, the same as a real component. The browser treats the tag as a plain, undefined element; it's the CSS from the section above that gives it any visual presence at all.

## Config

### enableCssOnlyComponents

*default: `true`*

Set to `false` at the top level of `stencil.config.ts` to turn off CSS-only component discovery entirely.

```ts
export const config: Config = {
  enableCssOnlyComponents: false,
};
```
