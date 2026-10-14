---
title: Framework Integration
sidebar_label: Overview
description: How to make your Stencil components feel native in Angular, React, Vue, and other frameworks
slug: /overview
---

# Framework Integration

Stencil components are standard custom elements, so they work in any framework, or [with none](./javascript.md). What varies is how well a framework's own tooling understands them: whether templates are type-checked, whether custom events and form bindings feel native, and whether components can be rendered on the server.

Stencil can generate two kinds of integration for your library. Both are produced by output targets you add to your `stencil.config.ts`, and both can be set up with the [`stencil add`](../getting-started/01-getting-started.md#adding-capabilities-later) wizard.

## Framework Types

[Framework Types](./framework-types.md) generates type definitions that teach a framework's TypeScript tooling about your tags, props, and events. Consumers keep using your custom elements directly, now with type-checking and autocomplete.

It supports React 19, Vue 3, Solid, Svelte, and Preact, all of which render custom elements well on their own. It adds nothing to what your consumers ship, and there's no extra package for you to publish.

## Framework Wrappers

A wrapper output target generates a real component for each of your Stencil components, in a package you publish alongside your library:

- [Angular](./angular.md)
- [React](./react.md)
- [Vue](./vue.md)

Wrappers go further than types. Consumers import `MyButton` like any other component in their framework, and get the features custom elements alone don't give them there:

| | Angular | React | Vue |
|---|---|---|---|
| Typed props and events | yes | yes | yes |
| Form bindings | `ngModel`, reactive forms | | `v-model` |
| Server-side rendering | | Next.js | Nuxt |
| Works without `CUSTOM_ELEMENTS_SCHEMA` | yes | | |
| Supports older versions | | React 18 | |

## Choosing

Use wrappers for Angular, and for any framework where your consumers need form bindings or [server-side rendering](../output-targets/main/ssr/frameworks.md). Use Framework Types when typed custom elements are enough. You can ship both from the same library.
