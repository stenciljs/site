---
title: SSR in Frameworks
sidebar_label: SSR in Frameworks
description: Server-render Stencil components inside Next.js, Nuxt, and other server frameworks
slug: /server-side-rendering
sidebar_position: 2
---

# SSR in Frameworks

Your library's [`ssr` module](./01-overview.md) renders Stencil components in any HTML string, so it works with any framework that lets you see a page's HTML on the server before it's sent. The browser then hydrates the rendered components, as long as the page also loads your components' client-side JavaScript, from [`loader-bundle`](../loader-bundle.md) or [`standalone`](../standalone.md).

## Any Server Framework

Most frameworks let you run code on each response, usually as middleware or a response hook. Pass the page's HTML through `renderToString()` there:

```ts
import { renderToString } from 'my-library/ssr';

// the shape of this hook varies by framework
async function onResponse(response: Response): Promise<Response> {
  if (!response.headers.get('content-type')?.includes('text/html')) {
    return response;
  }
  const { html } = await renderToString(await response.text());
  return new Response(html, response);
}
```

`renderToString()` needs the whole document, so run it on the complete response, not on streamed chunks.

## Next.js

React Server Components render each component separately, so there's no single page of HTML to pass through a hook. Instead, the [React output target](../../../framework-integration/react.md) can generate server versions of your React wrappers, which render their Stencil component during Next.js's own server rendering.

Add the `ssr` output target and set `hydrateModule` and `clientModule` on the React output target:

```ts title="stencil.config.ts"
import { Config } from '@stencil/core';
import { reactOutputTarget } from '@stencil/react-output-target';

export const config: Config = {
  outputTargets: [
    { type: 'ssr' },
    reactOutputTarget({
      outDir: '../component-library-react/src',
      // your library's ssr module
      hydrateModule: 'component-library/ssr',
      // the package the client-side wrappers are published as
      clientModule: 'component-library-react',
    }),
  ],
};
```

This generates `components.ts` for the client and `components.server.ts` for the server. Expose the server entry point from your React package:

```json title="component-library-react/package.json"
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./next": {
      "types": "./dist/components.server.d.ts",
      "import": "./dist/components.server.js"
    }
  }
}
```

Then import components from that entry point in your Next.js app:

```tsx title="app/page.tsx"
import { MyComponent } from 'component-library-react/next';

export default function Home() {
  return <MyComponent first="Max" last="Mustermann" />;
}
```

See the React output target's [`hydrateModule`](../../../framework-integration/react.md#hydratemodule) and [`excludeServerSideRenderingFor`](../../../framework-integration/react.md#excludeserversiderenderingfor) options for more control.

## Nuxt

Set `hydrateModule` on the [Vue output target](../../../framework-integration/vue.md), alongside the `ssr` output target:

```ts title="stencil.config.ts"
import { Config } from '@stencil/core';
import { vueOutputTarget } from '@stencil/vue-output-target';

export const config: Config = {
  outputTargets: [
    { type: 'ssr' },
    vueOutputTarget({
      componentCorePackage: 'component-library',
      proxiesFile: '../component-library-vue/src/index.ts',
      includeImportCustomElements: true,
      hydrateModule: 'component-library/ssr',
    }),
  ],
};
```

The generated Vue components render their Stencil component on the server, and hydrate in the browser once Vue starts.
