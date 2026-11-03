---
title: Typed Components
sidebar_label: Typed Components
description: Use the types Stencil generates for your components, in your own code, tests, and consuming apps
slug: /typed-components
---

# Typed Components

On every build, Stencil writes `src/components.d.ts` with types for each of your components. For a `my-toggle` component, it declares:

- `HTMLMyToggleElement`: the element, with its props and methods. It's global, like `HTMLButtonElement`, so it needs no import.
- `MyToggleCustomEvent<T>`: the type of the component's events.
- JSX types, so `<my-toggle>` is type-checked wherever you render it.

## Referencing Elements

Use the `HTML{Tag}Element` interfaces wherever you hold a component element:

```tsx
@Element() el: HTMLMyPanelElement;

private toggle?: HTMLMyToggleElement;

render() {
  return <my-toggle ref={(el) => (this.toggle = el)} />;
}
```

`querySelector()` returns the right interface for a tag name on its own, so its props and methods are typed:

```ts
const toggle = this.el.querySelector('my-toggle'); // HTMLMyToggleElement | null
toggle?.toggle();
```

## Typed Events

An event's type comes from its [`@Event()`](../../components/events.md) declaration. Here `my-toggle` declares that its `myChange` event's detail has a `checked` boolean:

```tsx title="my-toggle.tsx"
@Event() myChange: EventEmitter<{ checked: boolean }>;
```

Event handlers in JSX are then typed from that detail:

```tsx title="my-panel.tsx"
<my-toggle onMyChange={(ev) => (this.open = ev.detail.checked)} />
```

To type a handler declared elsewhere, import the event type from `components.d.ts`:

```tsx
import { MyToggleCustomEvent } from '../../components';

private onChange = (ev: MyToggleCustomEvent<{ checked: boolean }>) => {
  this.open = ev.detail.checked;
};
```

`addEventListener()` on a component element is typed the same way.

## Type-Checked JSX

Rendering one of your components in another component's `render()` checks its props: a wrong type, or a missing [required prop](../../components/properties.md#required-properties), is a compile error:

```tsx
<my-toggle checked="yes" /> // Type 'string' is not assignable to type 'boolean'
```

## In Tests

The same interfaces type elements in tests. In a [Playwright](../../testing/playwright/02-e2e-testing.md) test, for example:

```ts
await page.locator('my-toggle').evaluate((el: HTMLMyToggleElement) => (el.checked = true));
```

## For Consumers

`components.d.ts` is for your own project. What consumers get comes from other outputs:

- The [`types`](../../output-targets/supporting/types.md) output target publishes the same types in `dist/types`, for consumers using TypeScript. See [Editor Support](../tooling/editor-support.md#in-typescript-apps-using-your-library) for how their apps pick them up.
- [Framework Types](../../framework-integration/framework-types.md) make your tags type-checked in React, Vue, Solid, Svelte, and Preact templates.
- The [React](../../framework-integration/react.md), [Vue](../../framework-integration/vue.md), and [Angular](../../framework-integration/angular.md) wrappers give consumers typed framework components.

## Committing `components.d.ts`

Stencil regenerates the file on every build, so committing it is optional:

- **Committed**, types work straight after cloning, before the first build, and a pull request's diff shows changes to your components' public API.
- **Ignored** (add it to `.gitignore`), there's no generated file to keep in sync or resolve conflicts in. Editors show missing types on a fresh clone until the first build.
