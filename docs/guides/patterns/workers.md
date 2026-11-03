---
title: Web Workers
sidebar_label: Web Workers
description: Run CPU-heavy work off the main thread, with Stencil bundling the worker and handling its messages
slug: /web-workers
---

# Web Workers

[Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) run JavaScript on a separate thread. The main thread is where the page renders, so long-running work there freezes animations and input; moving it into a worker keeps the page responsive.

Using a worker directly means bundling it as a separate file and passing messages back and forth with `postMessage()`. Stencil does both for you: it bundles the worker, and lets you call its functions like any other async function.

## Using a Worker

Any file under `src` whose name ends in `.worker.ts` runs in a worker. Export `async` functions from it:

```ts title="src/stuff.worker.ts"
export const sum = async (a: number, b: number) => a + b;

export const sumBytes = async (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let total = 0;
  for (let i = 0; i < bytes.byteLength; i++) {
    total += bytes[i];
  }
  return total;
};
```

Import those functions in a component as usual. Each call runs in the worker and returns a Promise:

```tsx title="src/components/my-app/my-app.tsx"
import { Component } from '@stencil/core';
import { sum, sumBytes } from '../../stuff.worker';

@Component({ tag: 'my-app' })
export class MyApp {
  async componentDidLoad() {
    console.log(await sum(1, 2)); // 3
    console.log(await sumBytes(new Uint8Array([1, 2, 3]).buffer)); // 6
  }
}
```

Stencil builds the worker into its own file, starts it with `new Worker()`, and replaces the imports with functions that send it messages. All exported functions share one worker.

- Development builds throw an error for an exported function that doesn't return a Promise.
- Import worker functions statically, as above. A dynamic `import()` adds a second network request for no benefit.
- Stencil only creates the worker if something imports from it.

## Limits

- A worker has no DOM. It can't use `document`, `window`, page elements, or Stencil's component APIs.
- A worker has its own memory, so it can't read variables from the main thread, and vice versa.
- Arguments and return values are copied with the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm). Plain data works; class instances and functions don't (apart from [progress callbacks](#progress-callbacks)). Copying has a cost, so keep what you pass small.

Workers suit pure, CPU-heavy functions, such as parsing, image processing, or syntax highlighting, whose cost outweighs the copying. Avoid keeping state in a worker.

## Imports Inside a Worker

A worker can import npm packages and local modules. Stencil bundles them into the worker's file, so code imported both inside and outside a worker is included twice.

```ts title="src/loader.worker.ts"
import upngjs from 'upng-js';

export const decodePng = async (src: string) => {
  const res = await fetch(src);
  return upngjs.decode(await res.arrayBuffer());
};
```

To load a script from a URL instead, such as a CDN build of a library, call [`importScripts()`](https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts) inside the worker. Use normal imports for installed packages, so they're bundled.

## Progress Callbacks

A Promise returns one value, at the end. To report progress along the way, pass a callback: the worker can call it as many times as it needs before the function resolves.

```ts title="src/countdown.worker.ts"
export const countDown = (num: number, progress: (p: number) => void) =>
  new Promise<number>((resolve) => {
    const timer = setInterval(() => {
      num--;
      if (num > 0) {
        progress(num);
      } else {
        clearInterval(timer);
        resolve(num);
      }
    }, 1000);
  });
```

```tsx
const result = await countDown(4, (p) => console.log('progress', p));
console.log('finish', result);
// progress 3, progress 2, progress 1, finish 0
```

## Using the Worker Directly

To use the [`Worker`](https://developer.mozilla.org/en-US/docs/Web/API/Worker) itself, for example to call `postMessage()` by hand, add `?worker` to the import. It exports:

- `worker`: the `Worker` instance that the function imports use.
- `workerPath`: the URL of the worker's bundled file.
- `workerName`: the worker's name, for debugging.

```tsx
import { worker } from '../../stuff.worker.ts?worker';

worker.postMessage(['send data manually']);
```

`workerPath` lets you start workers of your own from the same bundle, such as a pool:

```ts
import { workerPath } from '../../stuff.worker.ts?worker';

const pool = [new Worker(workerPath), new Worker(workerPath), new Worker(workerPath)];
```

Start your own worker this way if you need to [`terminate()`](https://developer.mozilla.org/en-US/docs/Web/API/Worker/terminate) it. Don't terminate the shared `worker`, since every function imported from the file uses it.
