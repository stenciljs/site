---
title: Component Archetypes
sidebar_label: Component Archetypes
description: The four kinds of component Stencil supports, from a CSS-only tag to a custom element with shadow DOM
slug: /component-archetypes
---

# Component Archetypes

A Stencil component can take four shapes, from a styled tag with no JavaScript to a custom element with its own shadow root. Pick the simplest one that does what the tag needs: a stylesheet is less to write and test than a class with a lifecycle and a shadow root.

All four are typed and documented the same way. Stencil reads a component's API from its source, a class's decorators or a CSS file's JSDoc tags, so a CSS-only tag gets JSX types and generated docs (`docs-json`, `docs-readme`, the Custom Elements Manifest) just as a class does.

## CSS-only

A stylesheet with no JavaScript class, so the tag is never registered as a custom element. A `/** @component */` comment tells Stencil to treat the rule's selector as a component, and to add its attributes to your types and docs.

```css
/**
 * @component
 * A colored status badge.
 */
my-badge {
  color: var(--badge-color, black);
}
my-badge[variant='danger'] {
  --badge-color: red;
}
```

```html
<my-badge variant="danger">Sale</my-badge>
```

Use it for presentational tags with no state, such as a badge or a divider. See [CSS-Only Components](../components/css-only.md) for the full reference.

## Progressively-enhanced

HTML that works on its own, plus a Stencil class that adds behavior once it loads. The tag's content is ordinary markup written inside it, and the class, usually with `encapsulation: { type: 'none' }`, adds to it: an event listener, for example, or a keyboard shortcut. If the JavaScript never loads, the HTML still works.

```tsx
@Component({ tag: 'share-link', encapsulation: { type: 'none' } })
export class ShareLink {
  private onClick = (e: MouseEvent) => {
    const link = (e.target as Element).closest('a');
    if (!link || !navigator.share) return; // plain link still works without this
    e.preventDefault();
    navigator.share({ url: link.href });
  };

  render() {
    return (
      <Host onClick={this.onClick}>
        <slot />
      </Host>
    );
  }
}
```

```html
<share-link>
  <a href="https://example.com/post/1">Share this post</a>
</share-link>
```

Without JavaScript, the link still works. Once the class has loaded, a click opens the browser's share sheet instead, where the Web Share API is supported. Use this when plain HTML already does the tag's main job.

## Custom element, no shadow DOM

The full component model (props, state, lifecycle methods and `render()`) with `encapsulation: { type: 'scoped' }` or `{ type: 'none' }`, the default. The component's output comes from `render()`, so it needs the JavaScript to load. Without a shadow root, the component's elements are an ordinary part of the page. The page's CSS rules match them, which suits a component that should look like the rest of the page. A `<label for>` or `aria-labelledby` elsewhere on the page can point at an element inside it, and a native `<input>` it renders submits with the surrounding `<form>`, with no [form-associated](../components/form-associated.md) wiring. Its children also stay in the light DOM, where a framework can manage them.

```tsx
@Component({
  tag: 'inline-alert',
  styleUrl: 'inline-alert.css',
  encapsulation: { type: 'scoped' },
})
export class InlineAlert {
  @Prop() variant: 'info' | 'warning' = 'info';

  render() {
    return (
      <Host role="alert">
        <slot />
      </Host>
    );
  }
}
```

See [Choosing an Encapsulation Strategy](../components/styling/01-overview.md#choosing-an-encapsulation-strategy) and [Slots Without Shadow DOM](../components/slots.md#slots-without-shadow-dom) for the styling and slot mechanics this archetype relies on.

## Custom element, shadow DOM

The same component model with `encapsulation: { type: 'shadow' }`. The component renders into a shadow root: page selectors don't match its internal elements, its own styles don't leak out, and `<slot>` is the browser's native slot. Use it when the page shouldn't be able to affect or depend on a component's internal DOM and styles, for example in a design system used by teams you don't control.

```tsx
@Component({
  tag: 'user-card',
  styleUrl: 'user-card.css',
  encapsulation: { type: 'shadow' },
})
export class UserCard {
  @Prop() name: string;

  render() {
    return (
      <Host>
        <h3>{this.name}</h3>
        <slot />
      </Host>
    );
  }
}
```

See [`encapsulation`](../components/component.md#encapsulation) for the full option reference, including `mode: 'closed'` and the other shadow root options.
