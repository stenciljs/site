---
title: Docs Stats Auto-Generation
sidebar_label: Stats (stats)
description: Stats Generation
slug: /stats
---

# Stats

Often it's very helpful to understand the state of your libraries generated files in the form of json data. To build the docs as json, use the `--stats` flag, followed by a path on where to write the json file.

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

Check out the typescript declarations for the JSON output: https://github.com/ionic-team/stencil/blob/main/src/declarations/stencil-public-docs.ts


## Data Model

The file that's generated will produce data similar to this:

```json
{
  "timestamp": "2021-09-22T17:31:14",
  "compiler": {
    "name": "node",
    "version": "16.9.1"
  },
  "app": {
    "namespace": "ExampleStencilLibrary",
    "fsNamespace": "example-stencil-library",
    "components": 1,
    "entries": 1,
    "bundles": 30,
    "outputs": [
      {
        "name": "dist-collection",
        "files": 3,
        "generatedFiles": [
          "./dist/collection/components/my-component/my-component.js",
           // etc...
        ]
      },
      {
        "name": "dist-lazy",
        "files": 26,
        "generatedFiles": [
          "./dist/cjs/example-stencil-library.cjs.js",
           // etc...
        ]
      },
      {
        "name": "dist-types",
        "files": 1,
        "generatedFiles": [
          "./dist/types/stencil-public-runtime.d.ts"
        ]
      }
    ]
  },
  "options": {
    "minifyJs": true,
    "minifyCss": true,
    "hashFileNames": true,
    "hashedFileNameLength": 8,
    "buildEs5": true
  },
  "formats": {
    "esmBrowser": [
      {
        "key": "my-component.entry",
        "components": [
          "my-component"
        ],
        "bundleId": "p-12cc1edd",
        "fileName": "p-12cc1edd.entry.js",
        "imports": [
          "p-24af5948.js"
        ],
        "originalByteSize": 562
      }
    ],
    "esm": [
      // exact same model as the esmBrowser, but for esm files
    ],
    "es5": [
      // exact same model as the esmBrowser, but for es5 files
    ],
    "system": [
      // exact same model as the esmBrowser, but for system files
    ],
    "commonjs": [
      // exact same model as the esmBrowser, but for cjs files
    ]
  },
  "components": [
    {
      "tag": "my-component",
      "path": "./src/components/my-component/my-component.js",
      "source": "./src/components/my-component/my-component.tsx",
      "elementRef": null,
      "componentClassName": "MyComponent",
      "assetsDirs": [],
      "dependencies": [],
      "dependents": [],
      "directDependencies": [],
      "directDependents": [],
      "docs": {
        "tags": [],
        "text": ""
      },
      "encapsulation": "shadow",
      "excludeFromCollection": false,
      "events": [],
      "internal": false,
      "legacyConnect": [],
      "legacyContext": [],
      "listeners": [],
      "methods": [],
      "potentialCmpRefs": [],
      "properties": [
        {
          "name": "first",
          "type": "string",
          "attribute": "first",
          "reflect": false,
          "mutable": false,
          "required": false,
          "optional": false,
          "complexType": {
            "original": "string",
            "resolved": "string",
            "references": {}
          },
          "docs": {
            "tags": [],
            "text": "The first name"
          },
          "internal": false
        },
      ],
    },
  ],
  "entries": [
    {
      "cmps": [
       // Expanded component details are produced here
      ],
      "entryKey": "my-component.entry"
    }
  ],
  "componentGraph": {
    "sc-my-component": [
      "p-24af5948.js"
    ]
  },
  "sourceGraph": {
    "./src/components/my-component/my-component.tsx": [
      "./src/utils/utils"
    ],
    "./src/index.ts": [],
    "./src/utils/utils.ts": []
  },
  "collections": []
}
```

## Usage

### Preload tags

One example of usage with this file is to automatically create preload tags automatically. [Here's a link to a gist](https://gist.github.com/splitinfinities/8dcd1b4acf315632cd1e1dd9891fe8f1) containing some code samples about how to set up preloading to improve performance 

