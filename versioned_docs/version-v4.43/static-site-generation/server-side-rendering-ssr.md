---
title: Combining Server Side Rendering and Static Site Generation
sidebar_label: Server Side Rendering
description: How to combine both Server Side Rendering and Static Site Generation approaches
slug: /static-site-generation-server-side-rendering-ssr
---

# Combining Server Side Rendering and Static Site Generation

Static Site Generation and Server Side Rendering are often confused but are very different approaches to solve the same problem: providing already rendered content to the client before the client has loaded and rendered itself.

Server Side Rendering (SSR) is the process of rendering content to a client based on an HTTP request. A client makes a request and the server processes it, returning rendered HTML back to the client. The Client then hydrates that HTML and bootstraps the client-side JS app.

Static Site Generation (SSG) does the rendering at build time instead of request time, so the server does not need to do any additional rendering and requests can be processed very quickly. The process for the client hydrating and bootstrapping is the same, however.

SSG has limits, and pages that require some server-side processing before rendering won't benefit from using it. However, that set of pages that _truly_ need to be rendered at request time on the server is lower than most would think. For example, instead of using SSR, why not prerender and simply make an API request from the Client? Or configure the server to modify headers without having to run a classic expressjs/etc. server?

If a page simply _must_ be Server Side Rendered, then that can be done using Stencil's [hydration functionality](../guides/hydrate-app.md) in any Node.js based server.

