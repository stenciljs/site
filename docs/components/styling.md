---
title: Styling Components
sidebar_label: Styling
description: Styling Components
slug: /styling
---

# Styling Components

## Choosing an Encapsulation Strategy

Styling your components depends partly on their [`encapsulation`](./component.md#encapsulation) choice - `shadow`, `scoped`, or `none`.

<!--
  TODO(live-demo): replace/supplement this static example with an interactive live demo -
  three near-identical components, one per encapsulation type, the same CSS selector
  applied to all three, live side by side, so the isolation difference is something the reader
  sees rather than reads three descriptions of. See V5_DOCS_PLAN.md §6 - the tool for this is
  not yet decided (playground-elements was proposed and retracted; needs a POC comparing
  @stencil/unplugin-in-a-real-browser-Node-runtime vs. a custom Sandpack/Nodebox-backed
  playground before implementing).
-->

```tsx title="my-component.tsx"
@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  encapsulation: { type: 'shadow' }, // or { type: 'scoped' }, or omit entirely for 'none'
})
export class MyComponent {}
```

| | `shadow` | `scoped` | `none` |
|---|---|---|---|
| Style isolation | Full - styles can't leak in or out | Stencil-applied - a generated class scopes your CSS, but light-DOM styles can still reach in | None by default - pair with native [`@scope`](#real-scoping-with-scope) for real scoping |
| DOM location | Shadow root (unreachable from `document.querySelector()` or external CSS) | Light DOM (reachable with `document.querySelector()` and ordinary CSS) | Light DOM |
| `<slot>` | Native browser slot projection | Stencil-managed light-DOM slotting (see [below](#slotting-without-shadow-dom)) | Same as `scoped` |
| Styling parts from outside | `::part()`, piercing the shadow boundary | A plain attribute selector (e.g. `[part="heading"]`) - there's no boundary for `::part()` to pierce | Same as `scoped` |
| Global stylesheets reach in? | Only via `:host()` in a stylesheet registered as a [constructable stylesheet](#constructable-stylesheets) | Yes, like any other element | Yes, like any other element |

Reach for `shadow` when you want the browser to guarantee isolation for you - publishing a design system used across teams you don't control, or embedding a component into a page whose CSS you don't trust. Reach for `scoped` or `none` when you want your component's DOM to behave like an ordinary part of the page.

### `shadow`

Full isolation, guaranteed by the browser - not just Stencil. The one shadow-specific addition to your CSS is [`:host`](./host-element.md), which selects the host element itself. Enabled by default for components made with [`stencil generate`](../config/cli.md#stencil-generate).

### `scoped`

Stencil generates a unique class for your component (e.g. `sc-my-component`), rewrites your stylesheet's selectors to include it, and adds that same class to the component's elements at render time - you write ordinary CSS, Stencil does the scoping. One-directional: page styles can still reach in, even though yours can't leak out.

### `none`

No scoping at all, and the default. Reach for it when a component should inherit and participate in page styles on purpose (a typography or layout primitive), or when you want to add your own scoping - see [Real Scoping With `@scope`](#real-scoping-with-scope) below.

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

## Slotting Without Shadow DOM

This applies equally to `scoped` and `none` - both keep your component's DOM in the light DOM.

`<slot>` is normally a shadow DOM feature - outside a shadow root, the browser doesn't know what to do with it. For `scoped` and `none` components, Stencil's own renderer handles this instead: it tracks where each piece of slotted content belongs and places it correctly during render, and polyfills the parts of the `<slot>` API you'd expect (`slotchange` events, `assignedElements()`/`assignedNodes()`, named slots, fallback content). This happens automatically - you write `<slot>` in your `render()` function exactly like you would in a shadow-encapsulated component.

Slot placement can still go wrong when something other than Stencil's own renderer moves your component's children around after the fact - a consuming framework's reconciler, or a script calling `appendChild()`/`insertBefore()` directly on your component. Left alone, that content could land in the wrong slot, or outside any slot at all. Stencil patches those DOM-mutation methods on non-shadow components so they keep slot placement correct even when called from outside its own renderer. This is controlled by the [`compat.lightDomPatches`](../config/compat.md#lightdompatches) config option, which is enabled by default.

## CSS Custom Properties

CSS custom properties (CSS variables) let consumers of a component customize its styles from the light DOM, reaching in even through a shadow boundary. Consider a `shadow-card` component that uses a custom property for the color of its heading:

```css
:host {
  --heading-color: black;
}

.heading {
  color: var(--heading-color);
}
```

:::note
Declare the custom property on the `Host` element (`:host`) to expose it to the consuming application - this sets its default value for the component. `var(--heading-color)` works the same way with or without this declaration; declaring it on `:host` is what makes *this* component the one that defines the default, rather than inheriting one from further up the page (or having none at all).
:::

The `shadow-card` heading will have a default color of `black`, but this can now be changed in the light DOM by selecting the `shadow-card` and changing the value of the `--heading-color` custom property.

```css
shadow-card {
  --heading-color: blue;
}
```

Document a custom property meant for consumers with a `@prop` JSDoc comment next to where you declare it - Stencil picks these up and generates a table of them for your component's docs (see [Styling Details](../output-targets/documentation-generation/docs-readme.md#styling-details)):

```css
:host {
  /**
   * @prop --heading-color: Color of the card heading
   */
  --heading-color: black;
}
```

## CSS Parts

CSS custom properties can be helpful for customizing components from the light DOM, but they are still a little limiting as they only allow a user to modify specific properties. For situations where users require a higher degree of flexibility, we recommend using the [CSS `::part()` pseudo-element](https://developer.mozilla.org/en-US/docs/Web/CSS/::part). You can define parts on elements of your component with the "part" attribute.

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

Then you can use the `::part()` pseudo-class on the host element to give any styles you want to the element with the corresponding part.

```css
shadow-card::part(heading) {
  text-transform: uppercase;
}
```

This allows for greater flexibility in styling as any styles can now be added to this element.

### Exportparts

If you have a Stencil component nested within another component, any `part` specified on elements of the child component will not be exposed through the parent component. In order to expose the `part`s of the child component, you need to use the `exportparts` attribute. Consider this `OuterComponent` which contains the `InnerComponent`.

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

By specifying "inner-text" as the value of the `exportparts` attribute, elements of the `InnerComponent` with a `part` of "inner-text" can now be styled in the light DOM. Even though the `InnerComponent` is not used directly, we can style its parts through the `OuterComponent`.

```html
<style>
  outer-component::part(inner-text) {
    color: blue;
  }
</style>

<outer-component />
```

## Style Modes

Component Style Modes enable you to create versatile designs for your components by utilizing different styling configurations. This is achieved by assigning the styleUrls property of a component to a collection of style mode names, each linked to their respective CSS files.

### Example: Styling a Button Component

Consider a basic button component that supports both iOS and Material Design aesthetics:

```tsx title="Using style modes to style a component"
@Component({
  tag: 'simple-button',
  styleUrls: {
    md: './simple-button.md.css', // styles for Material Design
    ios: './simple-button.ios.css' // styles for iOS
  },
})
export class SimpleButton {
  // ...
}
```

In the example above, two different modes are declared. One mode is named `md` (for 'Material Design') and refers back to a Material Design-specific stylesheet. Likewise, the other is named `ios` (for iOS) and references a different stylesheet for iOS-like styling. Both stylesheets are relative paths to the file that declares the component. While we have chosen short names in the above example, there's no limitation to the keys used in the `styleUrls` object.

To dictate the style mode (Material Design or iOS) in which the button should be rendered, you must initialize the desired mode before any component rendering occurs. This can be done as follows:

```ts
import { setMode } from '@stencil/core';
setMode(() => 'ios'); // Setting iOS as the default mode for all components
```

The `setMode` function processes all elements, enabling the assignment of modes individually based on specific element attributes. For instance, by assigning the `mode` attribute to a component:

```html
<simple-button mode="ios"></simple-button>
```

You can conditionally set the style mode based on the `mode` property:

```ts
import { setMode } from '@stencil/core';

const defaultMode = 'md'; // Default to Material Design
setMode((el) => el.getAttribute('mode') || defaultMode);
```

The reason for deciding which mode to apply can be very arbitrary and based on your requirements, using an element property called `mode` is just one example.

### Important Considerations

- __Initialization:__ Style modes must be defined at the start of the component lifecycle and cannot be changed thereafter. If you like to change the components mode dynamically you will have to re-render it entirely.
- __Usage Requirement:__ A style mode must be set to ensure the component loads with styles. Without specifying a style mode, the component will not apply any styles.
- __Input Validation:__ Verify a style mode is supported by a component you are setting it for. Setting an un-supported style mode keeps the component unstyled.
- __Querying Style Mode:__ To check the current style mode and e.g. provide different functionality based on the mode, use the `getMode` function:

```ts
import { getMode } from '@stencil/core';

const simpleButton = document.queryElement('simple-button')
console.log(getMode(simpleButton)); // Outputs the current style mode of component
```

This approach ensures your components are adaptable and can dynamically switch between different styles, enhancing the user experience across various platforms and design preferences.

## Global styles

While most styles are scoped to each component, some styles need to be available everywhere: theming, `@font-face`, an app-wide font family, CSS resets. Stencil generates these through a `global-style` output target.

Create `src/global.css` and Stencil picks it up automatically, no config required - it generates a `global-style` output target for you, named after your project's `namespace`. Commonly, this file might declare CSS custom properties on the root element via `:root`, since `:root` styles pass through the shadow boundary and reach every component:

```css
:root {
  --color-primary: blue;
}
```

For anything beyond that default - a stylesheet outside `src/global.{css,...}`, more than one global stylesheet (light / dark themes), a custom output filename, or making the stylesheet's CSS directly available inside shadow roots - configure `global-style` directly:

```tsx
export const config: Config = {
  outputTargets: [
    {
      type: 'global-style',
      input: './src/theme.css',
      fileName: 'theme.css',
    },
    {
      type: 'global-style',
      input: './src/print.css',
      fileName: 'print.css',
    },
  ],
};
```

For more advanced `global-style` options, refer to the `global-style` output target docs.

The compiler runs minification, autoprefixing, and plugins over global stylesheets and writes the result to `dist/assets/`, alongside component assets - import it in your `index.html`:

```html
<link rel="stylesheet" href="/assets/theme.css" />
```

### Co-locating styles with a component

A project-wide global stylesheet works well for true app-wide concerns, but sometimes a *specific component* needs to contribute document-level styles: a card component that also needs to style its slotted children before Stencil's JS has loaded, or a design token set that only matters when that component is present on the page. Set `globalStyleUrl` (or inline `globalStyle`) on `@Component()` to co-locate that CSS with the component itself, instead of maintaining a separate global stylesheet by hand:

```tsx
@Component({
  tag: 'my-card',
  styleUrl: 'my-card.css',
  globalStyleUrl: './my-card.global.css',
})
export class MyCard {}
```

`globalStyleUrl` styles aren't scoped to the component the way `styleUrl` styles are - they're collected at build time from every component that declares one, then injected wherever `@import "stencil-globals";` appears in a global stylesheet:

```css title="src/global.css"
@import "stencil-globals";
```

This works for every `encapsulation` type. It's also what makes a CSS-only component possible - one with no `render()` method or component logic at all, where the tag exists purely so its co-located styles have something to attach to.

`@import "stencil-globals"` accepts the same modifiers a normal `@import` does, wrapping the injected CSS accordingly: `@import "stencil-globals" layer(components);` wraps it in `@layer components { ... }`.

### Preventing flash of unstyled content with `stencil-hydrate`

Before a component's JavaScript loads and its `render()` runs for the first time, the browser has already parsed its light-DOM markup and any co-located styles - so there's a moment where a component can be visible but not yet interactive or fully styled by its own `render()` output. Left alone, this shows up as a flash of unstyled content (FOUC): the raw, unhydrated markup appears briefly before Stencil's runtime takes over.

By default, Stencil's [loader script](../output-targets/dist.md#loader) - the small entry file that registers and lazy-loads your components - handles this at runtime: it inserts a `<style>` tag that hides components until they're hydrated. But that script still has to load and run before it can insert anything - on a slow connection or a busy main thread, the page can paint before the loader gets a chance to hide the unhydrated content, and FOUC happens anyway. Add `@import "stencil-hydrate";` to a global stylesheet to generate that same hiding CSS at build time instead, so it's already in the page's stylesheet before any JS has to run:

```css title="src/global.css"
@import "stencil-hydrate";
```

The compiler replaces the placeholder with the sorted tag list for every component in the build, hiding each one until it's hydrated:

```css
my-cmp,other-cmp{visibility:hidden}.hydrated{visibility:inherit}
```

This is also the only option for a [`standalone`](../output-targets/custom-elements.md) build, which has no loader to do the dynamic injection at all - `stencil-hydrate.css` is generated alongside the bundle automatically in that case. Like `stencil-globals`, `stencil-hydrate` accepts the same `layer()`/`supports()`/media modifiers.

### Constructable Stylesheets

<!--
  TODO(live-demo, speculative - lower priority than the encapsulation demo above): once
  output-targets/global-style.md exists and a playground direction is chosen (see
  V5_DOCS_PLAN.md §6), consider a live demo here specifically - a global stylesheet with a
  :host(my-button) rule, inject: 'client' toggled on vs. off, showing it actually reach a live
  shadow root only when enabled. Unlike the multi-sheet/co-location story (build-time, not a
  good live-demo fit), this one piece is genuine runtime behavior. Not scoped or committed to;
  revisit after the encapsulation POC lands.
-->

A global stylesheet isn't registered inside shadow roots by default - it only reaches the light DOM, the same as any page-level stylesheet. Opt in via the `global-style` output target to also register it as a [constructable stylesheet](https://web.dev/constructable-stylesheets/) on every shadow root, letting it target shadow-encapsulated components directly (with `:host()` and a tag name selector, for instance). Refer to the `global-style` output target docs for how to turn this on and what it makes possible.
