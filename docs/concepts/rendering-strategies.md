---
title: Rendering Strategies
sidebar_label: Rendering Strategies
description: Client-side rendering, server-side rendering, prerendering, and rendering from non-JavaScript servers
slug: /rendering-strategies
---

# Rendering Strategies

A Stencil component can render in three places: in the browser, on a server when a page is requested, or at build time. A component library doesn't have to pick one. You can ship everything a consumer needs for each, and let each application choose.

## Client-Side Rendering

Components render in the browser once their JavaScript loads. This is what [`loader-bundle`](../output-targets/main/loader-bundle.md) and [`standalone`](../output-targets/main/standalone.md) give you, and it works everywhere with no server involvement.

The cost is time: a component has no content until its JavaScript arrives and runs. For content that needs to be visible immediately, or readable by crawlers and link previews, render it earlier.

## Server-Side Rendering (SSR)

Components render on a server for each request, and the browser receives finished HTML. The client-side JavaScript then hydrates the markup, reusing it rather than rendering again.

Ship the [`ssr`](../output-targets/main/ssr/01-overview.md) output target so consumers can do this. It runs in Node.js, Deno, Bun, and edge runtimes, and plugs into [most server frameworks](../output-targets/main/ssr/frameworks.md). For a server written in another language, such as PHP, Java, or Go, ship [`ssr-wasm`](../output-targets/main/ssr-wasm/01-overview.md) as well.

## Prerendering (SSG)

Pages render once at build time, and a static host serves the HTML. This gives the same fast first paint as SSR, with no server work per request - but only for content known at build time.

Prerendering is for applications built with Stencil's [`www`](../output-targets/main/www.md) output target. See [Prerendering](../guides/applications/prerendering/01-overview.md).

## Choosing Between SSR and Prerendering

Prerender a page when its content is the same for every visitor, or changes only when you deploy. Server-render it when the content depends on the request - the signed-in user, a query, or data that changes between deploys.

Fewer pages need request-time rendering than it first seems. A prerendered page can still fetch per-user data from the browser after it loads, and many per-request needs, like redirects and headers, can be handled by the server or CDN without rendering anything.
