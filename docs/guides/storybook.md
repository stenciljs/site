---
title: Storybook Integration
sidebar_label: Storybook
description: Storybook Integration
slug: /storybook
---

[Storybook](https://storybook.js.org/) is a frontend workshop for building UI components and pages in isolation. Thousands of teams use it for UI development, testing, and documentation. It's open source and free.

Using a Stencil version `v2.30.0` or higher you can now edit and develop your Stencil components within Storybook.

## Setup

There is currently a pending pull request to natively integrate bootstrapping a Storybook project with Stencil through the Storybook CLI. Until this lands please follow the following setup guide.

First, let's install all required Storybook dependencies:

```sh
npm install --save-dev storybook @storybook/addon-essentials @storybook/addon-links @storybook/addon-interactions @stencil/core@latest @stencil/storybook-plugin
```

Next, create a `.storybook/main.ts` file in your project with the following contents:

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
  }
};

export default config;
```

Lastly, add the following script to your `package.json`:

```json
{
    "name": "my-component-lib",
    ...
    "scripts": {
        ...
        "storybook": "storybook dev -p 6006 --no-open",
        ...
    }
}
```

That's it, you can now develop your components with Storybook.

## Usage

Let's add our first Storybook story to our project. For example you can add a `src/components/my-component/my-component.story.tsx` file with the following content:

```tsx
import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';

import { MyComponent } from './my-component';

const meta = {
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
} satisfies Meta<MyComponent>;

export default meta;
type Story = StoryObj<MyComponent>;

export const Primary: Story = {
  args: {
    first: 'John',
    last: 'Doe',
    middle: 'Michael',
  },
  render: (props) => {
    return <my-component {...props} />;
  }
};

export const Secondary: Story = {
  args: {
    first: 'Jane',
    last: 'Smith',
    middle: 'Marie',
  },
};
```

To start Storybook, run your new script:

```sh
npm run storybook
```

And just like that, your Stencil component is now available in Storybook at http://localhost:6006 🎉

For more information please refer to the [storybook documentation](https://storybook.js.org/docs).