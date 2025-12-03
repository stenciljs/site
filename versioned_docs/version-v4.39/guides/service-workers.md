---
title: Service Workers
sidebar_label: Service Workers
description: Service Workers
slug: /service-workers
---

# Service Workers

[Service workers](https://developers.google.com/web/fundamentals/getting-started/primers/service-workers) are a very powerful api that is essential for [PWAs](https://blog.ionic.io/what-is-a-progressive-web-app/), but can be hard to use. To help with this, we decided to build support for Service Workers into Stencil itself using [Workbox](https://workboxjs.org/).

## What is Workbox?

Workbox is a library that greatly simplifies the Service Worker API. It allows you to quickly generate a service worker that can handle caching static assets, cache remote assets using routes (similar to Express) or even do offline Google Analytics. Because we are built on top of Workbox, you can easily use any of the functionality they offer. For more info on Workbox, [check out their docs](https://developers.google.com/web/tools/workbox/)

## Usage

When doing a production build of an app built using Stencil, the Stencil compiler will automatically generate a service worker for you and inject the necessary code to register the service worker in your index.html. Also, because the files Stencil generates are hashed, every time you do a production build and push an update to your app, the service worker will know to update, therefore ensuring your users are never stuck on a stale version of your site.

Lets run through the steps needed to enable service workers for your project:

- `cd` into your project
- Run `npm run build`

And that's it! You should now have an `sw.js` file in your `www` folder and the code to register the service worker in your `www/index.html` file.

:::note
The component starter by default does not have service workers enabled as a service worker is not needed for component collections
:::

## Config

Stencil uses Workbox underneath, and by default generates a service worker from a config object using the `generateSW` mode. Therefore it supports all of the [Workbox generateSW config options](https://developers.google.com/web/tools/workbox/modules/workbox-build#full_generatesw_config). Here is the default config Stencil uses:

```tsx
{
  globPatterns: [
    '**/*.{js,css,json,html}'
  ]
};
```

This configuration does pre-caching of all of your app's assets.

To modify this config you can use the `serviceWorker` param of your Stencil config. Here is an example:

```tsx
import { Config } from '@stencil/core';

export const config: Config = {
  outputTargets: [
    {
      type: 'www',
      serviceWorker: {
        globPatterns: [
          '**/*.{js,css,json,html,ico,png}'
        ]
      }
    }
  ]
};
```

### Disabling the service worker

If you do not want a service worker to be generated during the build, this can be turned off. To disable this feature, set the `serviceWorker` property to `null` in the `www` output target.

```tsx
import { Config } from '@stencil/core';

export const config: Config = {
  outputTargets: [
    {
      type: 'www',
      serviceWorker: null
    }
  ]
};
```

## Using a custom service worker

Already have a service worker or want to include some custom code? We support that, too. By specifying a source file for your service worker, Stencil switches to the `injectManifest` mode of Workbox. That gives you full control over your service worker, while still allowing you to automatically inject a precache manifest.

Let's go through the steps needed for this functionality:

- First we need to pass the path to our custom service worker to the `swSrc` command in the `serviceWorker` config. Here is an example:

```tsx
import { Config } from '@stencil/core';

export const config: Config = {
  outputTargets: [
    {
      type: 'www',
      serviceWorker: {
        swSrc: 'src/sw.js'
      }
    }
  ]
};
```

- Now we need to include some boilerplate code in our custom service worker:

```tsx
// change to the version you get from `npm ls workbox-build`
importScripts('workbox-v4.3.1/workbox-sw.js');

// your custom service worker code

// the precache manifest will be injected into the following line
self.workbox.precaching.precacheAndRoute([]);
```

This code imports the Workbox library, creates a new instance of the service worker and tells Workbox where to insert the pre-cache array.

### Showing a reload toast when an update is available

When a new service worker is available, by default, it will be downloaded and then go into a state of waiting to be activated. The new service worker won't take over until all tabs of the site are closed and the site is visited again. This is to avoid unexpected behavior from conflicts with files being served from cache, and works well in many cases.

If you want to give your users the option to immediately access the new update, a common way is to show them a toast that lets them know about the update and offers a "reload" button. The reload let's the new service worker take over, serving the fresh content, and triggers a page reload, to avoid cache issues.

The following example showcases this in combination with the Ionic framework, but the toast-related code should be easily adaptable to any UI. Add the following to your root component (commonly `app-root.tsx`).

```tsx
@Listen("swUpdate", { target: 'window' })
async onServiceWorkerUpdate() {
  const registration = await navigator.serviceWorker.getRegistration();

  if (!registration?.waiting) {
    // If there is no waiting registration, this is the first service
    // worker being installed.
    return;
  }

  const toast = await toastController.create({
    message: "New version available.",
    buttons: [{ text: 'Reload', role: 'reload' }],
    duration: 0
  });

  await toast.present();

  const { role } = await toast.onWillDismiss();

  if (role === 'reload') {
    registration.waiting.postMessage("skipWaiting");
  }
}
```

The `swUpdate` event is emitted by Stencil every time a new service worker is installed. When a service worker is waiting for registration, the toast is shown. After clicking the reload button, a message is posted to the waiting service worker, letting it know to take over. This message needs to be handled by the service worker; therefore we need to create a custom one (e. g. `src/sw.js`) and add a listener to call `skipWaiting()`.

```tsx
importScripts("workbox-v4.3.1/workbox-sw.js");

self.addEventListener("message", ({ data }) => {
  if (data === "skipWaiting") {
    self.skipWaiting();
  }
});

self.workbox.precaching.precacheAndRoute([]);
```

:::note
Don't forget to set `swSrc` in your Stencil config.
:::

Finally, we want our app to reload when the new service worker has taken over, so that no outdated code is served from the cache anymore. We can use the service worker's `controllerchange` event for that, by attaching an event listener in our root component's `componentWillLoad` lifecycle hook.

```tsx
componentWillLoad() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .getRegistration()
      .then(registration => {
        if (registration?.active) {
          navigator.serviceWorker.addEventListener(
            'controllerchange',
            () => window.location.reload()
          );
        }
      })
  }
}
```

### Handle push events

A common use case for custom service workers is to handle browser push notifications. But before we will be able show push notifications, we first need to use the Notifications API to request permissions from the user to do so.

```tsx
if ('Notification' in window && 'serviceWorker' in navigator) {
  Notification.requestPermission(status => {
    // status will either be 'default', 'granted' or 'denied'
    console.log(`Notification permissions have been ${status}`);
  });
}
```

The current permission status can always be checked using `Notification.permission`.

To show a notification to the user after being granted permission, we can use the `showNotification` method of our service worker's registration (within our custom service worker).

```tsx
self.registration.showNotification('Hakuna matata.');
```

Usually we will have a backend that will send out push notifications to clients, and we want our service worker to handle them. To do that, we can register an event listener in our worker for the `push` event. The event will be of type [`PushEvent`](https://developer.mozilla.org/en-US/docs/Web/API/PushEvent) and have a `data` field of type [`PushMessageData`](https://developer.mozilla.org/en-US/docs/Web/API/PushMessageData).

```tsx
self.addEventListener('push', event => {
  console.log(`Push received with data "${event.data.text()}"`);

  const title = 'Push Notification';
  const options = {
    body: `${event.data.text()}`,
    data: { href: '/users/donald' },
    actions: [
      { action: 'details', title: 'Details' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
```

If the data is a JSON string, then `data.json()` can be used to immediately get the parsed data. The `event.waitUntil` method is used to ensure that the service worker doesn't terminate before the asynchronous `showNotification` operation has completed.

Furthermore, we will likely want to handle notification clicks. The API provides the events `notificationclick` and `notificationclose` for that.

```tsx
self.addEventListener('notificationclick', event => {
  const notification = event.notification;
  const action = event.action;

  if (action === 'dismiss') {
    notification.close();
  } else {
    // This handles both notification click and 'details' action,
    // because some platforms might not support actions.
    clients.openWindow(notification.data.href);
    notification.close();
  }
});
```

Now our service worker is able to receive and process push notifications, however we still need to register the client with our backend. Browsers provide a push service for that reason, which your app can subscribe to. The subscription object contains an endpoint URL with a unique identifier for each client. You can send your notifications to that URL, encrypted with a public key which is also provided by the subscription object.

In order to implement this, we first need to get each client to subscribe to the browser's push service, and then send the subscription object to our backend. Then our backend can generate the push notifications, encrypt them with the public key, and send them to the subscription endpoint URL.

First we will implement a function to subscribe the user to the push service, which as a best practice should be triggered from a user action signalling that they would like to receive push notifications. Assuming that notification permissions have already been granted, the following function can be used for that.

```tsx
async function subscribeUser() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager
      .subscribe({ userVisibleOnly: true })
      .catch(console.error);

    if (!subscription) {
      return;
    }

    // the subscription object is what we want to send to our backend
    console.log(subscription.endpoint);
  }
}
```

We should also check our subscription every time our app is accessed, because the subscription object can change.

```tsx
self.registration.pushManager.getSubscription().then(subscription => {
  if (!subscription) {
    // ask the user to register for push
    return;
  }

  // update the database
  console.log(subscription);
});
```

### Further Reading

* For more information on push notifications and the related APIs please refer to the [Web Fundamentals Introduction to Push Notifications](https://developers.google.com/web/ilt/pwa/introduction-to-push-notifications) and the [MDN Push API docs](https://developer.mozilla.org/en-US/docs/Web/API/Push_API).
* [This Twitter thread by David Brunelle](https://twitter.com/davidbrunelle/status/1073394572980453376) explains how to implement versioning in your PWA in order to handle breaking API changes. The problem here is that your service worker enabled app will continue to serve an outdated (cached) app against your updated API. In order to solve this a version check can be implemented.
