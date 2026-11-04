---
title: Stencil Output Targets
sidebar_label: Overview
description: Every output target Stencil can build, and what each is for
slug: /output-targets
---

# Output Targets

Output targets decide what Stencil builds from your components. Configure them in the `outputTargets` array of `stencil.config.ts`. With none configured, Stencil builds [`loader-bundle`](./main/loader-bundle.md), the usual choice for a component library; add [`www`](./main/www.md) to build a complete web app.

## Main

The [main output targets](./main/01-overview.md) build your components for the browser or a server:

- [`loader-bundle`](./main/loader-bundle.md): lazy-loaded bundle for CDN and npm distribution (formerly `dist`)
- [`standalone`](./main/standalone.md): one custom element module per component (formerly `dist-custom-elements`)
- [`ssr`](./main/ssr.md): server-side rendering module (formerly `dist-hydrate-script`)
- [`ssr-wasm`](./main/ssr-wasm.md): the `ssr` module as WebAssembly, for servers in other languages
- [`www`](./main/www.md): a complete web app

## Documentation

[Documentation targets](./documentation-generation/01-overview.md) generate docs from your components' source and JSDoc: `docs-readme`, `docs-json`, `docs-custom-elements-manifest`, `docs-vscode`, `docs-agent-skill`, `docs-custom`, and `stats`.

## Assets

- [`global-style`](./asset-outputs/global-style.md): global stylesheets
- [`assets`](./asset-outputs/assets.md): files your components reference, such as icons and images

## Supporting Outputs

- [`types`](./supporting/types.md): TypeScript type declarations, generated in production builds
- [`collection`](./supporting/collection.md): transpiled source for other Stencil projects to re-bundle, generated in production builds
- [Copy tasks](./supporting/copy-tasks.md): copy other files into an output target's directory
