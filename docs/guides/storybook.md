---
title: Storybook Integration
sidebar_label: Storybook
description: Storybook Integration
slug: /storybook
---

# Using Storybook with Stencil

[Storybook](https://storybook.js.org/) is a powerful tool for developing, testing, and documenting UI components in isolation. It's open-source, widely adopted, and integrates seamlessly with modern frontend frameworks—including Stencil (v2.30.0 and above).

With the latest Stencil version, you can now build and preview your components directly in Storybook.

## Getting Started

> 🔧 **Note:** Native support for Stencil in the Storybook CLI is currently in progress ([see pull request](https://github.com/storybookjs/storybook/pull/31205)).
> 
> In the meantime, follow this manual setup guide for Storybook Version 8, then optionally run the following command to migrate to Storybook Version 9:
> 
> ```sh
> npx storybook@latest upgrade
> ```

### Install Dependencies

Add the necessary dev dependencies to your project:

```sh
npm install --save-dev storybook@8 @storybook/addon-essentials@8 @storybook/addon-links@8 @storybook/addon-interactions@8 @stencil/core@latest @stencil/storybook-plugin
```

### Configure Storybook

Create a `.storybook/main.ts` file with the following configuration:

```ts
const config = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@stencil/storybook-plugin"
  },
};

export default config;
```

By default, the Stencil Storybook plugin registers the component specified via the `component` property in your story. However, if your component depends on other custom elements from your Stencil library, you'll want to ensure those are available too.

To do this, you can embed the [Stencil Loader](/docs/next/distribution#loader) in the Storybook preview script to **lazily register all components** globally:

```ts
// .storybook/preview.tsx
import { defineCustomElements } from '../loader/index.js';

/**
 * Registers all custom elements in the Storybook preview.
 * This is useful if your components rely on other nested Stencil components.
 */
defineCustomElements();
```

### Adding Global Styles

If your components rely on global stylesheets (e.g., a design system or component library), you can include them using a `preview-head.html` file. This file will be injected into the `<head>` of the Storybook preview iframe:

```html
<!-- .storybook/preview-head.html -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@ionic/core@8/css/ionic.bundle.css" />
```

This ensures all your components render correctly with the required styles in place.

### Add a Script

In your `package.json`, add the following Storybook script:

```json
"scripts": {
  "storybook": "storybook dev -p 6006 --no-open"
}
```

## Creating Your First Story

It's recommended to place your story file next to your component for better co-location and discoverability. For example:

```bash
src/components/my-component/my-component.stories.tsx
```

If you prefer a different structure, that's perfectly fine—just make sure your `stories` pattern in `.storybook/main.ts` includes the correct paths.

Here’s an example story for a `MyComponent`:

```tsx
import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { MyComponent } from './my-component';

const meta: Meta<MyComponent> = {
  title: 'MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    first: { control: 'text' },
    last: { control: 'text' },
    middle: { control: 'text' },
  },
  args: { first: 'John', last: 'Doe', middle: 'Michael' },
};

export default meta;

type Story = StoryObj<MyComponent>;

export const Primary: Story = {
  args: {
    first: 'John',
    last: 'Doe',
    middle: 'Michael',
  },
  render: (props) => <my-component {...props} />,
};

/**
 * Storybook story without custom render function
 */
export const Secondary: Story = {
  args: {
    first: 'Jane',
    last: 'Smith',
    middle: 'Marie',
  },
};
```

## Running Storybook

To launch Storybook, first make sure your Stencil project is built, then simply run:

```sh
npm run storybook
```

Then open [http://localhost:6006](http://localhost:6006) in your browser to view your Stencil component in action 🎉

## Learn More

For additional features and customization options, visit the [official Storybook documentation](https://storybook.js.org/docs).
