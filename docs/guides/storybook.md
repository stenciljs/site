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

> 🔧 Note: Native support for Stencil in the Storybook CLI is currently in progress ([see pull request](https://github.com/storybookjs/storybook/pull/31205)). In the meantime, follow this manual setup guide.

### Install Dependencies

Add the necessary dev dependencies to your project:

```sh
npm install --save-dev storybook @storybook/addon-essentials @storybook/addon-links @storybook/addon-interactions @stencil/core@latest @stencil/storybook-plugin
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

To launch Storybook, simply run:

```sh
npm run storybook
```

Then open [http://localhost:6006](http://localhost:6006) in your browser to view your Stencil component in action 🎉

## Learn More

For additional features and customization options, visit the [official Storybook documentation](https://storybook.js.org/docs).
