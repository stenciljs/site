---
title: Stencil - A Compiler for Web Components
sidebar_label: Overview
description: Stencil has a number of add-ons that you can use with the build process.
slug: /introduction
---

# Overview

## Stencil: A Web Components Compiler

Stencil is a compiler that generates Web Components (more specifically, Custom Elements). Stencil combines the best concepts of the most popular frameworks into a simple build-time tool.

Stencil uses TypeScript, JSX, and CSS to create standards-compliant Web Components that can be used to craft high quality component libraries.

Web Components generated with Stencil can be used with popular frameworks right
out of the box. In addition, Stencil can generate framework-specific wrappers that
allow Stencil components to be used with a framework-specific developer experience.

Compared with using the [Custom Elements
APIs](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)
directly, Stencil provides [convenient APIs](../components/api.md) which make writing fast
components simpler. With a Virtual DOM, JSX, and async rendering, it is easy to
create fast and powerful components which are still 100% compatible with Web
Components standards. In addition to making it easier to author Custom
Elements, Stencil also adds a number of key capabilities on top of Web
Components, such as prerendering and objects-as-properties (instead of just
strings).

The developer experience is also tuned, and comes with live reload and a small dev server baked into the compiler.

## How can I use Stencil?

### Design Systems & Component Libraries

Stencil's primary objective is providing amazing tools for design systems and component libraries. Components as a concept provide similar language for engineers and designers to have productive conversations about design implementation. [Visit the Stencil for Design Systems page to learn more.](../guides/design-systems.md)

## The History of Stencil

Stencil was originally created by the **[Ionic Framework](http://ionicframework.com/)** team in order to build faster, more capable components that worked across every major framework.

The emergence of Progressive Web Apps as a rapidly growing target for web developers demanded a different approach to web app development performance. With Ionic's classic use of traditional frameworks and bundling techniques, the team was struggling to meet latency and code size demands for Progressive Web Apps that ran equally well on fast and slow networks, across a diversity of platforms and devices.

Additionally, framework fragmentation had created a web development interoperability nightmare, where components built for one framework didn't work with another framework.

Web Components offered a solution to both problems, pushing more work to the browser for better performance, and targeting a standards-based component model that all frameworks could use.

Web Components by themselves, however, weren't enough. Building fast web apps required innovations that were previously locked up inside of traditional web frameworks. Stencil was built to pull these features out of traditional frameworks and bring them to the fast emerging Web Component standard. While Stencil is intended to be used primarily to build design systems and component libraries, these innovations allowed entire applications to be built using only Stencil.
