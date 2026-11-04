---
title: Service Workers
sidebar_label: Service Workers
description: Generate a service worker for an app built with Stencil
slug: /service-workers
sidebar_position: 4
---

# Service Workers

A [service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) is a script that sits between a web app and the network. It can cache the app's files so that repeat visits load without waiting on the network, and so the app works offline.

For apps built with the [`www` output target](../../output-targets/main/www.md), Stencil can generate a service worker for you using [Workbox](https://developer.chrome.com/docs/workbox), and register it in your `index.html`.

:::note
Service workers are for apps. A component library has no use for one.
:::

## Usage

Install `workbox-build`, the package Stencil uses to generate the service worker:

```bash npm2yarn
npm install --save-dev workbox-build
```

Then set `serviceWorker` to `true` on the `www` output target:

```tsx title="stencil.config.ts"
import { Config } from '@stencil/core';

export const config: Config = {
  outputTargets: [
    {
      type: 'www',
      serviceWorker: true,
    },
  ],
};
```

A build now writes `sw.js` to your `www` directory, and adds a script to `www/index.html` that registers it. The service worker precaches your app's HTML, JavaScript, CSS, and JSON files.

Each build gives the service worker a new list of file revisions, so when you deploy an update, browsers detect the changed `sw.js` and fetch the new files.

### Development Builds

Development builds (`stencil build --dev`) skip the service worker, and add a script to `index.html` that unregisters any service worker left over from a production build. To generate it in a development build, pass the [`--service-worker`](../../config/cli.md) flag.

## Config

Stencil generates the service worker with Workbox's `generateSW` mode, so `serviceWorker` accepts the [`generateSW` options](https://developer.chrome.com/docs/workbox/modules/workbox-build) in place of `true`. For example, to precache images as well:

```tsx title="stencil.config.ts"
import { Config } from '@stencil/core';

export const config: Config = {
  outputTargets: [
    {
      type: 'www',
      serviceWorker: {
        globPatterns: ['**/*.{js,css,json,html,ico,png}'],
      },
    },
  ],
};
```

When you don't set them, Stencil uses these values:

| Option | Default |
| ------ | ------- |
| `globPatterns` | `['*.html', '**/*.{js,css,json}']` |
| `globDirectory` | the `www` output directory |
| `swDest` | `sw.js` in the `www` output directory |

### Removing a Service Worker

A service worker stays installed in your users' browsers after you stop generating one. To remove it, deploy a build with `unregister` set, which replaces `sw.js` with a service worker that unregisters itself:

```tsx
{
  type: 'www',
  serviceWorker: {
    unregister: true,
  },
}
```

## Using a Custom Service Worker

To write the service worker yourself, set `swSrc` to its source file. Stencil then uses Workbox's `injectManifest` mode: your file is copied to the output, with the list of files to precache injected into it.

```tsx title="stencil.config.ts"
import { Config } from '@stencil/core';

export const config: Config = {
  outputTargets: [
    {
      type: 'www',
      serviceWorker: {
        swSrc: 'src/sw.js',
      },
    },
  ],
};
```

Stencil copies the Workbox library into your `www` directory, in a folder named after its version. Load it from there, and pass `self.__WB_MANIFEST` to Workbox where you want the precache list:

```js title="src/sw.js"
// change to the version you get from `npm ls workbox-build`
importScripts('workbox-v7.4.1/workbox-sw.js');

// your custom service worker code

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
```

`self.__WB_MANIFEST` must appear exactly once in the file, comments included, or the build fails.

### Prompting Users to Reload After an Update

When a new service worker is available, by default, it's downloaded and then waits to be activated. It doesn't take over until all tabs of the site are closed and the site is visited again. This avoids conflicts with files being served from the cache, and works well in many cases.

To give users the update straight away, tell them that one is available and offer to reload.

The script Stencil adds to `index.html` dispatches a `swUpdate` event on `window` every time a service worker finishes installing. Listen for it in your root component:

```tsx title="src/components/app-root/app-root.tsx"
@Listen('swUpdate', { target: 'window' })
async onServiceWorkerUpdate() {
  const registration = await navigator.serviceWorker.getRegistration();

  if (!registration?.waiting) {
    // No service worker is waiting, so this is the first one being installed.
    return;
  }

  // Replace this with your app's own UI
  if (window.confirm('A new version is available. Reload?')) {
    registration.waiting.postMessage('skipWaiting');
  }
}
```

The message tells the waiting service worker to take over. Handle it in a [custom service worker](#using-a-custom-service-worker):

```js title="src/sw.js"
importScripts('workbox-v7.4.1/workbox-sw.js');

self.addEventListener('message', ({ data }) => {
  if (data === 'skipWaiting') {
    self.skipWaiting();
  }
});

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
```

Finally, reload the page once the new service worker has taken over, so that it serves every file. The `controllerchange` event fires at that point:

```tsx title="src/components/app-root/app-root.tsx"
componentWillLoad() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration?.active) {
        navigator.serviceWorker.addEventListener('controllerchange', () =>
          window.location.reload(),
        );
      }
    });
  }
}
```

## Further Reading

A custom service worker can do anything the platform allows, such as handling push notifications or caching API responses. See the [Workbox documentation](https://developer.chrome.com/docs/workbox) and MDN's [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) guide.
