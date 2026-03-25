---
title: SEO Meta Tags in SSG
sidebar_label: Meta tags
description: Managing meta tags for SEO and social media embedding in Stencil Static Sites
slug: /static-site-generation-meta-tags
---

# SEO Meta Tags and Static Site Generation

Web Apps need to list detailed meta information about content in order to maximize SEO and provide good social media embed experiences.

One of the benefits to Stencil's prerendering is that most DOM apis are available in the NodeJS environment too.
For example, to set the document title, simply run `document.title = "Page Title"`.
Similarly, meta tags can be set using standard DOM APIs as found in the browser, such as `document.head` and `document.createElement('meta')`.
For this reason, your component's runtime can take care of much of this custom work during prerendering.

That said, the Prerender Config also includes options that allow individual pages to be modified arbitrarily during prerendering.
For example, the `afterHydrate(document, url)` hook can be used to update the parsed `document` before it is serialized into an HTML string.
The `document` argument is a [standard `Document`](https://developer.mozilla.org/en-US/docs/Web/API/Document), while the `url` argument is a [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) for the location of the page being rendered.

In the example below, the `afterHydrate(document, url)` hook is setting the document title from url's pathname.

```tsx
import { PrerenderConfig } from '@stencil/core';

export const config: PrerenderConfig = {
  afterHydrate(document, url) {
    document.title = url.pathname;
  }
};
```

## @stencil/helmet

The `@stencil/helmet` package was a library for managing meta tags dynamically.
It has since been deprecated.
For additional information regarding this package, please see its [GitHub page](https://github.com/ionic-team/stencil-helmet) 
