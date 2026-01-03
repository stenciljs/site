---
title: Build Conditionals
description: Build Conditionals
---

# Build Conditionals

Build Conditionals in Stencil allow you to run specific code only when Stencil is running in development mode. This code is stripped from your bundles when doing a production build, therefore keeping your bundles as small as possible.

### Using Build Conditionals

Lets dive in and look at an example of how to use our build conditional:

```tsx
import { Component, Build } from '@stencil/core';

@Component({
  tag: 'stencil-app',
  styleUrl: 'stencil-app.css'
})
export class StencilApp {

  componentDidLoad() {
    if (Build.isDev) {
      console.log('im in dev mode');
    } else {
      console.log('im running in production');
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
