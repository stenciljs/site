---
title: Stencil - A Compiler for Web Components
sidebar_label: About
description: Stencil has a number of add-ons that you can use with the build process.
slug: /introduction
---

# About Stencil

## Stencil: A Web Components Compiler

Stencil is a compiler that generates Web Components (more specifically, Custom Elements). Stencil combines the best concepts of the most popular frameworks into a simple build-time tool.

Stencil uses TypeScript, JSX, and CSS to create standards-compliant Web Components that can be used to craft high quality component libraries.

### What Stencil Adds

The Web Component specs are purposely low-level. Writing custom elements by hand means keeping attributes and properties in sync, rendering, and updating the DOM yourself, and the result has no types and no server rendering.

Stencil gives you a small set of [decorators and APIs](../components/api.md) for props, state, events, and JSX rendering. Your components, styles, and doc comments go in. Out comes everything you ship:

- standard custom elements that work in any framework, or none, in the browser or [rendered on a server](../output-targets/main/ssr.md)
- [types and framework wrappers](../framework-integration/01-overview.md), so components feel native in React, Vue, and Angular
- [documentation](../output-targets/documentation-generation/01-overview.md): readmes, a Custom Elements Manifest, editor autocomplete data, and an agent skill

**Built for design systems:**

- style components however you like, from shadow DOM to light DOM to a tag with [no JS class at all](../components/css-only.md) (see [Component Archetypes](../concepts/component-archetypes.md))
- develop global styles and themes side by side with your components
- preview components one at a time in the [dev server](../config/dev-server.md), no app shell required

## The History of Stencil

Stencil was created by the [Ionic Framework](https://ionicframework.com/) team. Ionic's components were built with traditional frameworks, which made them too slow and too large for Progressive Web Apps on slow networks and devices, and tied them to one framework at a time.

Web Components solved both problems: the browser does more of the work, and every framework can use them. On their own, though, they lacked the developer experience that frameworks offered. Stencil brings that experience to the Web Component standard. It's aimed first at design systems and component libraries, and it can build whole applications too.

Today, Stencil is backed by [OutSystems](https://www.outsystems.com/) and maintained by an open-source community together with developers from Ionic.
