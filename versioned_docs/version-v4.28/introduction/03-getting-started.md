---
title: Getting Started
sidebar_label: Getting Started
description: Getting Started
slug: /getting-started
---

# Getting Started

## Starting a New Project

### Prerequisites
Stencil requires a recent LTS version of [NodeJS](https://nodejs.org/) and npm/yarn. 
Make sure you've installed and/or updated Node before continuing.

### Running the `create-stencil` CLI
The `create-stencil` CLI can be used to scaffold a new Stencil project, and can be run using the following command:

```bash npm2yarn
 npm init stencil
```

Stencil can be used to create standalone components, or entire apps.
`create-stencil`, will provide a prompt so that you can choose the type of project to start:

```text
? Select a starter project.

Starters marked as [community] are developed by the Stencil
Community, rather than Ionic. For more information on the 
Stencil Community, please see github.com/stencil-community

❯   component                Collection of web components that can be
                             used anywhere
    app [community]          Minimal starter for building a Stencil 
                             app or website
    ionic-pwa [community]    Ionic PWA starter with tabs layout and routes
```

Selecting the 'component' option will prompt you for the name of your project.
Here, we'll name our project 'my-first-stencil-project':

```bash
✔ Pick a starter › component
? Project name › my-first-stencil-project
```

After hitting `ENTER` to confirm your choices, the CLI will scaffold a Stencil project for us in a directory that matches the provided project name.
Upon successfully creating our project, the CLI will print something similar to the following to the console:

```bash
✔ Project name › my-first-stencil-project
✔ A new git repo was initialized
✔ All setup  in 26 ms

  We suggest that you begin by typing:

  $ cd my-first-stencil-project
  $ npm install
  $ npm start

  $ npm start
    Starts the development server.

  $ npm run build
    Builds your project in production mode.

  $ npm test
    Starts the test runner.

  Further reading:

   - https://github.com/ionic-team/stencil-component-starter

  Happy coding! 🎈
```

The first section describes a few commands required to finish getting your project bootstrapped.

```bash npm2yarn
cd my-first-stencil-project
npm install
npm start
```

This will change your current directory to `my-first-stencil-project`, install your dependencies for you, and start the development server.

### Useful Initial Commands

The second section of the `create-stencil` output describes a few useful commands available during the development process:

- `npm start` starts a local development server. The development server will open a new browser tab containing your 
project's components. The dev-server uses hot-module reloading to update your components in the browser as you modify
them for a rapid feedback cycle.

- `npm run build` creates a production-ready version of your components. The components generated in this step are not
meant to be used in the local development server, but rather within a project that consumes your components.

- `npm test` runs your project's tests. The `create-stencil` CLI has created both end-to-end and unit tests when scaffolding your project.

### Source Control

As of create-stencil v3.3.0, a new git repository will be automatically created for you when you initialize a project if:
1. git is installed
2. Your project is not created under another git work tree (e.g. if you create a new project in a monorepo, a new git repo will not be created)

Versions of create-stencil prior to v3.3.0 do not interact with any version control systems (VCS).
If you wish to place your project under version control, we recommend initializing your VCS now.
If you wish to use git, run the following after changing your current directory to the root of your Stencil project:

```bash
$ git init
$ git add -A
$ git commit -m "initialize project using stencil cli" 
```

## My First Component

Stencil components are created by adding a new file with a `.tsx` extension, such as `my-component.tsx`.
The `.tsx` extension is required since Stencil components are built using [JSX](../components/templating-and-jsx.md) and TypeScript.

When we ran `create-stencil` above, it generated a component, `my-component.tsx`, that can be found in the `src/components/my-component` directory:

```tsx title="my-component.tsx"
import { Component, Prop, h } from '@stencil/core';
import { format } from '../../utils/utils';

@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true,
})
export class MyComponent {
  @Prop() first: string;
  @Prop() middle: string;
  @Prop() last: string;

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

After the import statements, the first piece we see is the [`@Component` decorator](../components/component.md):
```tsx
@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true,
})
```
This decorator provides metadata about our component to the Stencil compiler.
Information, such as the custom element name (`tag`) to use, can be set here.
This decorator tells Stencil to:
- Set the [element's name](../components/component.md#tag) to 'my-component'
- [Apply the stylesheet](../components/component.md#styleurl) 'my-component.css' to the component
- Enable [native Shadow DOM functionality](../components/component.md#shadow) for this component

Below the `@Component()` decorator, we have a standard JavaScript class declaration:

```tsx
export class MyComponent {
```

Within this class is where you'll write the bulk of your code to bring your Stencil component to life.

Next, the component contains three class members, `first`, `middle` and `last`.
Each of these class members have the [`@Prop()` decorator](../components/properties.md#the-prop-decorator-prop) applied to them:
```ts
  @Prop() first: string;
  @Prop() middle: string;
  @Prop() last: string;
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

## Updating Stencil

To get the latest version of @stencil/core you can run:

```bash npm2yarn
npm install @stencil/core@latest --save-exact
```
