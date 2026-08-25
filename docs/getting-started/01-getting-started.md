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
While v5 is in preview, keep the explicit `@5` (or `@next`/`@alpha`) version — plain `npm create stencil` still resolves to the current stable v4 line until v5 reaches general availability.
:::

`stencil init` is context-aware: run in an empty directory, it scaffolds a new project. Run inside an existing Stencil project, it switches to "add capabilities" mode instead, letting you install and configure integrations (testing, styling, framework output targets) you didn't set up initially — the same thing [`stencil add`](#adding-capabilities-later) does for a single package.

The wizard walks you through a handful of questions — project name, which output targets you need, and which integrations (testing, styling, framework wrappers) to install and configure. Answering them installs the packages you chose and generates a project directory matching your project name.

Once it finishes, move into the new directory and start the dev server:

```bash npm2yarn
cd my-first-stencil-project
npm start
```

### Useful Initial Commands

A scaffolded project's `package.json` comes with a few scripts to get started:

- `npm run dev` (`stencil build --dev --watch --serve`) starts a local development server with hot-module reloading, rebuilding your components in the browser as you edit them.
- `npm run build` (`stencil build`) creates a production build of your components.
- `npm run generate` (`stencil generate`, or `stencil g`) scaffolds a new component.

Unlike Stencil v4, a new project has no test setup by default — v5 has no integrated test runner. Add one through the wizard (`stencil add`, see below) when you're ready; [`@stencil/vitest`](../testing/vitest/01-overview.md) is the recommended starting point for most projects.

### Source Control

`stencil init` initializes a new git repository for you if git is installed and your project isn't already inside another git work tree (for example, a package inside a monorepo won't get its own nested repo). If you'd rather set up version control yourself:

```bash
$ git init
$ git add -A
$ git commit -m "initialize project using stencil init"
```

## My First Component

Stencil components are created by adding a new file with a `.tsx` extension, such as `my-component.tsx`.
The `.tsx` extension is required since Stencil components are built using [JSX](../components/templating-and-jsx.md) and TypeScript.

The wizard generates a starter component, `my-component.tsx`, in the `src/components/my-component` directory:

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

When rendered, the browser will display `Hello World! I'm Stencil 'Don't call me a framework' JS`.

### Anatomy of `my-component`

Let's dive in and describe what's happening in `my-component`, line-by-line.

Notice there's no `import { h } from '@stencil/core'`, even though the component returns JSX in `render()`. Stencil's default project template uses TypeScript's automatic JSX runtime (`jsx: "react-jsx"`, `jsxImportSource: "@stencil/core"`), so the compiler injects what it needs — you don't have to import `h` yourself just to have it in scope.

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

In order for the component to render something to the screen, we must declare a [`render()` function](../components/templating-and-jsx.md#basics) that returns JSX.
If you're not sure what JSX is, be sure to reference the [Using JSX](../components/templating-and-jsx.md) docs.

The quick idea is that our render function needs to return a representation of the HTML we want to push to the DOM.

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

:::note
As of this writing, `stencil init` and `stencil add` don't yet support running non-interactively (for example, in a CI pipeline) — both need to prompt you for answers.
:::

## Local Development

After creating your Stencil components, you'll likely want to use them in an existing application. There are multiple approaches for local development depending on your project setup.

### Framework Integration

If you want to integrate your Stencil components directly into an existing application built with frameworks like React, Angular, or Vue, refer to the [Framework Integrations](../framework-integration/01-overview.md) guide for specific integration instructions.

### Using Component Library in Another Project

If you're building a standalone component library and want to use it in another project during development, you have two main options:

### Using Script Tags

For applications that don't use npm or for simple HTML pages, you can include your components directly with a script tag:

```bash
# First, build your Stencil project
cd my-first-stencil-project
npm run build
```

This creates a `dist/loader-bundle/` directory containing your compiled components. Copy this folder to your application, then add a script tag that points to the bundle:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Import your Stencil namespace -->
  <script type="module" src="path/to/dist/loader-bundle/my-first-stencil-project.js"></script>
</head>
<body>
  <!-- Now you can use your components -->
  <my-component first="Stencil" middle="'Don't call me a framework'" last="JS"></my-component>
</body>
</html>
```

> **Note:** When using script tags, your application must be served from a web server rather than opened as a local file. You can use tools like [http-server](https://www.npmjs.com/package/http-server) or your IDE's built-in server.

When you update your Stencil components, remember to rebuild the project and update the files in your consuming application.

Both approaches allow you to develop and test your components in the context of a real application, making it easier to refine their design and functionality.

### Using npm link

For npm-based projects, `npm link` creates a symbolic link between your Stencil component library and the consuming application. However, linking to a Stencil component this way can still be a little tricky. [Angular](../framework-integration/angular.md), [React](../framework-integration/react.md), and [Vue](../framework-integration/vue.md) each have their own documentation which includes `npm link` and it's recommended you follow those integration guides.

## Updating Stencil

To get the latest version of @stencil/core you can run:

```bash npm2yarn
npm install @stencil/core@latest --save-exact
```
