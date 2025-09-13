---
title: Static Site Generation Basics in Stencil
sidebar_label: Basics
description: Quick introduction to configuring and using Static Site Generation in Stencil
slug: /static-site-generation-basics
---

# Static Site Generation Basics

Rendering components at build time (rather than purely server or client-time), can add significant performance improvements to your app, and maximize SEO impact.

Using Static Site Generation in Stencil requires running a build command, returning promises from component lifecycle methods that fetch dynamic data, and ensuring all known URLs are properly discovered and built.

## Static Build

Stencil doesn't prerender components by default. However, the build can be made to prerender using the `--prerender` flag:

```bash
stencil build --prerender
```

## Rendering Dynamic Data

Many components need to render based on data fetched from a server. Stencil handles this by allowing components to return `Promise`'s from lifecycle methods like `componentWillLoad` (this can be achieved by using `async/await` as well).

For example, this is how to have Stencil wait to render a component until it fetches data from the server:

```typescript
async componentWillLoad() {
  const ret = await fetch('https://.../api');

  this.thing = await ret.json();
}
```

## Integration with a Router

Since Stencil will actually navigate to and execute components, it has full support for a router, including Stencil Router.

There are no changes necessary to access route params and matches. However, make sure your routes can accept a trailing slash as prerendered static content will be treated as loading an `index.html` file at that path, and so the browser may append a trailing slash.

In particular, if using Stencil Router, double check usage of `exact={true}` which could cause your routes to not match when loaded with a trailing slash.

## Page and URL Discovery

By default, Stencil crawls your app starting at base URL of `/` and discovers all paths that need to be indexed. By default this will only discover pages that are linked at build time, but can be easily configured to build any possible URL for the app.

As each page is generated and new links are found, Stencil will continue to crawl and prerender pages.

See the [prerender config](./prerender-config.md) docs to see how this can be customized further.


## Things to Watch For

There may be some areas of your code that should absolutely not run while prerendering. To help avoid certain code Stencil provides a `Build.isBrowser` build conditional to tell prerendering to skip over. Here is an example of how to use this utility:

```tsx
import { Build } from '@stencil/core';

connectedCallback() {
  // Build.isBrowser is true when running in the
  // browser and false when being prerendered

  if (Build.isBrowser) {
    console.log('running in browser');
  } else {
    console.log('running in node while prerendering');
  }
}
```

Also note that the actual runtime generated for the browser builds will not include code that has been excluded because of the `if (Build.isBrowser)` statement. In the above example, only `console.log('running in browser')` would be included within the component's runtime.
