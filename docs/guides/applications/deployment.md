---
title: Deploying an Application
sidebar_label: Deployment
sidebar_position: 2
description: Deploy an app built with Stencil's www output target
slug: /static-site-generation-deployment
---

# Deploying an Application

A production build writes your app to the `www` directory as static files: HTML, JavaScript, CSS, and whatever you copy in. To deploy the app, upload that directory to any host that serves static files.

```bash
stencil build
```

## Serving from a Subdirectory

If the app isn't served from the root of its domain, set `baseUrl` on the [`www` output target](../../output-targets/main/www.md):

```tsx title="stencil.config.ts"
outputTargets: [
  {
    type: 'www',
    baseUrl: '/docs/',
  },
],
```

Stencil then writes the app to `www/docs/`. Paths in your `src/index.html` aren't rewritten, so point its script and link tags to the new location, such as `/docs/build/myapp.js`.

## Client-Side Routes

An app that changes its URL in the browser, without a page load, has URLs that don't match a file on the server. Opening one of those URLs directly gets a "not found" response from a static host.

There are two ways to handle them:

- **Prerender the app.** [Prerendering](./prerendering/01-overview.md) writes an `index.html` for every URL it finds, so each one is a real file. Every page then loads with its content already rendered.
- **Add a fallback.** Configure the host to serve `index.html` for any path that doesn't match a file. Most static hosts have a setting for this.

The [dev server](../../config/dev-server.md) already serves `index.html` for paths that don't match a file, so this only shows up once the app is deployed.
