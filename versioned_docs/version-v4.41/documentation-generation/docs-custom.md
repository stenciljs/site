---
title: Custom Docs Generation
sidebar_label: Custom Docs (docs-custom)
description: Custom Docs
slug: /docs-custom
---

# Custom Docs Generation

Stencil exposes an output target titled `docs-custom` where users can access the generated docs json data. This feature can be used to generate custom markdown or to execute other logic on the json data during the build. As with other docs output targets, `strict` mode is supported.

To make use of this output target, simply add the following to your Stencil configuration.

```tsx
import { Config } from '@stencil/core';

export const config: Config = {
  outputTargets: [
    {
      type: 'docs-custom',
      generator: (docs: JsonDocs) => {
          // Custom logic goes here
      }
    }
  ]
};
```

## Config

| Property    | Description                                                                              | Default |
|-------------|------------------------------------------------------------------------------------------|---------|
| `generator` | A function with the docs json data as argument.                                          |         |
| `strict`    | If set to true, Stencil will output a warning whenever there is missing documentation.   | `false` |



# Custom Docs Data Model

The generated docs JSON data will in the type of `JsonDocs` which consists of main `components` array which consists of components that stencil core found and meta information such as `timestamp` and `compiler`

## JsonDocs

| Property    | Description                                                                              |
|-------------|------------------------------------------------------------------------------------------|
| `components` | Array with type of `JsonDocsComponent[]` which consists component information|
| `timestamp`    | `string` with timestamp   |
| `compiler`    | `Object` with `typescriptVersion`, `compiler`, and `version`   |

## JsonDocsComponent

| Property    | Description                                                                              |
|-------------|------------------------------------------------------------------------------------------|
| `dirPath` | Component directory path |
| `fileName`    | File name |
| `filePath`    | File path |
| `readmePath`    | Readme file path |
| `usagesDir`    | Stencil looks in a directory named `usages/` in the same directory as your component to find usage examples. This holds the full path to that directory. |
| `encapsulation`    | Component `encapsulation` type. Possible values are `shadow`, `scoped`, `none`  |
| `tag`    | Component tag described in `.tsx` file  |
| `readme`    | Component readme file first line content  |
| `docs`    | Description written in top of `@Component` e.g. /**  Documentation Example */. If no JSDoc is present, default to any manually written text in the component's markdown file. Empty otherwise. |
| `docsTags`    | Annotations (In the way of JSDoc ) written in `.tsx` file will be collected here   |
| `overview`    | Description written in top of `@Component` e.g. /**  Documentation Example */ |
| `usage`    | Array of [usage examples](./docs-json.md#usage), written in Markdown files in the `usages/` directory adjacent to the current component. |
| `props`    | Array of metadata objects for each usage of the [`@Prop` decorator](../components/properties.md#the-prop-decorator-prop) on the current component. |
| `methods`    | Array of metadata objects for each usage of the [`@Method` decorator](../components/methods.md) on the current component.  | 
| `events`    | Array of metadata objects for each usage of the [`@Event` decorator](../components/events.md#event-decorator) on the current component. |
| `listeners`    | Array of metadata objects for each usage of the [`@Listen` decorator](../components/events.md#listen-decorator) on the current component. |
| `styles`    | Array of objects documenting annotated [CSS variables](./docs-json.md#css-variables) used in the current component's CSS. |
| `slots`    | Array of objects documenting [slots](./docs-json.md#slots) which are tagged with `@slot` in the current component's JSDoc comment. |
| `parts`    |  Array of objects derived from `@part` tags in the current component's JSDoc comment. |
| `dependents`    |  Array of components where current component is used  |
| `dependencies`    |  Array of components which is used in current component  |
| `dependencyGraph`    | Describes a tree of components coupling |

