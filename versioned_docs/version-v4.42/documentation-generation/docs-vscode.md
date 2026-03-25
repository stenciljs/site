---
title: VS Code Documentation
sidebar_label: VS Code (docs-vscode)
description: VS Code Documentation
slug: /docs-vscode
---

# VS Code Documentation

One of the core features of web components is the ability to create [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements),
which allow developers to reuse custom functionality defined in their components.
When Stencil compiles a project, it generates a custom element for each component in the project.
Each of these [custom elements has an associated `tag` name](../components/component.md#component-options) that allows the custom
element to be used in HTML files. 

By default, integrated development environments (IDEs) like VS Code are not aware of a project's custom elements when
authoring HTML.
In order to enable more intelligent features in VS Code, such as auto-completion, hover tooltips, etc., developers
need to inform it of their project's custom elements.

The `docs-vscode` output target tells Stencil to generate a JSON file containing this information.

This is an opt-in feature and will save a JSON file containing [custom data](https://github.com/microsoft/vscode-custom-data)
in a directory specified by the output target.
Once the feature is enabled and VS Code is informed of the JSON file's location, HTML files can gain code editing
features similar to TSX files.

## Enabling

To generate custom element information for VS Code, add the `docs-vscode` output target to your `stencil.config.ts`:

```tsx
import { Config } from '@stencil/core';

export const config: Config = {
  outputTargets: [
    { 
        type: 'docs-vscode',
        file: 'vscode-data.json',
    }
  ]
};
```

where `file` is the name & location of the file to be generated. 
By default, Stencil assumes that the file will be generated in the project's root directory.

To generate the JSON file, have Stencil build your project.

## Configuring VS Code

Once the `docs-vscode` output target has been enabled and the JSON file generated, VS Code needs to be informed of it.

Recent versions of VS Code have a settings option named `html.customData`, which resolves to a list of JSON files to
use when augmenting the default list of HTML elements.
Add the path to the generated JSON file for your project's types to be added: 

```json
{
  "html.customData": [
    "./vscode-data.json"
  ]
}
```

