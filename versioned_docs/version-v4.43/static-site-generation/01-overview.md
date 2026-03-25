---
title: Static Site Generation
sidebar_label: Overview
slug: /static-site-generation
---

# Static Site Generation with Stencil

One of the best ways to build fast, interactive web sites and web apps is to utilize Static Site Generation instead of Server Side Rendering (known as SSR) or Client Side Rendering (known as Single Page Apps, or SPAs).

Static Site Generation (SSG) means building and rendering components and routes at build time (aka prerendering) rather than server request time (SSR) or at client run-time (SPA). Because a route is already prerendered, all of the content for the route is available to search engines and clients _immediately_, so SEO and performance are maximized.

Static Site Generation doesn't mean your pages have to be and/or _stay_ static! Stencil utilizes hydration to efficiently load client-side components at runtime to get the best of both worlds.

Since Static Site Generation prerenders components, there are some tradeoffs and things to keep in mind, but most components can be easily prerendered without much modification.

Stencil makes SSG easy, so read on to see how to incorporate it into your apps.

## Benefits of Static Site Generation

- Great [Lighthouse](https://developers.google.com/web/tools/lighthouse/) scores
- Faster time to [Largest Contentful Paint (LCP)](https://web.dev/lcp/)
- Better [Search Engine Optimization (SEO)](https://support.google.com/webmasters/answer/7451184)
- Provides functionality for users with JavaScript disabled

## How Static Site Generation and Prerendering Works

**Build Hydrate App**: The first step in prerendering is for the compiler to generate a "hydrate" app, which is a single directory to be used by Node.js. The "hydrate" app is automatically generated when the `--prerender` CLI flag is provided and by default the app is saved to `dist/hydrate`. Prerendering uses the hydrate app internally, however it can be used directly at a lower-level. [Learn more about the Hydrate App](../guides/hydrate-app.md)

**Fork Prerender Tasks to Available CPUs**: Stencil can efficiently divide out the prerendering to each of the current machine's CPUs using [Node.js' Child Process API](https://nodejs.org/api/child_process.html). By tasking each CPU on the machine, the compiler can drastically speed up prerendering times.

**Prerender Index**: After the compiler has completed the build and created child processes on each available CPU, it will then kick off the prerendering by starting at the single base URL, or the configured entry URLs. Once the page has finished prerendering it'll be written to the configured `www` directory as an `index.html` file.

**Crawl App**: During each page prerender, Stencil also collects the anchor elements and URLs used within the page. With this information, it's able to inform the main thread of which pages should be prerendered next. The main thread is in charge of orchestrating all of the URLs, and the job is finished once all of the pages have been crawled and prerendered.

**Deploy Static Files to Production**: Now that all of the pages have been prerendered and written as static HTML files, the `www` directory can now be deployed to a server. A significant difference from prerendering and Server-side Rendering (SSR), is that the HTTP server is just serving up static HTML files rather than dynamically generating the HTML on the server.

**Static HTML Response**: With the static HTML files deploy to a server, visitors of each prerendered page first receive the HTML with inline styles, and no blocking JS or CSS. Additionally, the compiler is already aware of the exact modules the visitor will need for this page, and will asynchronously preload the modules using [link `modulepreload`](https://html.spec.whatwg.org/multipage/links.html#link-type-modulepreload).

**Client-side Hydration**: After the HTML and inlined styles have rendered the first paint, the next step is for the same nodes within the DOM to be hydrated by the client-side JavaScript. Each component within the page will asynchronously hydrate using the initial order they were found in the DOM structure. Next, as each component lazily hydrates they're able to reuse the existing nodes found in the DOM.

## Tooling

To be clear, Stencil does _not_ use `Puppeteer` or `jsdom` for prerendering. Puppeteer is great for End-to-End
testing, but for performance reasons it's not ideal to quickly generate a large website with hundreds or thousands of pages. Additionally, `jsdom` is often used for unit testing, but in our experience it's difficult to use with async components and its global environment nature.

Instead, Stencil uses its own internal DOM APIs which strictly follow the web standards, but optimized for prerendering, Static Site Generation and Server-side Rendering. By doing so, developers can still use all the same APIs they're already familiar with, but they'll seamlessly work within a NodeJS environment too. This means developers often do not have to write code differently in how they're building components, but rather they focus only on writing one type of component, and coding it using the standards they already know. To reiterate, developers do not have to learn a new API for prerendering. It's just the same web APIs your components are already using.

Every component, machine and environment will perform differently, so it's difficult to provide a consistent benchmark. However, what we do know is that [Ionic's Documentation site](https://ionicframework.com/docs) has hundreds of pages and Stencil is able to prerender the entire site in a few seconds.
