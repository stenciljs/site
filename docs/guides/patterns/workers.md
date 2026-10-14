---
title: Web Workers
sidebar_label: Web Workers
description: Web Workers
slug: /web-workers
---

# Web Workers

[Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) are a widely supported technology (Chrome, Firefox, Safari and Edge) that allows JavaScript to execute in a different thread, maximizing the usage of multiple CPUs; but most importantly not blocking the **main thread**.

The **main thread** is where JavaScript runs by default and has access to the `document`, `window` and other DOM APIs. The problem is that long-running JS prevents the browser from running smooth animations (CSS animations, transitions, canvas, svg...), making your site look frozen. That's why if your application needs to run CPU-intensive tasks, Web Workers are a great help.


## When to use Web Workers?

The first thing to understand is when to use a Web Workers, and when *not* to use them since they come with a set of costs and limitations:

- There is no access to the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction). This means you cannot interact with `document`, `window` or any elements in the page.
- There is no access to any of the `@stencil/core` APIs. For example, you cannot declare and use a component in a Web Worker, for the same reasons there is **no access to the DOM**.
- A Web Worker has its own **isolated state** since each worker has their own memory space. For example, a variable declared on the main thread cannot be directly referenced from a worker.
- There is an overhead when passing data between workers and the main thread. As a general rule, it's best to minimize the amount of data sent to and from the worker and be mindful if the work to send your data takes more time than doing it on the main thread.
- Communication is always **asynchronous**. Luckily Promises and async/await makes this relatively easy, but it's important to understand that communication between threads is always asynchronous.
- You can **only** pass [primitives](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Primitive_values) and objects that implement the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm). Best way to think of it is any data that can be serialized to JSON is safe to use.

In short, it's generally a good idea to use workers to move logic that is thread-blocking -- or UI-blocking, preventing users from interacting with the page -- into a Web Worker, such as real-time code syntax highlighting.

## Best Practices when using Web Workers

