---
title: Build Conditionals
description: Run code only in development, in the browser, on the server, or under test
sidebar_label: Build Conditionals
slug: /guides/build-conditionals
---

# Build Conditionals

The `Build` object from `@stencil/core` tells your code what kind of build it's running in, so it can include or skip work accordingly:

```tsx
import { Build, Component } from '@stencil/core';

@Component({ tag: 'my-app' })
export class MyApp {
  componentDidLoad() {
    if (Build.isDev) {
      console.log('my-app loaded');
    }
  }
}
```

| Flag | `true` when |
|---|---|
| `Build.isDev` | The build is a development build (`stencil build --dev`). |
| `Build.isBrowser` | The code runs in the browser. |
| `Build.isServer` | The code runs in the [`ssr`](../output-targets/main/ssr.md) module, for server-side rendering or prerendering. |
| `Build.isTesting` | The components are built under a test runner such as Vitest or Playwright, or with `NODE_ENV=test`. |

Code in a branch that a build can never take is removed from that build. A production build drops `Build.isDev` code, such as extra logging or diagnostics, and the browser and server builds each drop the other's branches, along with anything only those branches import.

## Browser and Server

Code that needs a real browser, such as reading `localStorage` or measuring layout, should only run in the browser:

```tsx
connectedCallback() {
  if (Build.isBrowser) {
    this.theme = localStorage.getItem('theme') ?? 'light';
  }
}
```

See [Writing SSR-Friendly Components](../output-targets/main/ssr.md#writing-ssr-friendly-components) for more on code that runs on the server.

## Testing

Use `Build.isTesting` to skip work that gets in the way of tests, such as animations or analytics:

```tsx
componentDidLoad() {
  if (!Build.isTesting) {
    this.startAnimation();
  }
}
```
