---
title: Docs Stats Auto-Generation
sidebar_label: Stats (stats)
description: Stats Generation
slug: /stats
---

# Stats

Often it's very helpful to understand the state of your libraries generated files in the form of json data. To write this data, use the `--stats` flag, optionally followed by the path to write the JSON file to.

```tsx
  scripts: {
    "docs.data": "stencil build --stats" 
    "docs.data-with-optional-file": "stencil build --stats path/to/stats.json"
  }
```

Another option would be to add the `stats` output target to the `stencil.config.ts` in order to auto-generate this file with every build:

```tsx
import { Config } from '@stencil/core';

export const config: Config = {
  outputTargets: [
    {
      type: 'stats',
      file: 'path/to/stats.json' // optional
    }
  ]
};
```

If you don't pass a file name to the `--stats` flag or the output target's `file` key, the file will be output to the root directory of your project as `stencil-stats.json`

## Data Model

The generated file looks like this, shortened here to one component:

```json
{
  "timestamp": "2026-10-10T00:02:11",
  "compiler": {
    "name": "node",
    "version": "24.16.0"
  },
  "app": {
    "namespace": "AcmeUi",
    "fsNamespace": "acmeui",
    "components": 1,
    "entries": 1,
    "bundles": 25,
    "outputs": [
      {
        "name": "assets",
        "files": 1,
        "generatedFiles": ["./dist/assets/acmeui.css"]
      },
      {
        "name": "collection",
        "files": 2,
        "generatedFiles": ["./dist/collection/components/my-button/my-button.js", "..."]
      },
      { "name": "dist-lazy", "...": "..." },
      { "name": "standalone", "...": "..." },
      { "name": "types", "...": "..." }
    ]
  },
  "options": {
    "minifyJs": true,
    "minifyCss": true
  },
  "formats": {
    "esmBrowser": [
      {
        "key": "my-button.entry",
        "components": ["my-button"],
        "bundleId": "p-9dbe23eb",
        "fileName": "p-9dbe23eb.entry.js",
        "imports": ["p-Yb2ubLNr.js"],
        "originalByteSize": 537
      }
    ],
    "esm": [
      {
        "key": "my-button.entry",
        "components": ["my-button"],
        "bundleId": "my-button",
        "fileName": "my-button.entry.js",
        "imports": ["runtime-Yb2ubLNr.js"],
        "originalByteSize": 543
      }
    ],
    "commonjs": []
  },
  "components": [
    {
      "tag": "my-button",
      "path": "./src/components/my-button/my-button.js",
      "source": "./src/components/my-button/my-button.tsx",
      "componentClassName": "MyButton",
      "encapsulation": "shadow",
      "docs": {
        "tags": [],
        "text": "A clickable button."
      },
      "dependencies": [],
      "dependents": [],
      "events": [],
      "listeners": [],
      "methods": [],
      "properties": [
        {
          "name": "variant",
          "type": "string",
          "attribute": "variant",
          "reflect": false,
          "mutable": false,
          "required": false,
          "optional": false,
          "defaultValue": "'primary'",
          "complexType": {
            "original": "'primary' | 'secondary'",
            "resolved": "\"primary\" | \"secondary\"",
            "references": {}
          }
        }
      ],
      "states": []
    }
  ],
  "entries": [
    {
      "cmps": [{ "tagName": "my-button", "...": "..." }]
    }
  ],
  "componentGraph": {
    "sc-my-button": ["p-Yb2ubLNr.js"]
  },
  "sourceGraph": {
    "./src/components/my-button/my-button.tsx": []
  },
  "rolldownResults": {
    "modules": []
  },
  "collections": []
}
```

## Usage

### Preload tags

One example of usage with this file is to automatically create preload tags automatically. [Here's a link to a gist](https://gist.github.com/splitinfinities/8dcd1b4acf315632cd1e1dd9891fe8f1) containing some code samples about how to set up preloading to improve performance 

