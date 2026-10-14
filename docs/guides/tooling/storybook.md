---
title: Storybook Integration
sidebar_label: Storybook
description: Develop and document Stencil components in Storybook
slug: /storybook
---

# Using Storybook with Stencil

[Storybook](https://storybook.js.org/) is a tool for developing, testing, and documenting UI components in isolation. `@stencil/storybook-plugin` is a Storybook framework for Stencil projects. It:

- compiles your components as Storybook loads them, so there's no Stencil build to run first
- updates the preview when you edit a component, without reloading the page
- fills in each component's controls and documentation from its props, events, slots, parts, and CSS custom properties

It supports Storybook 10.

## Setup

Run the wizard from your Stencil project:

```bash
stencil add @stencil/storybook-plugin
```

It installs Storybook and the plugin, creates the `.storybook/` config directory, and adds `storybook` and `build-storybook` scripts to your `package.json`.

### Manual Setup

To do the same by hand, install the dependencies:

```bash npm2yarn
npm install --save-dev storybook @storybook/addon-docs @stencil/storybook-plugin@dev
```

:::note
While Stencil v5 is in preview, the v5 version of the plugin is published under the `dev` tag.
:::

Create `.storybook/main.ts`, naming the plugin as the framework:

```ts title=".storybook/main.ts"
import type { StorybookConfig } from '@stencil/storybook-plugin';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@stencil/storybook-plugin',
  },
};

export default config;
```

Create `.storybook/preview.tsx`. The `autodocs` tag gives every component a generated documentation page:

```tsx title=".storybook/preview.tsx"
import type { Preview } from '@stencil/storybook-plugin';

export const parameters: Preview['parameters'] = {
  docs: {
    source: {
      excludeDecorators: true,
    },
  },
};

export const tags: Preview['tags'] = ['autodocs'];
```

And add the scripts:

```json title="package.json"
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

## Writing Stories

Place a story file next to its component, such as `src/components/my-button/my-button.stories.tsx`. Import the component class and pass it as `component`:

```tsx title="src/components/my-button/my-button.stories.tsx"
import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { MyButton } from './my-button';

const meta = {
  title: 'MyButton',
  component: MyButton,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<'my-button'>;

export default meta;
type Story = StoryObj<'my-button'>;

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
};
```

`args` are set as props on the component, and each one gets a control in Storybook's Controls panel.

`Meta` and `StoryObj` take the component's tag name, which types `args` from your project's `components.d.ts`. The plugin keeps that file up to date while Storybook runs.

### Slots

Pass slot content with `parameters.slots`, keyed by slot name:

```tsx
export const Primary: Story = {
  args: {
    variant: 'primary',
  },
  parameters: {
    slots: {
      default: 'Save',
    },
  },
};
```

### Custom Rendering

For full control over a story's markup, give it a `render` function that returns JSX:

```tsx
export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => <my-button {...args}>Can't press</my-button>,
};
```

### Components That Use Other Components

Importing a component's file registers that component only. If it renders other components from your library, import their files in the story too:

```tsx title="src/components/my-card/my-card.stories.tsx"
import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { MyCard } from './my-card';
// my-card renders a my-button
import '../my-button/my-button';
```

## Generated Documentation

The documentation page for each component is built from its source. It lists the component's props, events, slots, shadow parts, and CSS custom properties, with the descriptions from your JSDoc comments:

```tsx
/**
 * @slot - The button's label
 * @part button - The native button
 */
@Component({
  tag: 'my-button',
  styleUrl: 'my-button.css',
  encapsulation: { type: 'shadow' },
})
export class MyButton {
  /** The visual style of the button */
  @Prop() variant: 'primary' | 'secondary' = 'primary';

  /** Emitted when the button is pressed */
  @Event() myPress: EventEmitter<void>;
}
```

See [Docs Generation](../../output-targets/documentation-generation/01-overview.md) for the comment syntax, including how to document CSS custom properties.

To change a control, or the documentation for one argument, set `argTypes` in the story's `meta`.

## Adding Global Styles

If your components rely on a global stylesheet, add it with a `.storybook/preview-head.html` file, which Storybook injects into the `<head>` of the preview:

```html title=".storybook/preview-head.html"
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/my-design-tokens/dist/tokens.css" />
```

## Running Storybook

```bash npm2yarn
npm run storybook
```

Then open [http://localhost:6006](http://localhost:6006).

To build a static copy to deploy, run `npm run build-storybook`. It's written to `storybook-static/`.

## Learn More

For everything else Storybook can do, see the [Storybook documentation](https://storybook.js.org/docs).
