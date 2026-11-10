---
title: Framework Integration
sidebar_label: Overview
description: How to make your Stencil components feel native in Angular, React, Vue, and other frameworks
slug: /overview
---

# Framework Integration

Stencil components are standard custom elements, so they work in any framework, or [with none](./javascript.md). What varies is how well a framework's own tooling understands them: whether templates are type-checked, whether custom events and form bindings feel native, and whether components can be rendered on the server.

Stencil can generate two kinds of integration for your library. Both are produced by output targets you add to your `stencil.config.ts`, and both can be set up with the [`stencil add`](../introduction/02-installation.md#adding-capabilities-later) wizard.

## Framework Types

[Framework Types](./framework-types.md) generates type definitions that teach a framework's TypeScript tooling about your tags, props, and events. Consumers keep using your custom elements directly, now with type-checking and autocomplete.

It supports React 19, Vue 3, Solid, Svelte, and Preact, all of which render custom elements well on their own. It adds nothing to what your consumers ship, and there's no extra package for you to publish.

## Framework Wrappers

A wrapper output target generates a component for each of your Stencil components, in a package you publish alongside your library. Consumers import `MyButton` like any other component in their framework, with typed props and events. Each wrapper also adds what custom elements alone don't get in that framework:

- [Angular](./angular.md): no `CUSTOM_ELEMENTS_SCHEMA` in the modules or components that use them, and optional form controls that work with `ngModel` and reactive forms.
- [React](./react.md): support for React 18, which can't pass objects to a custom element or listen for its custom events in JSX, and optional server-side rendering in Next.js.
- [Vue](./vue.md): `v-model` on your form controls.

## Choosing

Use wrappers for Angular, for any framework where your consumers need form bindings, and for [server-side rendering](./react.md#server-side-rendering) in Next.js. Use Framework Types when typed custom elements are enough: they [server-render](../output-targets/main/ssr.md#using-it-in-a-server-framework) in other frameworks too. You can ship both from the same library.

To write Stencil components directly in an app, without publishing a library, compile them in the app's own build with the [bundler plugin](../guides/tooling/bundler-plugin.md).
