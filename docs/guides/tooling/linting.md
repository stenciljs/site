---
title: Linting
sidebar_label: Linting
description: Catch Stencil-specific mistakes with @stencil/eslint-plugin, under ESLint or oxlint
slug: /linting
sidebar_position: 1
---

# Linting

`@stencil/eslint-plugin` adds lint rules for mistakes specific to Stencil components, such as a private `@Prop()`, a `@Watch()` for a member that doesn't exist, or a `@Method()` that isn't `async`. It runs under [ESLint](https://eslint.org/) or [oxlint](https://oxc.rs/docs/guide/usage/linter.html).

```
src/components/my-cmp/my-cmp.tsx
   5:3  error    Class properties decorated with @Prop() cannot be private nor protected         stencil/props-must-be-public
   8:3  error    External @Method() open() must return a Promise. Consider prefixing the method with async, such as @Method() async open()  stencil/async-methods
  12:3  error    Watch decorator @Watch("missing") is not matching with any @Prop() or @State()  stencil/no-unused-watch
```

## Set Up

Run the wizard in your Stencil project:

```bash
stencil add @stencil/eslint-plugin
```

It asks which linter to use, and for ESLint, which preset. It installs the packages, writes the config file, and adds `lint` and `lint:fix` scripts to your `package.json`.

### ESLint

To set up ESLint by hand, install the plugin with ESLint and its TypeScript and React parsers:

```bash npm2yarn
npm install --save-dev @stencil/eslint-plugin eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react
```

Then add a preset to `eslint.config.js`:

```js title="eslint.config.js"
import stencil from '@stencil/eslint-plugin';

export default [
  { ignores: ['dist', 'www', 'loader'] },
  stencil.configs.flat.recommended,
  { languageOptions: { parserOptions: { projectService: true } } },
];
```

The plugin has three presets: `flat.base`, `flat.recommended`, and `flat.strict`, which adds stricter Stencil rules along with ESLint's and typescript-eslint's recommended rules. `projectService` gives rules access to your project's TypeScript types. Some rules need it: without it, `async-methods` doesn't report a `@Method()` that returns a plain value.

### oxlint

To set up oxlint by hand, install it with the plugin:

```bash npm2yarn
npm install --save-dev @stencil/eslint-plugin oxlint
```

Then load the plugin in `.oxlintrc.json`, under the name `stencil`, and turn on the rules you want:

```json title=".oxlintrc.json"
{
  "jsPlugins": [{ "name": "stencil", "specifier": "@stencil/eslint-plugin" }],
  "rules": {
    "stencil/props-must-be-public": "error",
    "stencil/no-unused-watch": "error"
  }
}
```

oxlint doesn't resolve TypeScript types, so rules that rely on them, such as `async-methods`, can't report everything they would under ESLint with `projectService`.

## Rules

See the [plugin's README](https://github.com/stenciljs/eslint-plugin#supported-rules) for every rule and what it checks.

:::note
The plugin uses the TypeScript compiler API, so it needs TypeScript 6 or earlier. It fails to load with TypeScript 7.
:::
