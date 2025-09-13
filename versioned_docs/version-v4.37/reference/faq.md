---
title: Stencil Frequently Asked Questions
sidebar_label: FAQ
description: Stencil is a developer-focused toolchain for building reusable, scalable component libraries.
slug: /faq
---

# FAQ

## Introduction

### What is Stencil?

Stencil is a developer-focused toolchain for building reusable, scalable component libraries. It provides a compiler that generates highly optimized Web Components, and combines the best concepts of the most popular frameworks into a simple build-time tool.

Stencil focuses on building components with web standards. It’s used by developers and organizations around the world, and is [100% free and MIT open source](https://github.com/ionic-team/stencil/blob/main/LICENSE.md).


### What does Stencil do?

Stencil helps developers and teams build and share custom components. Since Stencil generates standards-compliant Web Components, the components you build with Stencil will work with many popular frameworks right out of the box, and can even be used without a framework because they are just Web Components. Stencil also enables a number of key capabilities on top of Web Components, in particular, prerendering, and objects-as-properties (instead of just strings).


### Who is Stencil for?

Stencil is for developers and teams that want to build custom component libraries that can be shared across teams, frameworks and large organizations.

Stencil can also be used by designers who want their original design visions delivered consistently, with high fidelity, to all users.


### Who makes Stencil?

Stencil is an open source project started by the [Ionic core team](https://ionicframework.com/), with contributions also coming from the community.


### Why was Stencil created?

Stencil was created by the Ionic Framework team to make our own component library faster, smaller, and compatible with all major frameworks. Web Components offered a solution by pushing more work to the browser for better performance, and targeting a standards-based component model that all frameworks could use.


### Who uses Stencil?

Stencil was initially developed for Ionic Framework which is a very successful Web Component-based library & UI framework. Web Components are now in thousands of app store apps, and nearly 4 million new Ionic Framework projects are being created every year.


### How does Stencil compare to traditional frameworks?

The Web Component ecosystem has a diverse set of players, each with a different long-term vision for what Web Components can and should do.

Some think Web Components should replace third-party app frameworks, while others think that Web Components are more suited for leaf/style/design nodes and shouldn’t get in the business of your app’s component system. There are also many framework developers that don’t see the point of Web Components, or consider them to be an affront to front-end innovation.

With Stencil, our vision is somewhere in the middle. In the long term, we see app development teams continuing to use their framework of choice. We envision these frameworks continuing to get better, smaller, and more efficient, with increasingly good support for targeting and consuming Web Components -- and big teams will be consuming an increasing amount of Web Components as companies continue to embrace them for shared component libraries.

At the same time, we believe an indispensable feature for Web Components is solving those component distribution and design system problems. We also believe, however, that 90% of the market doesn’t have those problems to begin with, so the current debate about the merits of Web Components is somewhat unproductive.


### Why is Stencil considered framework-agnostic?

Perhaps the most appealing benefit of Web Components is that they give your development teams the flexibility to choose the underlying tools and frameworks - and versions of those frameworks - and tools that they prefer. As pointed out earlier, one of the great challenges of implementing a universal set of components is getting all of your development teams to standardize on just one set of technologies. With Web Components, each team can use what works best for them, giving them complete freedom to use the tools they love—today and tomorrow.


## What does Stencil provide?

### Does Stencil have a component library?

The most widely used Stencil component library is the Ionic Framework, however, Stencil itself is only a toolchain and does not provide its own component library. We encourage you to first review Ionic components if you are building an application.


### Is Stencil a framework?

Stencil purposely does not strive to act as a stand-alone framework, but rather a tool which allows developers to scale framework-agnostic components across many projects, teams and large organizations. One of Stencil’s superpowers is its flexibility: its components could be used stand-alone, or within traditional frameworks.


### Does Stencil come with a testing framework?

Yes, Stencil provides a rich set of APIs for unit and End-to-end tests. [Learn more about testing with Stencil](../testing/01-overview.md).



## Technology


### Why does Stencil use web components?

By using a consistent set of web standards, Web Components do not depend on a specific framework runtime to execute. As frameworks change their APIs, Web Components do not, allowing for the original source to continue to work natively in a browser.


### How is Stencil able to optimize component file size and startup?

Traditional frameworks provide a runtime API, and developers can pick and choose which APIs to use per component. However, this means every feature needs to be available to every component, just in case the component may or may not use the API.

With Stencil, the compiler is able to perform static analysis on each component in order to understand which APIs are and are not being used. By doing so, Stencil is able to customize each build to use exactly what each component needs, making for a highly optimized runtime with minimal size.

Since Stencil uses a compiler, it is able to adjust code as new improvements and features become available. Source code can continue to be written using the same public API and syntax, while the compiler can adjust the code to further take advantage of modern features, without requiring re-writes.


### What template syntax does Stencil use?

Stencil uses [JSX](https://react.dev/learn/writing-markup-with-jsx), a markup language popularized by the React library.


### Can Stencil components be lazy loaded?

Yes! Lazy loading components helps to reduce application startup times, decrease bundle sizes, and improve distribution.

Because users are able to dynamically load only what is used, startup times are drastically reduced and users only load exactly what their application’s first paint requires.

At the same time, components built with Stencil can still be imported and consumed by traditional bundlers.


### Why are Stencil components written with TypeScript?

Stencil was originally built for Ionic, and in our experience we’ve found TypeScript to be a valuable tool for maintaining a large codebase across multiple teams.


### What dependencies does the Stencil runtime have?

None. The code generated by Stencil does not rely on Stencil, but rather it generates highly-optimized, framework-free, stand-alone code which runs natively in the browser.


### Can data be passed to Web Components?

Just like any other DOM element in a webpage, any data in the form of arrays, objects, strings and numbers can be passed to element properties. Stencil is designed from the ground up to ensure this capability stays unlocked for application developers.


### What technology is Stencil built with?

The Stencil compiler is built with TypeScript and is [distributed on npm](https://www.npmjs.com/package/@stencil/core). Its distribution includes types, making it easier for developers to use Stencil APIs.


## Capabilities

### Where can Stencil components be used?

One great advantage of using Web Components is that your component library will work across all projects, not just desktop web apps.

For example, using a hybrid mobile framework like Ionic, you can deploy Web Components across just about any platform or device, from native iOS and Android apps, to Electron and desktop web apps, and even Progressive Web Apps.


### What are the limitations of Web Components?

The [Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components) specs are purposely low-level, and on their own, they do not provide a framework quality developer experience. Web Components run on a fairly primitive set of standards, so you will need a little help to get them to meet your objectives.

Some limitations include:

When you try to use pure vanilla Web Components in an application, functionality like server-side rendering and progressive enhancement is not supported by default, and
some out-of-date clients don’t support the Web Components standard.

In addition, while Web Components technically work with any framework, there are some limitations like lack of type support and input bindings, and challenges passing properties to components, as noted above.

The good news is that, with help from open source tools like Stencil, you can overcome all of these challenges. Stencil includes framework bindings for Angular, React, and Vue, so you can easily import Web Component libraries into any framework, and interact with them just like they were native to that framework, with all the functionality you’re used to.


### What are framework bindings?

While Web Components can be paired with any JavaScript framework, Stencil has built-in special-purpose bindings to deliver the more advanced features enterprise teams expect when building applications in Angular, React, and Vue.


### What features does Stencil add to Web Components?

Web Components by themselves weren't enough to provide a quality development experience. Building fast web apps required innovations that were previously locked up inside traditional web frameworks. Stencil was built to pull these features out of traditional frameworks and bring them to the fast emerging Web Component standard.

Compared to using Web Components directly, Stencil provides extra APIs that make writing fast components simpler. APIs like Virtual DOM, JSX, and async rendering make fast, powerful components easy to create, while still maintaining 100% compatibility with Web Components.


### What browsers can support Stencil components?

Stencil works on modern browsers.

[Learn more about browser support](./support-policy.md#browser-support).


## Stencil Project

### How do I get involved?

Stencil is an open source project, and we encourage you to contribute. You can start by creating issues on GitHub, submitting feature requests, and helping to replicate bugs. If you’re interested in contributing, please see our [Contributor Guide](https://github.com/ionic-team/stencil/blob/main/.github/CONTRIBUTING.md) and check out our [issue tracker](https://github.com/ionic-team/stencil/issues).


### Is Stencil open source?

Yes, Stencil is open source and its source code can be [found on GitHub](https://github.com/ionic-team/stencil). Contributions are welcomed from the community.

### Which software license does Stencil use?

Stencil’s software [license is MIT](https://github.com/ionic-team/stencil/blob/main/LICENSE.md).


### Who works on Stencil?

The majority of the development is done by engineers at [Ionic](https://github.com/ionic-team/ionic). If you’re excited about Stencil, we encourage you to join the community and contribute! Best place to start is on the [discord channel](https://chat.stenciljs.com/).

