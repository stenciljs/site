---
title: Static Site Generation Basics in Stencil
sidebar_label: Basics
description: Quick introduction to configuring and using Static Site Generation in Stencil
slug: /static-site-generation-basics
---

# Static Site Generation Basics

Rendering components at build time (rather than purely server or client-time), can add significant performance improvements to your app, and maximize SEO impact.

Using Static Site Generation in Stencil requires running a build command and ensuring all known URLs are properly discovered and built.

## Static Build

Stencil doesn't prerender components by default. However, the build can be made to prerender using the `--prerender` flag:

```bash
stencil build --prerender
```

## Integration with a Router

Since Stencil will actually navigate to and execute components, an app that uses a [client-side router](../01-overview.md#add-routing) is prerendered one route at a time, and each page gets the content of its own route.

There are no changes necessary to access route params and matches. However, make sure your routes can accept a trailing slash as prerendered static content will be treated as loading an `index.html` file at that path, and so the browser may append a trailing slash.

## Page and URL Discovery

By default, Stencil crawls your app starting at base URL of `/` and discovers all paths that need to be indexed. By default this will only discover pages that are linked at build time, but can be easily configured to build any possible URL for the app.

As each page is generated and new links are found, Stencil will continue to crawl and prerender pages.

See the [prerender config](./prerender-config.md) docs to see how this can be customized further.

## Things to Watch For

Prerendering runs your components on the server, so the same considerations apply as for server-side rendering. See [Authoring Components for SSR](../../../output-targets/main/ssr/authoring.md).
