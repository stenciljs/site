---
title: Using Stencil for an Application
sidebar_label: Overview
description: Build a website or web app with Stencil's www output target
slug: /applications
---

# Using Stencil for an Application

Stencil is built for component libraries, and it can also build a whole website or web app. The app's pages and its components live in one project, and Stencil builds them into a directory of static files that any web server can host.

## Set Up the `www` Output

An app uses the [`www` output target](../../output-targets/main/www.md):

```tsx title="stencil.config.ts"
import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'MyApp',
  outputTargets: [{ type: 'www' }],
};
```

When you create a project with the [`stencil init` wizard](../../getting-started/01-getting-started.md), choose **WWW** as an output to get this setup.

The app's entry page is `src/index.html`. It loads your components with one script, named after your `namespace` in lowercase:

```html title="src/index.html"
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>My App</title>
    <script type="module" src="/build/myapp.js"></script>
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
```

A build writes the page and the scripts to the `www` directory:

```tree
www/
├── build/
│   └── myapp.js
└── index.html
```

## Develop with the Dev Server

Run a development build that rebuilds on each change and serves the app:

```bash
stencil build --dev --watch --serve
```

The server runs at `http://localhost:3333` and updates the page after each rebuild. See the [dev server config](../../config/dev-server.md) for its options.

## Add Routing

Stencil doesn't include a router. An app with more than one page needs one to show a different component for each URL, and to move between pages without a page load.

### Ionic's Router

The [`ion-router`](https://ionicframework.com/docs/api/router) component from `@ionic/core` maps URLs to components, and renders the matching one in an `ion-router-outlet`. Load Ionic alongside your app, and list your routes in `src/index.html`:

```html title="src/index.html"
<head>
  <script type="module" src="https://cdn.jsdelivr.net/npm/@ionic/core/dist/ionic/ionic.esm.js"></script>
  <script type="module" src="/build/myapp.js"></script>
</head>
<body>
  <ion-app>
    <ion-router use-hash="false">
      <ion-route url="/" component="page-home"></ion-route>
      <ion-route url="/about" component="page-about"></ion-route>
    </ion-router>

    <ion-router-link href="/about">About</ion-router-link>

    <ion-router-outlet></ion-router-outlet>
  </ion-app>
</body>
```

`page-home` and `page-about` are components in your Stencil project.

### Stencil Community Router

[`@stencil-community/router`](https://www.npmjs.com/package/@stencil-community/router) is a small router made for Stencil. Create one router for your app:

```ts title="src/router.ts"
import { createRouter } from '@stencil-community/router';

export const Router = createRouter();
```

Then declare your routes in a component's `render()`, and link to them with `href()`:

```tsx title="src/components/app-root/app-root.tsx"
import { Component, Host } from '@stencil/core';
import { href, match, Route } from '@stencil-community/router';
import { Router } from '../../router';

@Component({
  tag: 'app-root',
})
export class AppRoot {
  render() {
    return (
      <Host>
        <nav>
          <a {...href('/')}>Home</a>
          <a {...href('/about')}>About</a>
        </nav>

        <Router.Switch>
          <Route path="/">
            <page-home></page-home>
          </Route>
          <Route path="/about">
            <page-about></page-about>
          </Route>
          <Route path={match('/blog/:page')} render={({ page }) => <h1>Post: {page}</h1>} />
        </Router.Switch>
      </Host>
    );
  }
}
```

See the package's README for redirects, guards, and routers for prerendered sites.

With either router, a URL that the router handles has no file behind it on the server. See [Client-Side Routes](./deployment.md#client-side-routes) for how to deploy an app like that.

## Go Further

- **[Deployment](./deployment.md)** covers hosting the built app, serving it from a subdirectory, and client-side routes.
- **[Prerendering](./prerendering/01-overview.md)** renders each page to HTML at build time, so that it displays before any JavaScript runs.
- **[Service workers](./service-workers.md)** cache the app's files, for fast repeat visits and offline use.
- **[Copy tasks](../../output-targets/supporting/copy-tasks.md)** copy static files, such as images, into `www`.
- **[Build conditionals](../patterns/build-conditionals.md)** keep development-only code out of your production build.
