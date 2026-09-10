---
title: Getting Started
sidebar_label: Getting Started
description: Getting Started
slug: /getting-started
---

# Getting Started

## Starting a New Project

### Prerequisites

Stencil requires a recent LTS version of [Node.js](https://nodejs.org/) and a package manager (npm, pnpm, yarn, or bun).
Make sure you've installed and/or updated Node before continuing.

### Running the `stencil init` wizard

The `stencil init` wizard scaffolds a new Stencil project. Run it through your package manager's `create`/`init` convention:

```bash npm2yarn
npm create stencil@5
```

:::note
While v5 is in preview, keep the explicit `@5` (or `@next`/`@alpha`) version - plain `npm create stencil` still resolves to the current stable v4 line until v5 reaches general availability.
:::

`stencil init` is context-aware: run in an empty directory, it scaffolds a new project. Run inside an existing Stencil project, it switches to "add capabilities" mode instead, letting you install and configure integrations (testing, styling, framework output targets) you didn't set up initially - the same picker [`stencil add`](#adding-capabilities-later) shows when you run it with no arguments.

The wizard walks you through a handful of questions - project name, which output targets you need, and which integrations (testing, styling, framework wrappers) to install and configure. Answering them installs the packages you chose and generates a project directory matching your project name.

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

### Source Control

`stencil init` doesn't set up version control for you. Initialize a git repository once your project is scaffolded:

```bash
$ git init
$ git add -A
$ git commit -m "initialize project using stencil init"
```

## My First Component

Stencil components are created by adding a new file with a `.tsx` extension, such as `my-component.tsx`.
The `.tsx` extension is required since Stencil components are built using [JSX](../components/templating-and-jsx.md) and TypeScript.

The wizard generates a starter component, `my-component.tsx`, in the `src/components/my-component` directory:

<!--
  TODO(live-demo): replace/supplement this static walkthrough (source, usage snippet, and
  described output below) with a single live, editable demo - the reader edits `first`/
  `middle`/`last` (or the component source itself) and sees the real compiled/rendered
  result update, rather than reading a description of what the browser will display. This
  is the strongest candidate on the whole site for the "real compiler, not a sandboxed
  runtime" direction (§6): it's the reader's first-ever contact with Stencil's compile step
  (decorators, JSX, `styleUrl`), so showing the actual transformation matters most here.
  See V5_DOCS_PLAN.md §6 - tool not yet decided (playground-elements was proposed and
  retracted; needs a POC comparing @stencil/unplugin-in-a-real-browser-Node-runtime vs. a
  custom Sandpack/Nodebox-backed playground before implementing).
-->

```tsx title="my-component.tsx"
import { Component, Prop } from '@stencil/core';

import { format } from '../../utils/utils';

@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  encapsulation: { type: 'shadow' },
})
export class MyComponent {
  /** The first name */
  @Prop() first?: string;

  /** The middle name */
  @Prop() middle?: string;

  /** The last name */
  @Prop() last?: string;

  private getText(): string {
    return format(this.first, this.middle, this.last);
  }

  render() {
    return <div>Hello, World! I'm {this.getText()}</div>;
  }
}
```

Once compiled, this component can be used in HTML just like any other tag.

```markup
<my-component first="Stencil" middle="'Don't call me a framework'" last="JS"></my-component>
```

When rendered, the browser will display `Hello, World! I'm Stencil 'Don't call me a framework' JS`.

### Anatomy of `my-component`

Let's dive in and describe what's happening in `my-component`, line-by-line.

The first piece we see is the [`@Component` decorator](../components/component.md):
```tsx
@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  encapsulation: { type: 'shadow' },
})
```
This decorator provides metadata about our component to the Stencil compiler.
Information, such as the custom element name (`tag`) to use, can be set here.
This decorator tells Stencil to:
- Set the [element's name](../components/component.md#tag) to 'my-component'
- [Apply the stylesheet](../components/component.md#styleurl) 'my-component.css' to the component
- Use [native Shadow DOM encapsulation](../components/component.md#encapsulation) for this component

Below the `@Component()` decorator, we have a standard JavaScript class declaration:

```tsx
export class MyComponent {
```

Within this class is where you'll write the bulk of your code to bring your Stencil component to life.

Next, the component contains three class members, `first`, `middle` and `last`.
Each of these class members have the [`@Prop()` decorator](../components/properties.md#the-prop-decorator-prop) applied to them:
```ts
  @Prop() first?: string;
  @Prop() middle?: string;
  @Prop() last?: string;
```
`@Prop()` tells Stencil that the property is public to the component, and allows Stencil to rerender when any of these public properties change.
We'll see how this works after discussing the `render()` function.

For the component to render something to the screen, we declare a [`render()` function](../components/templating-and-jsx.md#basics) that returns JSX.
If you're not sure what JSX is, be sure to reference the [Using JSX](../components/templating-and-jsx.md) docs.

The render function returns a representation of the HTML we want to push to the DOM.

```tsx
  private getText(): string {
    return format(this.first, this.middle, this.last);
  }

  render() {
    return <div>Hello, World! I'm {this.getText()}</div>;
  }
```

This component's `render()` returns a `<div>` element, containing text to render to the screen.

The `render()` function uses all three class members decorated with `@Prop()`, through the `getText` function.
Declaring private functions like `getText` helps pull logic out of the `render()` function's JSX.

Any property decorated with `@Prop()` is also automatically watched for changes.
If a user of our component were to change the element's `first`, `middle`, or `last` properties, our component would fire its `render()` function again, updating the displayed content.

## Adding Capabilities Later

Didn't set up testing, a framework output target, or a styling preprocessor when you first ran `stencil init`? Add one at any point with:

```bash
stencil add
```

Run without arguments, `stencil add` prompts you to pick from known integrations (like [`@stencil/vitest`](../testing/vitest/01-overview.md) or [`@stencil/playwright`](../testing/playwright/01-overview.md)) and any already-installed packages that expose their own setup wizard. You can also install a specific package directly: `stencil add @stencil/vitest`.

## Next Steps

You've built and rendered your first component. Getting it into another project means publishing it - see [Publishing to NPM](../guides/publishing.md) for packaging, publishing, and how consumers pull your components into their own projects.

If you also want consumers to get idiomatic React, Angular, or Vue components instead of raw custom elements, see [Framework Integration](../framework-integration/01-overview.md) for generating those wrapper packages on top of your published library.

## Updating Stencil

To get the latest version of `@stencil/core`, run:

```bash npm2yarn
npm install @stencil/core@latest --save-exact
```
