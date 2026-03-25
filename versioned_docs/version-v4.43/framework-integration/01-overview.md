---
title: Framework Integration
sidebar_label: Overview
description: Framework Integration
slug: /overview
---

# Framework Integration

Stencil's primary goal is to remove the need for components to be written using a specific framework's API.
It accomplishes this by using standardized web platform APIs that work across all modern browsers.
Using the low-level component model that is provided by the browser (which all frameworks are built on) allows Stencil components to work inside a framework or without one.

The experience of integrating web components directly into existing applications can be tricky at times, as frameworks have varying support for vanilla web components.
In order to accommodate the various issues the Stencil team has created Framework Wrappers to make the process simpler.

The Framework Wrappers are configured like output targets, and emit a native library, just like if your components were originally written using any of these frameworks:

- [Angular](./angular.md)
- [React](./react.md)
- [Vue](./vue.md)
- [Ember (Community)](./ember.md)

By using Stencil bindings, you can build your components once, and have Stencil emit Angular/React/Vue libraries.
This way, the consumers of your components can enjoy all the features of their framework of choice.
