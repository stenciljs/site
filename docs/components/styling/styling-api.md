---
sidebar_position: 2
title: Defining a Styling API
sidebar_label: Styling API
description: Let consumers restyle a component through CSS custom properties and parts
slug: /styling-api
---

# Defining a Styling API

[Encapsulation](./01-overview.md) keeps outside styles from reaching into a component. CSS custom properties and parts are the openings you choose to make: they define which parts of a component's look its consumers can change, much like `@Prop()` defines the data they can pass in.

## CSS Custom Properties

CSS custom properties (CSS variables) let consumers change specific values in a component's styles, even through a shadow boundary. Consider a `shadow-card` component that uses a custom property for the color of its heading:

```css
:host {
  /**
   * @prop --heading-color: Color of the card heading
   */
  --heading-color: black;
}

.heading {
  color: var(--heading-color);
}
```

The `@prop` JSDoc comment documents the property for consumers: Stencil adds it to your component's generated docs (see [Styling Details](../../output-targets/documentation-generation/docs-readme.md#styling-details)). Declaring the property on `:host` gives it a default value. Without that declaration, `var(--heading-color)` still works, but takes whatever value is inherited from the page, if any.

Consumers set their own value on the component:

```css
shadow-card {
  --heading-color: blue;
}
```

## CSS Parts

Custom properties only let consumers change the values you've chosen to expose. For more freedom, mark an element with a `part` attribute, and consumers can style it however they like with the [`::part()`](https://developer.mozilla.org/en-US/docs/Web/CSS/::part) pseudo-element:

```tsx
@Component({
  tag: 'shadow-card',
  styleUrl: 'shadow-card.css',
  encapsulation: { type: 'shadow' },
})
export class ShadowCard {
  @Prop() heading: string;

  render() {
    return (
      <Host>
        <h1 part="heading">{this.heading}</h1>
        <slot></slot>
      </Host>
    );
  }
}
```

```css
shadow-card::part(heading) {
  text-transform: uppercase;
}
```

`::part()` is for reaching into a shadow root. In a `scoped` or `none` component, the element is already in the light DOM, so consumers can use an ordinary selector such as `shadow-card [part="heading"]`.

### Exportparts

Parts of a nested component aren't exposed through the component that renders it. To pass them on, list them in the nested component's `exportparts` attribute:

```tsx
@Component({
  tag: 'outer-component',
  styleUrl: 'outer-component.css',
  encapsulation: { type: 'shadow' },
})
export class OuterComponent {
  render() {
    return (
      <Host>
        <h1>Outer Component</h1>
        <inner-component exportparts="inner-text" />
      </Host>
    );
  }
}

@Component({
  tag: 'inner-component',
  styleUrl: 'inner-component.css',
  encapsulation: { type: 'shadow' },
})
export class InnerComponent {
  render() {
    return (
      <Host>
        <h1 part="inner-text">Inner Component</h1>
      </Host>
    );
  }
}
```

Consumers can then style `inner-component`'s `inner-text` part through `outer-component`:

```css
outer-component::part(inner-text) {
  color: blue;
}
```
