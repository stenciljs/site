---
title: Build Constants
description: Stencil has a number of add-ons that you can use with the build process.
slug: /build-variables
---

# Build Constants

Build Constants in Stencil allow you to run specific code only when Stencil is running in development mode. This code is stripped from your bundles when doing a production build, therefore keeping your bundles as small as possible.

### Using Build Constants

Lets dive in and look at an example of how to use our build constants:

```tsx
import { Component, Build } from '@stencil/core';

@Component({
  tag: 'stencil-app',
  styleUrl: 'stencil-app.scss'
})
export class StencilApp {

  componentDidLoad() {
    if (Build.isDev) {
      console.log('im in dev mode');
    } else {
      console.log('im running in production');
    }

    if (Build.isBrowser) {
      console.log('im in the browser');
    } else {
      console.log('im in prerendering (server)');
    }
  }
}
```

As you can see from this example, we just need to import `Build` from `@stencil/core` and then we can use the `isDev` constant to detect when we are running in dev mode or production mode.

### Use Cases

Some use cases we have come up with are:

- Diagnostics code that runs in dev to make sure logic is working like you would expect
- `console.log()`'s that may be useful for debugging in dev mode but that you don't want to ship
- Disabling auth checks when in dev mode
