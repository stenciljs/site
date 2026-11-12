---
title: Installation
sidebar_label: Installation
description: Create a Stencil project with the stencil init wizard
slug: /getting-started
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Installation

## Starting a New Project

### Prerequisites

Stencil requires a recent LTS version of [Node.js](https://nodejs.org/) and a package manager (npm, pnpm, yarn, or bun).
Make sure you've installed and/or updated Node before continuing.

### Running the `stencil init` wizard

The `stencil init` wizard scaffolds a new Stencil project. Run it through your package manager's `create`/`init` convention:

<Tabs groupId="npm2yarn">
<TabItem value="npm" label="npm">

```bash
npm init stencil@next
```

</TabItem>
<TabItem value="yarn" label="Yarn">

```bash
yarn create stencil@next
```

</TabItem>
<TabItem value="pnpm" label="pnpm">

```bash
pnpm create stencil@next
```

</TabItem>
<TabItem value="bun" label="Bun">

```bash
bun create stencil@next
```

</TabItem>
</Tabs>

:::note
While v5 is a release candidate, keep the `@next` tag. Without it, you get the Stencil v4 project generator.
:::

`stencil init` is context-aware: run in an empty directory, it scaffolds a new project. Run inside an existing Stencil project, it switches to "add capabilities" mode instead, letting you install and configure integrations (testing, styling, framework output targets) you didn't set up initially - the same picker [`stencil add`](#adding-capabilities-later) shows when you run it with no arguments.

The wizard walks you through a handful of questions - project name, which output targets you need, and which integrations (testing, styling, framework wrappers) to install and configure. Answering them installs the packages you chose and generates a project directory matching your project name.

It creates a project like this:

```tree
my-first-stencil-project/
├── src/
│   ├── components/
│   │   └── my-component/
│   │       ├── my-component.css
│   │       ├── my-component.tsx
│   │       └── usage/
│   │           └── example.md
│   └── utils/
│       └── utils.ts
├── .gitignore
├── package.json
└── tsconfig.json
```

:::note
The exact structure depends on the options you choose. With all the default options, there's no `stencil.config.ts`, since Stencil's defaults are all the project needs. Choosing a framework wrapper offers to set the project up as a monorepo, with this project in a `packages/` folder.
:::

Once it finishes, move into the new directory and start the dev server:

```bash npm2yarn
cd my-first-stencil-project
npm run dev
```

### Useful Initial Commands

A scaffolded project's `package.json` comes with a few scripts to get started:

- `npm run dev` (`stencil build --dev --watch --serve`) starts a local development server with hot-module reloading, rebuilding your components in the browser as you edit them.
- `npm run build` (`stencil build`) creates a production build of your components.
- `npm run generate` (`stencil generate`, or `stencil g`) scaffolds a new component.

Unlike Stencil v4, a new project has no test setup by default - v5 has no integrated test runner. Add one through the wizard (`stencil add`, see below) when you're ready; [`@stencil/vitest`](../testing/vitest/01-overview.md) is the recommended starting point for most projects.

## Adding Capabilities Later

Didn't set up testing, a framework output target, or a styling preprocessor when you first ran `stencil init`? Add one at any point with:

```bash
stencil add
```

Run without arguments, `stencil add` prompts you to pick from known integrations (like [`@stencil/vitest`](../testing/vitest/01-overview.md) or [`@stencil/playwright`](../testing/playwright/01-overview.md)) and any already-installed packages that expose their own setup wizard. You can also install a specific package directly: `stencil add @stencil/vitest`.

## Updating Stencil

To get the latest version of `@stencil/core`, run:

```bash npm2yarn
npm install @stencil/core@rc --save-exact
```

:::note
While v5 is a release candidate, it's published under the `rc` tag. `@latest` installs Stencil v4.
:::

## Next Steps

With the project running, [build your first component](./03-your-first-component.md).