- Use pure and functional algorithms in workers. `(input1, input2) => output`.
- The worker logic itself can be as complex as it has to be, however, the input and output data should stay fairly simple.
- Look for ways to reduce passing data between the main thread and worker thread.
- Class instances cannot be passed as data. Instead, only work with data can be JSON serializable.
- Minimize state within the worker, or better yet, completely avoid maintaining any state (e.g., don't put redux inside a worker).
- The cost of a worker should be easily amortized because it would be doing some CPU-intensive jobs.


## How vanilla Web Workers "work"?

The browser comes with a `Worker` API, that works the following way:

```tsx
const worker = new Worker('/my-worker.js');
worker.postMessage(['send message to worker']);
worker.onmessage = (ev) => {
  console.log('data from worker', ev.data);
};
```

This API, while powerful, is very low level and makes it tedious to write complex apps, since the event-driven paradigm leads easily to [spaghetti-code](https://en.wikipedia.org/wiki/Spaghetti_code), and quickly misses out on strongly-typed functions and data.

For further information, check out [this fantastic tutorial](https://www.html5rocks.com/en/tutorials/workers/basics/) by our friends at HTML5Rocks.

A Web Worker also requires the generation of a separate JavaScript bundle, such as the `my-worker.js` file in the example above. This means you usually need extra build scripts and tooling that transpiles and bundles the worker entry point into another `.js` file. Additionally, the main bundle must be able to reference the worker bundle's file location, which is oftentimes a challenge after transpiling, bundling, minifying, filename hashing and deploying to production servers.

Fortunately, Stencil can help you solve these two problems:

- Tooling: Transpiling, bundling, hashing, worker url path referencing
- Communication: Converting event-based communication to Promises, while still maintaining types.

## Web Workers with Stencil

As we already mention, Stencil's compiler can help you to use workers in production seamlessly. Any TypeScript file within the `src` directory that ends with `.worker.ts` will automatically use a worker. For example:

**src/stuff.worker.ts:**

```tsx

export const sum = async (a: number, b: number) => {
  return a + b;
}

export const expensiveTask = async (buffer: ArrayBuffer) => {
  for (let i = 0; i < buffer.length; i++) {
    // do a lot of processing
  }
  return buffer;
};
```

**src/my-app/my-app.tsx:**
```tsx
import { Component } from '@stencil/core';

// Import the worker directly.
// Stencil will automatically create
// a proxy and run the module in a worker.
// IDEs and TypeScript will treat this import
// no differently than any other ESM import.
import { sum, expensiveTask } from '../../stuff.worker';

@Component({
  tag: 'my-cmp'
}
export class MyApp {

  async componentWillLoad() {
    // sum() will run inside a worker! and the result is a Promise<number>
    const result = await sum(1, 2);
    console.log(result); // 3

    // expensiveTask() will not block the main thread,
    // because it runs in parallel inside the worker.
    // Note that the functions must be async.
    const newBuffer = await expensiveTask(buffer);
    console.log(newBuffer);
  }
}
```


Under the hood, Stencil compiles a worker file and uses the standard `new Worker()` API to instantiate the worker. Then it creates proxies for each of the exported functions, so developers can interact with it using [structured programming constructs](https://en.wikipedia.org/wiki/Structured_programming) instead of event-based ones.

:::note
Workers are already placed in a different chunk, and dynamically loaded using `new Worker()`. You should avoid using a dynamic `import()` to load them, as this will cause two network requests. Instead, use ES module imports as it's only importing the proxies for communicating with the worker.
:::

### Imports within a worker

Normal `ESM` imports are possible when building workers in Stencil. Under the hood, the compiler bundles all the dependencies of a worker into a single file that becomes the worker's entry-point, a dependency-free file that can run without problems.

**src/loader.worker.ts:**

```tsx
import upngjs from 'upng-js';
import { Images } from './materials';

export const loadTexture = async (imagesSrcs: Images) => {
  const images = await Promise.all(
    imagesSrcs.map(loadOriginalImage)
  );
  return images;
}

async function loadOriginalImage(src: string) {
  const res = await fetch(src);
  const png = upngjs.decode(await res.arrayBuffer());
  return png;
}
```

In this example, we are building a worker called `loader.worker.ts` that imports an NPM dependency (`upngjs`, used to parse png files), and a local module (`./materials`). Stencil will use [Rollup](https://rollupjs.org/guide/en/) to bundle all dependencies and remove all imports at runtime. Be aware that code will be duplicated if imported inside and outside a worker.

#### Dynamic imports

In order to load scripts dynamically inside of a worker, Web Workers come with a handy API, [`importScript()`](https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts).

Here's an example of how to use `typescript` directly from a CDN with `importScript()`.

```tsx
importScripts("https://cdn.jsdelivr.net/npm/typescript@latest/lib/typescript.js");
```

:::note
Do not use `importScript()` to import NPM dependencies you have installed using `npm` or `yarn`. Use normal ES module imports as usual, so the bundler can understand it.
:::

### Worker Callbacks

In most cases, waiting for a Promise to resolve with the output data is all we'll need. However, a limitation with native Promises is that it provides only one returned value. Where a traditional callback still shines is that it can be called numerous times with different data.

Let's say that we have a long running process that may take a few seconds to complete. With a Promise, we're unable to periodically receive the progress of the task, since all we can do is wait for Promise to resolve.

A feature with Stencil's worker is the ability to pass a callback to the method, and within the worker, execute the callback as much as it's needed before the task resolves.

In the example below, the task is given a number that it counts down from the number provided, and the task completes when it gets to `0`. During the count down, however, the main thread will still receive an update every second. This example will console log from `5` to `0`


**src/countdown.worker.ts:**

```tsx
export const countDown = (num: number, progress: (p: number) => void) => {
  return new Promise(resolve => {
    const tmr = setInterval(() => {
      num--;
      if (num > 0) {
        progress(num);
      } else {
        clearInterval(tmr);
        resolve(num);
      }
    }, 1000);
  });
};
```

**src/my-app/my-app.tsx:**
```tsx
import { Component } from '@stencil/core';
import { countDown } from '../countdown.worker';

@Component({
  tag: 'my-cmp'
}
export class MyApp {

  componentWillLoad() {
    const startNum = 5;
    console.log('start', startNum);

    countDown(startNum, (p) => {
      console.log('progress', p);
    }).then(result => {
      console.log('finish', result);
    });
  }
}
```

When executed, the result would take 5 seconds and would log:

```
start 5
progress 4
progress 3
progress 2
progress 1
finish 0
```

## Advanced cases

Sometimes it might be necessary to access the actual [`Worker`](https://developer.mozilla.org/en-US/docs/Web/API/Worker) instance, because manual usage of the [`postMessage()`](https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage) and [`onmessage`](https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope/onmessage) is desired. However, there's still a tooling challenge in having to bundle the worker, and have the main bundle correctly reference the worker bundle url path. In that case, Stencil also has an API that exposes the worker directly so it can be used instead of the proxies mentioned early.

For a direct worker reference, add `?worker` at the end of an ESM import. This virtual ES module will export:
- `worker`: The actual Worker instance.
- `workerPath`: The path to the worker's entry-point (usually a path to a `.js` file).
- `workerName`: The name of the worker, useful for debugging purposes.


**src/my-app/my-app.tsx:**

```tsx
import { Component } from '@stencil/core';
import { sum } from '../../stuff.worker';

// Using the ?worker query, allows to access the worker instance directly.
import { worker } from '../../stuff.worker.ts?worker';

@Component({
  tag: 'my-cmp'
}
export class MyApp {

  componentWillLoad() {
    // Use worker api directly
    worker.postMessage(['send data manually']);

    // Use the proxy
    const result = await sum(1, 2);
    console.log(result); // 3
  }
}
```

You can even use this feature you create multiple Worker manually:

```tsx
import { workerPath } from '../../stuff.worker.ts?worker';

const workerPool = [
  new Worker(workerPath),
  new Worker(workerPath),
  new Worker(workerPath),
  new Worker(workerPath),
];
```

In this example, we exclusively take advantage of the bundling performed by the compiler to obtain the `workerPath` to the worker's entry point, then manually create a pool of workers.

:::note
Stencil will not instantiate a worker if it's unused, it takes advantage of tree-shaking to do this.
:::

#### Worker Termination

Any Web Workers can be terminated using the [`Worker.terminate()`](https://developer.mozilla.org/en-US/docs/Web/API/Worker/terminate) API, but since Stencil creates one worker shared across all the proxied methods, it's not recommended to terminate it manually. If you have a use-case for using `terminate` and rebuilding workers, then we recommend using the `workerPath` and creating a new Worker directly:

```tsx
import { workerPath } from '../../stuff.worker.ts?worker';
const worker = new Worker(workerPath);
// ...
worker.terminate()
```
