---
title: Stencil Style Guide
sidebar_label: Style Guide
description: Stencil Style Guide
slug: /style-guide
---

# Stencil Style Guide

This is a component style guide created and enforced internally by the core team of Stencil, for the purpose of standardizing Stencil components. This should only be used as a reference for other teams in creating their own style guides. Feel free to modify to your team's own preference.

:::note
In order to enforce this (or your team's) style guide, we recommend leveraging a static analysis tool like [ESLint](https://eslint.org/). [@stencil-community/eslint-plugin](https://www.npmjs.com/package/@stencil-community/eslint-plugin) provides rules specifically for writing Stencil components.
:::

:::note
This guide once recommended TSLint as a static analysis tool. TSLint has been deprecated by its maintaining organization in favor of ESLint and is no longer recommended by the Stencil team.
:::

## File structure

- One component per file.
- One component per directory. Though it may make sense to group similar components into the same directory, we've found it's easier to document components when each one has its own directory.
- Implementation (.tsx) and styles of a component should live in the same directory.

Example from ionic-core:

```bash
├── my-card
│   ├── my-card.ios.css
│   ├── my-card.md.css
│   ├── my-card.css
│   ├── my-card.tsx
│   └── test
│       └── basic
│           ├── e2e.js
│           └── index.html
├── my-card-content
│   ├── my-card-content.ios.css
│   ├── my-card-content.md.css
│   ├── my-card-content.css
│   └── my-card-content.tsx
├── my-card-title
│   ├── my-card-title.ios.css
│   ├── my-card-title.md.css
│   ├── my-card-title.css
```


## Naming
### HTML tag

#### Prefix
The prefix has a major role when you are creating a collection of components intended to be used across different projects, like [@ionic/core](https://www.npmjs.com/package/@ionic/core). Web Components are not scoped because they are globally declared within the webpage, which means a "unique" prefix is needed to prevent collisions. The prefix also helps to quickly identify the collection a component is part of. Additionally, web components are required to contain a "-" dash within the tag name, so using the first section to namespace your components is a natural fit.

We do not recommend using "stencil" as prefix, since Stencil DOES NOT emit stencil components, but rather the output is standards compliant web components.

DO NOT do this:
```markup
<stencil-component>
<stnl-component>
```

Instead, use your own naming or brand. For example, [Ionic](https://ionicframework.com/) components are all prefixed with `ion-`.
```markup
<ion-button>
<ion-header>
```

#### Name

Components are not actions, they are conceptually "things". It is better to use nouns instead of verbs, such as "animation" instead of "animating". "input", "tab", "nav", "menu" are some examples.


#### Modifiers

When several components are related and/or coupled, it is a good idea to share the name, and then add different modifiers, for example:

```markup
<ion-card>
<ion-card-header>
<ion-card-content>
```


### Component (TS class)

The name of the ES6 class of the component SHOULD NOT have a prefix since classes are scoped. There is no risk of collision.

```tsx
@Component({
  tag: 'ion-button'
})
export class Button { ... }

@Component({
  tag: 'ion-menu'
})
export class Menu { ... }
```


## TypeScript

1. **Use private variables and methods as much possible:** They are useful to detect dead code and enforce encapsulation. Note that this is a feature which TypeScript provides to help harden your code, but using `private`, `public` or `protected` does not make a difference in the actual JavaScript output.

2. **Code with Method/Prop/Event/Component decorators should have JSDocs:** This allows for documentation generation and for better user experience in an editor that has TypeScript intellisense

## Code organization

**Newspaper Metaphor from The Robert C. Martin's _Clean Code_**

:::note
The source file should be organized like a newspaper article, with the highest level summary at the top, and more and more details further down. Functions called from the top function come directly below it, and so on down to the lowest level and most detailed functions at the bottom. This is a good way to organize the source code, even though IDEs make the location of functions less important, since it is so easy to navigate in and out of them.
:::

### High level example (commented)

```tsx
@Component({
  tag: 'ion-something',
  styleUrls: {
    ios: 'something.ios.css',
    md: 'something.md.css',
    wp: 'something.wp.css'
  }
})
export class Something {

  /**
   * 1. Own Properties
   * Always set the type if a default value has not
   * been set. If a default value is being set, then type
   * is already inferred. List the own properties in
   * alphabetical order. Note that because these properties
   * do not have the @Prop() decorator, they will not be exposed
   * publicly on the host element, but only used internally.
   */
  num: number;
  someText = 'default';

  /**
   * 2. Reference to host HTML element.
   * Inlined decorator
   */
  @Element() el: HTMLElement;

  /**
   * 3. State() variables
   * Inlined decorator, alphabetical order.
   */
  @State() isValidated: boolean;
  @State() status = 0;

  /**
   * 4. Public Property API
   * Inlined decorator, alphabetical order. These are
   * different than "own properties" in that public props
   * are exposed as properties and attributes on the host element.
   * Requires JSDocs for public API documentation.
   */
  @Prop() content: string;
  @Prop() enabled: boolean;
  @Prop() menuId: string;
  @Prop() type = 'overlay';

  /**
   * Prop lifecycle events SHOULD go just behind the Prop they listen to.
   * This makes sense since both statements are strongly connected.
   * - If renaming the instance variable name you must also update the name in @Watch()
   * - Code is easier to follow and maintain.
   */
  @Prop() swipeEnabled = true;

  @Watch('swipeEnabled')
  swipeEnabledChanged(newSwipeEnabled: boolean, oldSwipeEnabled: boolean) {
    this.updateState();
  }

  /**
   * 5. Events section
   * Inlined decorator, alphabetical order.
   * Requires JSDocs for public API documentation.
   */
  @Event() ionClose: EventEmitter;
  @Event() ionDrag: EventEmitter;
  @Event() ionOpen: EventEmitter;

  /**
   * 6. Component lifecycle events
   * Ordered by their natural call order, for example
   * WillLoad should go before DidLoad.
   */
  connectedCallback() {}
  disconnectedCallback() {}
  componentWillLoad() {}
  componentDidLoad() {}
  componentShouldUpdate(newVal: any, oldVal: any, propName: string) {}
  componentWillUpdate() {}
  componentDidUpdate() {}
  componentWillRender() {}
  componentDidRender() {}

  /**
   * 7. Listeners
   * It is ok to place them in a different location
   * if makes more sense in the context. Recommend
   * starting a listener method with "on".
   * Always use two lines.
   */
  @Listen('click', { enabled: false })
  onClick(ev: UIEvent) {
    console.log('hi!')
  }

  /**
   * 8. Public methods API
   * These methods are exposed on the host element.
   * Always use two lines.
   * Public Methods must be async.
   * Requires JSDocs for public API documentation.
   */
  @Method()
  async open(): Promise<boolean> {
    // ...
    return true;
  }

  @Method()
  async close(): Promise<void> {
    // ...
  }

  /**
   * 9. Local methods
   * Internal business logic. These methods cannot be
   * called from the host element.
   */
  prepareAnimation(): Promise<void> {
    // ...
  }

  updateState() {
    // ...
  }

  /**
   * 10. render() function
   * Always the last public method in the class.
   * If private methods present, they are below public methods.
   */
  render() {
    return (
      <Host
        attribute="navigation"
        side={this.isRightSide ? 'right' : 'left'}
        type={this.type}
        class={{
          'something-is-animating': this.isAnimating
        }}
      >
        <div class='menu-inner page-inner'>
          <slot></slot>
        </div>
      </Host>
    );
  }
}
```
