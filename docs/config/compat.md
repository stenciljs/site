---
title: Compat Config
sidebar_label: Compat
description: Compat Config
slug: /config-compat
---

# Compat

The `compat` config (renamed from `extras` in Stencil v5) contains compatibility and workaround flags — primarily for shielding non-shadow-DOM components from consuming frameworks that mutate internals they don't know about, plus other framework/bundler integration edge cases and rarely-needed diagnostic suppressions. These are opt-in behaviors that aren't needed by every project.

:::note
Migrating from Stencil v4? Run `stencil migrate --dry-run` to preview renaming `extras` to `compat` and consolidating the individual slot-fix flags into `lightDomPatches` automatically.
:::

### enableImportInjection

**Default: `true`**

Projects that use a Stencil library built using the [`loader-bundle` output target](../output-targets/dist.md) may have trouble lazily
loading components when using a bundler such as Vite or Parcel. This flag changes how Stencil
lazily loads components in a way that works with additional bundlers, at the cost of a larger compiled output.

In order for this flag to have an effect:

1. The Stencil library must expose lazy loadable components, such as those created with the
   [`loader-bundle` output target](../output-targets/dist.md)
2. The Stencil library must be compiled with `compat.enableImportInjection` set (or left at its default)

Set this to `false` to opt out.

### lightDomPatches

**Default: `true`**

DOM patches for light-DOM / scoped components that use `<slot>`. Stencil patches certain DOM APIs (like `appendChild()`, `cloneNode()`, and the `textContent` getter/setter) so that slotted content in scoped or unencapsulated components behaves more like it would under native Shadow DOM.

Pass `true` (the default) to enable every patch, `false` to disable all of them, or an object for granular control:

```tsx
compat: {
  lightDomPatches: {
    childNodes: true,    // patch childNodes/children to return only slotted content
    cloneNode: true,     // patch cloneNode() to correctly deep-clone slotted content
    domMutations: true,  // patch appendChild()/insertBefore()/removeChild() to route to the correct slot
    textContent: true,   // patch textContent to act like shadow DOM (reads/writes slotted text only)
  },
}
```

Individual components can also override these patches via the [`patches` option on `encapsulation`](../components/component.md#encapsulation) instead of applying project-wide.

### suppressPublicNameWarnings

**Default: `false`**

When `true`, Stencil suppresses diagnostics that warn about public members using reserved names (for example, decorating a method named `focus` with `@Method()`).

### suppressEventNameWarnings

**Default: `false`**

When `true`, Stencil suppresses diagnostics that warn about event names conflicting with native DOM event names.

### lifecycleDOMEvents

**Default: `false`**

Dispatches component lifecycle events. By default these events are not dispatched, but by enabling this to `true` these events can be listened for on `window`. Mainly used for testing.

| Event Name                    | Description                                            |
| ----------------------------- | ------------------------------------------------------ |
| `stencil_componentWillLoad`   | Dispatched for each component's `componentWillLoad`.   |
| `stencil_componentWillUpdate` | Dispatched for each component's `componentWillUpdate`. |
| `stencil_componentWillRender` | Dispatched for each component's `componentWillRender`. |
| `stencil_componentDidLoad`    | Dispatched for each component's `componentDidLoad`.    |
| `stencil_componentDidUpdate`  | Dispatched for each component's `componentDidUpdate`.  |
| `stencil_componentDidRender`  | Dispatched for each component's `componentDidRender`.  |

### initializeNextTick

**Default: `false`**

When a component is first attached to the DOM, this setting waits a single tick before
rendering. This works around an Angular issue where Angular attaches elements before
setting their initial state, leading to double renders and unnecessary event dispatches.

### additionalTagTransformers

Auto-apply `transformTag` to most static tag names within your component library (including CSS selectors), rather than calling it manually. Use `'prod'` to enable only in production builds. Refer to the [Tag Transformation](../guides/tag-transformation.md) page for more information — tag transformation itself (`setTagTransformer()`/`transformTag()`) is always available at runtime and doesn't need a config flag; this option only controls the auto-apply behavior.

## Removed in v5

A few `extras` options from Stencil v4 have no `compat` equivalent — they were removed outright rather than renamed:

- **`tagNameTransform`** — no longer a config flag. Tag transformation is always available via [`setTagTransformer()`/`transformTag()`](../guides/tag-transformation.md); see `additionalTagTransformers` above for the CSS/selector auto-apply behavior.
- **`experimentalImportInjection`** — use [`enableImportInjection`](#enableimportinjection), which now defaults to `true`.
- **`experimentalScopedSlotChanges`**, **`experimentalSlotFixes`**, **`slotChildNodesFix`**, **`scopedSlotTextContentFix`**, **`appendChildSlotFix`**, **`cloneNodeFix`** — consolidated into [`lightDomPatches`](#lightdompatches) above.
- **`scriptDataOpts`** — removed with no replacement, along with the legacy `<script data-opts="...">` bootstrap path it read from.
- **`addGlobalStyleToComponents`** — replaced by the `inject` property (`'none'`, `'client'`, or `'all'`) on the new first-class `global-style` output target.
