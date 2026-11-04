---
title: Avoiding Tag Name Clashes
sidebar_label: Overview
description: Two ways to run components with the same tag names on one page
slug: /tag-name-clashes
---

# Avoiding Tag Name Clashes

Custom elements are normally defined in one global registry, `window.customElements`, and each tag name can be defined only once. Defining the same name a second time throws an error.

That's a problem whenever two sets of components with the same tag names end up on one page. Often it's two versions of the same library: the app loads version 1 of `@component/library`, which defines `<my-button>`, and its `/admin` section, or an embedded micro-frontend, loads version 2. Version 2 fails to define `<my-button>`, and its components don't work.

Stencil gives applications two ways to avoid the clash:

- **[Tag transformation](./tag-transformation.md)** registers a library's components under different tag names, such as `<v2-my-button>`.
- **[Scoped custom element registries](./scoped-registries.md)** keep the tag names, and define the components in a separate registry that applies to only part of the page.

| | Tag transformation | Scoped registries |
|---|---|---|
| Tag names | Changed, e.g. `<my-button>` becomes `<v2-my-button>` | Unchanged |
| CSS selectors and `querySelector()` strings | Need the new names, or [`additionalTagTransformers`](./tag-transformation.md#compatadditionaltagtransformers) | Unchanged |
| Where components work | Anywhere on the page | Only in roots that use the registry |
| Framework support | None needed beyond using the new tag names, which the [framework wrappers](./tag-transformation.md#framework-integrations) support | The framework must create elements through the registry: a virtual DOM renderer, for example, has to be registry-aware |
| Browser support | All browsers | [Newer browsers](./scoped-registries.md#browser-support) |
