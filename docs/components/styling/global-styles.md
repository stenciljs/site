---
sidebar_position: 3
title: Global Styles
sidebar_label: Global Styles
description: Document-level stylesheets, styles co-located with components, and preventing a flash of unstyled content
slug: /global-styles
---

# Global Styles

Most styles belong to one component, but some apply to the whole page: theme variables, `@font-face` rules, a base font, a CSS reset. Put these in `src/global.css` (or `.scss`, `.less`, and so on). Stencil finds the file on its own and builds it into `<namespace>.css`, through a [`global-style`](../../output-targets/asset-outputs/global-style.md) output target it adds for you.

Theme variables are a common use. Custom properties set on `:root` are inherited by every component, including those with shadow DOM:

```css
:root {
  --color-primary: blue;
}
```

For anything beyond that default - a stylesheet outside `src/global.{css,...}`, more than one global stylesheet (light / dark themes), or a custom output filename - configure `global-style` directly:

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

See the [`global-style` output target](../../output-targets/asset-outputs/global-style.md) for every option.

Stencil runs minification, autoprefixing, and your plugins over each global stylesheet, and writes the result to `dist/assets/`. To apply it, the page using your components links to it:

- **Apps using your library** link the file from your published package, e.g. `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/my-lib/dist/assets/my-lib.css" />`, or import it through their bundler.
- **A [`www`](../../output-targets/main/www.md) app** gets a copy in its build directory, so `src/index.html` links `/build/my-lib.css`.
- **The dev server's [component previews](../../config/dev-server.md#component-previews)** link every global stylesheet for you.

## Co-locating styles with a component

A project-wide global stylesheet works well for true app-wide concerns, but sometimes a *specific component* needs to contribute document-level styles: a card component that also needs to style its slotted children before Stencil's JS has loaded, or a design token set that only matters when that component is present on the page. Set `globalStyleUrl` (or inline `globalStyle`) on `@Component()` to co-locate that CSS with the component itself, instead of maintaining a separate global stylesheet by hand:

```tsx
@Component({
  tag: 'my-card',
  styleUrl: 'my-card.css',
  globalStyleUrl: './my-card.global.css',
})
export class MyCard {}
```

`globalStyleUrl` styles aren't scoped to the component the way `styleUrl` styles are - they're collected at build time from every component that declares one. This works for every `encapsulation` type.

With zero or one [`global-style`](../../output-targets/asset-outputs/global-style.md) output target, getting them onto the page is automatic - Stencil places the collected CSS for you, either prepended to your one global stylesheet or written to its own generated file if you don't have one at all. Write `@import "stencil-component-globals";` yourself only to control exactly where in the cascade it lands, or if your project configures more than one `global-style` output - the compiler can't guess which one should hold it, and errors naming the import that needs placing:

```css title="src/global.css"
@import "stencil-component-globals";
```

`@import "stencil-component-globals"` accepts the same modifiers a normal `@import` does, wrapping the injected CSS accordingly: `@import "stencil-component-globals" layer(components);` wraps it in `@layer components { ... }`.

:::note
[CSS-only components](../css-only.md) - a tag with no backing JS class at all - use a separate placeholder, `@import "stencil-css-components";`, in the same global stylesheet.
:::

## Preventing flash of unstyled content with `stencil-hydrate`

Before a component's JavaScript loads and its `render()` runs for the first time, the browser has already parsed its light-DOM markup and any co-located styles - so there's a moment where a component can be visible but not yet interactive or fully styled by its own `render()` output. Left alone, this shows up as a flash of unstyled content (FOUC): the raw, unhydrated markup appears briefly before Stencil's runtime takes over.

By default, Stencil's [loader script](../../output-targets/main/loader-bundle.md#importing-with-a-bundler) - the small entry file that registers and lazy-loads your components - handles this at runtime: it inserts a `<style>` tag that hides components until they're hydrated. But that script still has to load and run before it can insert anything - on a slow connection or a busy main thread, the page can paint before the loader gets a chance to hide the unhydrated content, and FOUC happens anyway. Add `@import "stencil-hydrate";` to a global stylesheet to generate that same hiding CSS at build time instead, so it's already in the page's stylesheet before any JS has to run:

```css title="src/global.css"
@import "stencil-hydrate";
```

The compiler replaces the placeholder with the sorted tag list for every component in the build, hiding each one until it's hydrated:

```css
my-cmp,other-cmp{visibility:hidden}.hydrated{visibility:inherit}
```

This is also the only option for a [`standalone`](../../output-targets/main/standalone.md) build, which has no loader to do the dynamic injection at all - `stencil-hydrate.css` is generated alongside the bundle automatically in that case. Like `stencil-component-globals`, `stencil-hydrate` accepts the same `layer()`/`supports()`/media modifiers.

## Styling Shadow DOM Components

<!--
  TODO(live-demo): a global stylesheet's `:host(my-button)` rule reaching a shadow root, with
  `inject` on vs. off. Blocked on @stencil/playground: it applies global stylesheets to the
  document only (not to shadow roots) and ignores `inject`. See V5_DOCS_PLAN.md "Live Examples".
-->

A global stylesheet can also style the inside of shadow DOM components. The zero-config `src/global.css` stylesheet is added to every component's shadow root as a [constructable stylesheet](https://web.dev/constructable-stylesheets/). A stylesheet with an explicit `input` isn't, unless you set its [`inject`](../../output-targets/asset-outputs/global-style.md#inject) option.

Inside a shadow root, `:host()` with a tag name targets every instance of that component:

```css title="src/global.css"
:host(my-button) {
  --button-border-radius: 8px;
  display: inline-block;
}

:host(my-card) {
  --card-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 16px 0;
}

:host(my-input[type="password"]) {
  --input-font-family: monospace;
}
```

Use it to set default custom property values for a component, give every instance of a component the same spacing, or theme components by tag name or attribute.
