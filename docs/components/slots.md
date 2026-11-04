---
title: Slots
sidebar_label: Slots
description: Pass content into a component with slots, with or without shadow DOM.
slug: /slots
---

# Slots

Components often need to place content supplied by whoever uses them: the text of a button, the body of a card. A `<slot>` in a component's `render()` function marks where that content goes.

## Using Slots

Add a [`<slot>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot) where child content should appear:

```tsx title="my-card.tsx"
render() {
  return (
    <div class="card">
      <h2>A Card</h2>
      <div class="body">
        <slot />
      </div>
    </div>
  );
}
```

Any children passed to `my-card` are placed inside `.body`:

```html
<my-card>
  <p>Card content</p>
</my-card>
```

### Named Slots

Give a slot a `name` to place content in a specific location. Content picks a slot with the `slot` attribute, and anything without one goes to the default (unnamed) slot. The order of the children doesn't matter:

:::playground{preview-height=160}
```tsx title="my-card.tsx"
import { Component } from '@stencil/core';

@Component({ tag: 'my-card' })
export class MyCard {
  render() {
    return (
      <div class="card">
        <header>
          <slot name="header" />
        </header>
        <slot />
        <footer>
          <slot name="footer" />
        </footer>
      </div>
    );
  }
}
```

```html title="index.html"
<script type="module" src="./my-card.js"></script>

<my-card>
  <button slot="footer">Close</button>
  <p>Card content</p>
  <h2 slot="header">Title</h2>
</my-card>
```
:::

### Fallback Content

Children of a `<slot>` are shown when nothing is passed to that slot:

```tsx
<slot name="header">
  <h2>Untitled</h2>
</slot>
```

To try it, add this fallback to the header slot in the playground above, then delete the `<h2 slot="header">` line from `index.html`.

## Forwarding Slots

A component that renders another component can pass its own slotted content through, by placing its slots inside the child component. Set `slot` on a forwarded slot to send its content to one of the child's named slots, under the same name or a different one:

```tsx title="my-dialog.tsx"
render() {
  return (
    <my-card>
      <slot name="title" slot="header" />
      <slot />
    </my-card>
  );
}
```

Here, content passed to `my-dialog`'s `title` slot appears in `my-card`'s `header` slot, and default content goes to `my-card`'s default slot.

## Reacting to Slot Changes

A `slotchange` event fires on a slot when the content assigned to it changes. Listen for it with `onSlotchange`, and read the current content with `assignedElements()` or `assignedNodes()`:

```tsx
@State() hasFooter = false;

private handleSlotchange = (ev: Event) => {
  const slot = ev.target as HTMLSlotElement;
  this.hasFooter = slot.assignedElements().length > 0;
};

render() {
  return (
    <footer>
      <slot name="footer" onSlotchange={this.handleSlotchange} />
    </footer>
  );
}
```

In this playground, the component shows a note while its footer slot is empty. Delete the button from `index.html`, and the note appears:

:::playground{preview-height=110}
```tsx title="my-card.tsx"
import { Component, State } from '@stencil/core';

@Component({
  tag: 'my-card',
  encapsulation: { type: 'shadow' },
})
export class MyCard {
  @State() hasFooter = false;

  private handleSlotchange = (ev: Event) => {
    const slot = ev.target as HTMLSlotElement;
    this.hasFooter = slot.assignedElements().length > 0;
  };

  render() {
    return (
      <div>
        <slot />
        <footer>
          <slot name="footer" onSlotchange={this.handleSlotchange} />
        </footer>
        {!this.hasFooter && <p>(No footer)</p>}
      </div>
    );
  }
}
```

```html title="index.html"
<script type="module" src="./my-card.js"></script>

<my-card>
  <p>Card content</p>
  <button slot="footer">Close</button>
</my-card>
```
:::

This works the same way in components [without shadow DOM](#slots-without-shadow-dom), except that the `flatten` option of `assignedElements()` and `assignedNodes()` isn't supported there.

## Slots Without Shadow DOM

Slots are a [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM) feature: outside a shadow root, the browser has nothing to project content into. For `scoped` and `none` components (see [Choosing an Encapsulation Strategy](./styling/01-overview.md#choosing-an-encapsulation-strategy)), Stencil mimics native slots instead. Its renderer tracks where each piece of slotted content belongs and moves it into place, and it emulates the rest of the slot API: named slots, fallback content, forwarding, and `slotchange` events with `assignedElements()` and `assignedNodes()`. You write `<slot>` the same way in every encapsulation mode.

Content can also be added after Stencil has rendered, by a consuming framework or a script calling `appendChild()` or `insertBefore()` on your component. Stencil patches those DOM methods on non-shadow components, so the new content still lands in the right slot. This is controlled by the [`compat.lightDomPatches`](../config/compat.md#lightdompatches) config option, which is enabled by default.

This covers most of what native slots do, but it's an emulation, so there will always be some differences from the browser's own behavior.

## Styling Slotted Content

Slotted content belongs to the page that passes it in, so the page's own styles apply to it. To style it from within the component, use the [`::slotted()`](https://developer.mozilla.org/en-US/docs/Web/CSS/::slotted) pseudo-element:

```css title="my-card.css"
::slotted(p) {
  margin: 0;
}
```

`::slotted()` works in `shadow` and `scoped` components (Stencil rewrites it for `scoped` styles). A `none` component's styles aren't rewritten, so use ordinary selectors such as `my-card p` instead.

## Documenting Slots

Stencil's [documentation outputs](../output-targets/documentation-generation/01-overview.md) list the slots a component uses in its `render()` function. To describe a slot, add a `@slot` tag to the component's JSDoc:

```tsx
/**
 * @slot - The card's content.
 * @slot header - A heading for the card.
 * @slot footer - Actions shown at the bottom of the card.
 */
@Component({ tag: 'my-card' })
export class MyCard {}
```

See [@slot Details](../output-targets/documentation-generation/docs-readme.md#slot-details) for the format.
