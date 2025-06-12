---
title: Extras Config
sidebar_label: Extras
description: Extras Config
slug: /config-extras
---

# Extras

The `extras` config contains options to enable new/experimental features in
Stencil, add & remove runtime for DOM features that require manipulations to
polyfills, etc. For example, not all DOM APIs are fully polyfilled when using
the Slot polyfill. Most of these are opt-in, since not all users require the
additional runtime.

### appendChildSlotFix

By default, the slot polyfill does not update `appendChild()` so that it appends new child nodes into the correct child slot like how shadow dom works. This is an opt-in polyfill for those who need it.

### cloneNodeFix

By default, the runtime does not polyfill `cloneNode()` when cloning a component that uses the slot polyfill. This is an opt-in polyfill for those who need it.

### enableImportInjection

In some cases, it can be difficult to lazily load Stencil components in a separate project that uses a bundler such as
[Vite](https://vitejs.dev/).

Enabling this flag will allow downstream projects that consume a Stencil library and use a bundler such as Vite to lazily load the Stencil library's components.

In order for this flag to work:

1. The Stencil library must expose lazy loadable components, such as those created with the
   [`dist` output target](../output-targets/dist.md)
2. The Stencil library must be recompiled with this flag set to `true`

This flag works by creating dynamic import statements for every lazily loadable component in a Stencil project.
Users of this flag should note that they may see an increase in their bundle size.

Defaults to `false`.

### experimentalImportInjection

:::caution
This flag has been deprecated in favor of [`enableImportInjection`](#enableimportinjection), which provides the same
functionality. `experimentalImportInjection` will be removed in a future major version of Stencil.
:::

In some cases, it can be difficult to lazily load Stencil components in a separate project that uses a bundler such as
[Vite](https://vitejs.dev/).

This is an experimental flag that, when set to `true`, will allow downstream projects that consume a Stencil library
and use a bundler such as Vite to lazily load the Stencil library's components.

In order for this flag to work:

1. The Stencil library must expose lazy loadable components, such as those created with the
   [`dist` output target](../output-targets/dist.md)
2. The Stencil library must be recompiled with this flag set to `true`

This flag works by creating dynamic import statements for every lazily loadable component in a Stencil project.
Users of this flag should note that they may see an increase in their bundle size.

Defaults to `false`.

### experimentalScopedSlotChanges

This option updates runtime behavior for Stencil's support of slots in **scoped** components to match more closely with
the native Shadow DOM behaviors.

When set to `true`, the following behaviors will be applied:

- Stencil will hide projected nodes that do not have a destination `slot` ([#2778](https://github.com/ionic-team/stencil/issues/2877)) (since v4.10.0)
- The `textContent` getter will return the text content of all nodes located in a slot (since v4.10.0)
- The `textContent` setter will overwrite all nodes located in a slot (since v4.10.0)

Defaults to `false`.

:::note
These behaviors only apply to components using scoped encapsulation!
:::

### experimentalSlotFixes

This option enables all current and future slot-related fixes. When enabled it
will enable the following options, overriding their values if they are
specified separately:

- [`slotChildNodesFix`](#slotchildnodesfix)
- [`scopedSlotTextContentFix`](#scopedslottextcontentfix).
- [`appendChildSlotFix`](#appendchildslotfix)
- [`cloneNodeFix`](#clonenodefix)

Slot-related fixes to the runtime will be added over the course of Stencil v4,
with the intent of making these the default behavior in Stencil v5. When set to
`true` fixes for the following issues will be applied:

- Elements rendered outside of slot when shadow not enabled [(#2641)](https://github.com/ionic-team/stencil/issues/2641) (since v4.2.0)
- A slot gets the attribute hidden when it shouldn't [(#4523)](https://github.com/ionic-team/stencil/issues/4523) (since v4.7.0)
- Nested slots mis-ordered when not using Shadow DOM [(#2997)](https://github.com/ionic-team/stencil/issues/2997) (since v4.7.0)
- Inconsistent behavior: slot-fb breaks styling of default slot content in component with 'shadow: false' [(#2937)](https://github.com/ionic-team/stencil/issues/2937) (since v4.7.2)
- Slot content went missing within dynamic component [(#4284)](https://github.com/ionic-team/stencil/issues/4284) (since v4.8.2)
- Slot element loses its parent reference and disappears when its parent is rendered conditionally [(#3913)](https://github.com/ionic-team/stencil/issues/3913) (since v4.8.2)
- Failed to execute 'removeChild' on 'Node' [(#3278)](https://github.com/ionic-team/stencil/issues/3278) (since v4.9.0)
- React fails to manage children in Stencil slot [(#2259)](https://github.com/ionic-team/stencil/issues/2259) (since v4.9.0)
- Slot name is not updated when it is bind to a prop [(#2982)](https://github.com/ionic-team/stencil/issues/2982) (since 4.12.1)
- Conditionally rendered slots not working [(#5335)](https://github.com/ionic-team/stencil/issues/5335) (since 4.13.0)

:::note
New fixes enabled by this experimental flag are not subject to Stencil's
[semantic versioning policy](../reference/versioning.md).
:::

### lifecycleDOMEvents

Dispatches component lifecycle events. By default these events are not dispatched, but by enabling this to `true` these events can be listened for on `window`. Mainly used for testing.

| Event Name                    | Description                                            |
| ----------------------------- | ------------------------------------------------------ |
| `stencil_componentWillLoad`   | Dispatched for each component's `componentWillLoad`.   |
| `stencil_componentWillUpdate` | Dispatched for each component's `componentWillUpdate`. |
| `stencil_componentWillRender` | Dispatched for each component's `componentWillRender`. |
| `stencil_componentDidLoad`    | Dispatched for each component's `componentDidLoad`.    |
| `stencil_componentDidUpdate`  | Dispatched for each component's `componentDidUpdate`.  |
| `stencil_componentDidRender`  | Dispatched for each component's `componentDidRender`.  |

### scopedSlotTextContentFix

An experimental flag that when set to `true`, aligns the behavior of invoking the `textContent` getter/setter on a scoped component to act more like a component that uses the shadow DOM. Specifically, invoking `textContent` on a component will adhere to the return values described in [MDN's article on textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent#description). Defaults to `false`.

### scriptDataOpts

:::caution
This option has been deprecated and will be removed in the next major Stencil release.
:::

It is possible to assign data to the actual `<script>` element's `data-opts` property, which then gets passed to Stencil's initial bootstrap. This feature is only required for very special cases and rarely needed. When set to `false` it will not read this data. Defaults to `false`.

### slotChildNodesFix

For browsers that do not support shadow dom (IE11 and Edge 18 and below), slot is polyfilled to simulate the same behavior. However, the host element's `childNodes` and `children` getters are not patched to only show the child nodes and elements of the default slot. Defaults to `false`.
