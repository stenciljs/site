---
title: Stencil Frequently Asked Questions
sidebar_label: FAQ
description: Short answers to common questions about Stencil
slug: /faq
---

# FAQ

For what Stencil is and why it exists, see the [overview](../concepts/01-overview.md) and [Stencil's goals](../concepts/02-goals-and-objectives.md).

## What Stencil Provides

### Does Stencil have a component library?

No. Stencil is a toolchain for building component libraries, and doesn't provide one of its own. The most widely used library built with Stencil is [Ionic Framework](https://ionicframework.com/).

### Does Stencil come with a testing framework?

Stencil has no test runner built in. Two packages maintained alongside it add Stencil support to existing tools: [`@stencil/vitest`](../testing/vitest/01-overview.md) for component tests, in a browser or in Node, and [`@stencil/playwright`](../testing/playwright/01-overview.md) for end-to-end tests. See [Testing](../testing/01-overview.md).

### What are framework bindings?

Stencil components are standard custom elements, so they work in any framework. Framework bindings add what each framework's developers expect on top of that, such as typed props and events. Stencil can generate them as [types for a framework's templates](../framework-integration/framework-types.md), or as wrapper components for [React](../framework-integration/react.md), [Vue](../framework-integration/vue.md), and [Angular](../framework-integration/angular.md). See [Framework Integration](../framework-integration/01-overview.md).

## Technology

### What template syntax does Stencil use?

Stencil uses [JSX](../components/templating-and-jsx.md), the markup syntax popularized by React.

### Can Stencil components be lazy loaded?

Yes. The [`loader-bundle`](../output-targets/main/loader-bundle.md) output registers every component up front, and downloads the code for each one the first time it appears on the page. Components built with the [`standalone`](../output-targets/main/standalone.md) output can instead be imported one at a time through a bundler.

### What dependencies does the Stencil runtime have?

None. Each build includes the small part of Stencil's runtime that its components use, and nothing else needs to be installed to use them. If several Stencil libraries should share one copy of the runtime, the `externalRuntime` option of the [`standalone`](../output-targets/main/standalone.md#externalruntime) and [`loader-bundle`](../output-targets/main/loader-bundle.md#externalruntime) outputs leaves it as an import of `@stencil/core`.

### Can data be passed to Web Components?

Yes. As with any DOM element, you can set arrays, objects, strings, and numbers on a component's [properties](../components/properties.md). Attributes carry strings, which Stencil converts to the property's type.

### What browsers can support Stencil components?

Stencil components run in all modern browsers. See the [browser support table](./support-policy.md#browser-support) for the minimum versions.

## Stencil Project

### Who works on Stencil?

Stencil is backed by [OutSystems](https://www.outsystems.com/), and is maintained by an open-source community together with developers from [Ionic](https://ionicframework.com/).

### Is Stencil open source?

Yes. Stencil's source code is [on GitHub](https://github.com/stenciljs/core), under the [MIT license](https://github.com/stenciljs/core/blob/main/LICENSE).

### How do I get involved?

Contributions are welcome. You can report issues and request features in the [issue tracker](https://github.com/stenciljs/core/issues), help to reproduce bugs, or send a pull request. See the [Contributor Guide](https://github.com/stenciljs/core/blob/main/CONTRIBUTING.md), and join the community on [Discord](https://chat.stenciljs.com/).
