---
title: Editor Support
sidebar_label: Editor Support
description: Autocompletion and documentation for your components in VS Code, JetBrains IDEs, and other tools
slug: /editor-support
sidebar_position: 2
---

# Editor Support

Editors can autocomplete your components' tags, props, and events, and show their documentation on hover. What powers that depends on where the components are used.

## In TSX

In your components' own JSX, editors get everything from TypeScript, through the `components.d.ts` file Stencil generates. There's nothing to set up. See [Typed Components](../patterns/typed-components.md).

## In TypeScript: Apps Using Your Library

An app that installs your library gets the same types, from the `types` field of your package's `package.json`, which points at the [`types`](../../output-targets/supporting/types.md) output. TypeScript loads them as soon as the app imports anything from your package, such as `import 'my-library'` or the loader, so there's no need to point the app's `tsconfig.json` at them.

An app that loads your library with a `<script>` tag imports nothing from it, so it has to load the types itself, with a type-only import anywhere in its source:

```ts
import type {} from 'my-library';
```

Or by listing the package in its `tsconfig.json`:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "types": ["my-library"]
  }
}
```

Either way, `document.querySelector('my-toggle')` then returns `HTMLMyToggleElement`, with typed props and events.

`types` limits which packages' global types TypeScript loads automatically, so list any others the app relies on, such as `node`.

## In HTML: VS Code

VS Code reads [custom data](https://code.visualstudio.com/blogs/2020/02/24/custom-data-format) files describing HTML elements. The [`docs-vscode`](../../output-targets/documentation-generation/docs-vscode.md) output target generates one from your components.

## In HTML and Vue: JetBrains IDEs

WebStorm and other JetBrains IDEs read [web types](https://plugins.jetbrains.com/docs/intellij/polysymbols-web-types.html). The community [`@stencil-community/web-types-output-target`](https://github.com/stencil-community/stencil-web-types) package generates them. Install it:

```bash npm2yarn
npm install --save-dev @stencil-community/web-types-output-target
```

Add the output target:

```ts title="stencil.config.ts"
import { Config } from '@stencil/core';
import { webTypesOutputTarget } from '@stencil-community/web-types-output-target';

export const config: Config = {
  outputTargets: [{ type: 'loader-bundle' }, webTypesOutputTarget()],
};
```

The next build writes `web-types.json` to your project's root, listing each component with its description, attributes, slots, and events. Point the IDE at it from your `package.json`:

```json title="package.json"
{
  "web-types": "./web-types.json"
}
```

To give the same support to your library's users, add the file to the `files` array in your `package.json`, so it's published with the package.

## Other Tools

Many other editors, documentation tools, and linters read the [Custom Elements Manifest](../../output-targets/documentation-generation/docs-custom-elements-manifest.md), a standard description of a component library. Stencil generates it with the `docs-custom-elements-manifest` output target.
