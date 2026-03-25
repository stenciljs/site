---
title: Upgrading to Stencil v4.0.0
description: Upgrading to Stencil v4.0.0
url: /docs/upgrading-to-stencil-4
---

# Upgrading to Stencil v4.0.0

## Getting Started

We recommend that you only upgrade to Stencil v4 from Stencil v3.
If you're a few versions behind, we recommend upgrading one major version at a time (from v1 to v2, then v2 to v3, finally v3 to v4).
This will minimize the number of breaking changes you have to deal with at the same time.

For breaking changes introduced in previous major versions of the library, see:
- [Stencil v3 Breaking Changes](https://github.com/ionic-team/stencil/blob/main/BREAKING_CHANGES.md#stencil-v300)
- [Stencil v2 Breaking Changes](https://github.com/ionic-team/stencil/blob/main/BREAKING_CHANGES.md#stencil-two)
- [Stencil v1 Breaking Changes](https://github.com/ionic-team/stencil/blob/main/BREAKING_CHANGES.md#stencil-one)

For projects that are on Stencil v3, install the latest version of Stencil v4: `npm install @stencil/core@4`


## Updating Your Code

### New Configuration Defaults
Starting with Stencil v4.0.0, the default configuration values have changed for a few configuration options.
The following sections lay out the configuration options that have changed, their new default values, and ways to opt-out of the new behavior (if applicable).

#### `transformAliasedImportPaths`

TypeScript projects have the ability to specify a path aliases via the [`paths` configuration in their `tsconfig.json`](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping) like so:
```json title="tsconfig.json"
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@utils": ["src/utils/index.ts"]
    }
  }
}
```
In the example above, `"@utils"` would be mapped to the string `"src/utils/index.ts"` when TypeScript performs type resolution.
The TypeScript compiler does not however, transform these paths from their keys to their values as a part of its output.
Instead, it relies on a bundler/loader to do the transformation.

The ability to transform path aliases was introduced in [Stencil v3.1.0](https://github.com/ionic-team/stencil/releases/tag/v3.1.0) as an opt-in feature.
Previously, users had to explicitly enable this functionality in their `stencil.config.ts` file with `transformAliasedImportPaths`:
```ts title="stencil.config.ts - enabling 'transformAliasedImportPaths' in Stencil v3.1.0"
import { Config } from '@stencil/core';

export const config: Config = {
  transformAliasedImportPaths: true,
  // ...
};
```

Starting with Stencil v4.0.0, this feature is enabled by default.
Projects that had previously enabled this functionality that are migrating from Stencil v3.1.0+ may safely remove the flag from their Stencil configuration file(s).

For users that run into issues with this new default, we encourage you to file a [new issue on the Stencil GitHub repo](https://github.com/ionic-team/stencil/issues/new?assignees=&labels=&projects=&template=bug_report.yml&title=bug%3A+).
As a workaround, this flag can be set to `false` to disable the default functionality.
```ts title="stencil.config.ts - disabling 'transformAliasedImportPaths' in Stencil v4.0.0"
import { Config } from '@stencil/core';

export const config: Config = {
  transformAliasedImportPaths: false,
  // ...
};
```

For more information on this flag, please see the [configuration documentation](../config/01-overview.md#transformaliasedimportpaths)

#### `transformAliasedImportPathsInCollection`

Introduced in [Stencil v2.18.0](https://github.com/ionic-team/stencil/releases/tag/v2.18.0), `transformAliasedImportPathsInCollection` is a configuration flag on the [`dist` output target](../output-targets/dist.md#transformaliasedimportpathsincollection).
`transformAliasedImportPathsInCollection` transforms import paths, similar to [`transformAliasedImportPaths`](#transformaliasedimportpaths).
This flag however, only enables the functionality of `transformAliasedImportPaths` for collection output targets.

Starting with Stencil v4.0.0, this flag is enabled by default.
Projects that had previously enabled this functionality that are migrating from Stencil v2.18.0+ may safely remove the flag from their Stencil configuration file(s).

For users that run into issues with this new default, we encourage you to file a [new issue on the Stencil GitHub repo](https://github.com/ionic-team/stencil/issues/new?assignees=&labels=&projects=&template=bug_report.yml&title=bug%3A+).
As a workaround, this flag can be set to `false` to disable the default functionality.
```ts title="stencil.config.ts - disabling 'transformAliasedImportPathsInCollection' in Stencil v4.0.0"
import { Config } from '@stencil/core';

export const config: Config = {
  outputTargets: [
    {
      type: 'dist',
      transformAliasedImportPathsInCollection: false,
    },
    // ...
  ]
  // ...
};
```

For more information on this flag, please see the [`dist` output target's documentation](../output-targets/dist.md#transformaliasedimportpathsincollection).

### In Browser Compilation Support Removed

Prior to Stencil v4.0.0, components could be compiled from TSX to JS in the browser.
This feature was seldom used, and has been removed from Stencil.
At this time, there is no replacement functionality.
For additional details, please see the [request-for-comment](https://github.com/ionic-team/stencil/discussions/4134) on the Stencil GitHub Discussions page.

### Legacy Context and Connect APIs Removed

Previously, Stencil supported `context` and `connect` as options within the `@Prop` decorator.
Both of these APIs were deprecated in Stencil v1 and are now removed.

```ts
@Prop({ context: 'config' }) config: Config;
@Prop({ connect: 'ion-menu-controller' }) lazyMenuCtrl: Lazy<MenuController>;
```
To migrate away from usages of `context`, please see [the original deprecation announcement](https://github.com/ionic-team/stencil/blob/main/BREAKING_CHANGES.md#propcontext).
To migrate away from usages of `connect`, please see [the original deprecation announcement](https://github.com/ionic-team/stencil/blob/main/BREAKING_CHANGES.md#propconnect).

### Legacy Browser Support Removed

In Stencil v3.0.0, we announced [the deprecation of IE 11, pre-Chromium Edge, and Safari 10 support](https://github.com/ionic-team/stencil/blob/1a8ff39073a88d1372beaa98434dbe2247f68a85/BREAKING_CHANGES.md?plain=1#L78).
In Stencil v4.0.0, support for these browsers has been dropped (for a full list of supported browsers, please see our [Browser Support policy](../reference/support-policy.md#browser-support)).

By dropping these browsers, a few configuration options are no longer valid in a Stencil configuration file:

#### `__deprecated__cssVarsShim`

The `extras.__deprecated__cssVarsShim` option caused Stencil to include a polyfill for [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/--*).
This field should be removed from a project's Stencil configuration file (`stencil.config.ts`).

#### `__deprecated__dynamicImportShim`

The `extras.__deprecated__dynamicImportShim` option caused Stencil to include a polyfill for
the [dynamic `import()` function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
for use at runtime.
This field should be removed from a project's Stencil configuration file (`stencil.config.ts`).

#### `__deprecated__safari10`

The `extras.__deprecated__safari10` option would patch ES module support for Safari 10.
This field should be removed from a project's Stencil configuration file (`stencil.config.ts`).

#### `__deprecated__shadowDomShim`

The `extras.__deprecated__shadowDomShim` option would check whether a shim for [shadow
DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
was needed in the current browser, and include one if so.
This field should be removed from a project's Stencil configuration file (`stencil.config.ts`).

### Legacy Cache Stats Config Flag Removed

The `enableCacheStats` flag was used in legacy behavior for caching, but has not been used for some time. This
flag has been removed from Stencil's API and should be removed from a project's Stencil configuration file (`stencil.config.ts`).

### Drop Node 14 Support

Stencil no longer supports Node 14.
Please upgrade local development machines, continuous integration pipelines, etc. to use Node v16 or higher.
For the full list of supported runtimes, please see [our Support Policy](../reference/support-policy.md#javascript-runtime).

## Information Included in `docs-json` Expanded

For Stencil v4 the information included in the output of the `docs-json` output
target was expanded to include more information about the types of properties
and methods on Stencil components.

For more context on this change, see the [documentation for the new `supplementalPublicTypes`](../documentation-generation/docs-json.md#supplementalpublictypes)
option for the JSON documentation output target.

### `JsonDocsEvent`

The JSON-formatted documentation for an `@Event` now includes a field called
`complexType` which includes more information about the types referenced in the
type declarations for that property.

Here's an example of what this looks like for the [ionBreakpointDidChange
event](https://github.com/ionic-team/ionic-framework/blob/1f0c8049a339e3a77c468ddba243041d08ead0be/core/src/components/modal/modal.tsx#L289-L292)
on the `Modal` component in Ionic Framework:

```json
{
  "complexType": {
    "original": "ModalBreakpointChangeEventDetail",
    "resolved": "ModalBreakpointChangeEventDetail",
    "references": {
      "ModalBreakpointChangeEventDetail": {
        "location": "import",
        "path": "./modal-interface",
        "id": "src/components/modal/modal.tsx::ModalBreakpointChangeEventDetail"
      }
    }
  }
}
```

### `JsonDocsMethod`

The JSON-formatted documentation for a `@Method` now includes a field called
`complexType` which includes more information about the types referenced in
the type declarations for that property.

Here's an example of what this looks like for the [open
method](https://github.com/ionic-team/ionic-framework/blob/1f0c8049a339e3a77c468ddba243041d08ead0be/core/src/components/select/select.tsx#L261-L313)
on the `Select` component in Ionic Framework:

```json
{
  "complexType": {
    "signature": "(event?: UIEvent) => Promise<any>",
    "parameters": [
      {
        "tags": [
          {
            "name": "param",
            "text": "event The user interface event that called the open."
          }
        ],
        "text": "The user interface event that called the open."
      }
    ],
    "references": {
      "Promise": {
        "location": "global",
        "id": "global::Promise"
      },
      "UIEvent": {
        "location": "global",
        "id": "global::UIEvent"
      },
      "HTMLElement": {
        "location": "global",
        "id": "global::HTMLElement"
      }
    },
    "return": "Promise<any>"
  }
}
```

## Additional Packages

To ensure the proper functioning of other `@stencil/` packages, it is advisable for projects utilizing any of the packages mentioned below to upgrade to the minimum package version specified.

| Package                          | Minimum Package Version                                                                                                  | GitHub                                                            | Documentation                                               |
|----------------------------------|--------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|-------------------------------------------------------------|
| `@stencil/angular-output-target` | [0.7.1](https://github.com/ionic-team/stencil-ds-output-targets/releases/tag/%40stencil%2Fangular-output-target%400.7.1) | [GitHub](https://github.com/ionic-team/stencil-ds-output-targets) | [Stencil Doc Site](../framework-integration/angular.md)     |
| `@stencil/sass`                  | [3.0.4](https://github.com/ionic-team/stencil-sass/releases/tag/v3.0.4)                                                  | [GitHub](https://github.com/ionic-team/stencil-sass)              | [GitHub README](https://github.com/ionic-team/stencil-sass) |
| `@stencil/store`                 | [2.0.8](https://github.com/ionic-team/stencil-store/releases/tag/v2.0.8)                                                 | [GitHub](https://github.com/ionic-team/stencil-store)             | [Stencil Doc Site](../guides/store.md)                      |
| `@stencil/react-output-target`   | [0.5.1](https://github.com/ionic-team/stencil-ds-output-targets/releases/tag/%40stencil%2Freact-output-target%400.5.1)   | [GitHub](https://github.com/ionic-team/stencil-ds-output-targets) | [Stencil Doc Site](../framework-integration/react.md)       |
| `@stencil/vue-output-target`     | [0.8.6](https://github.com/ionic-team/stencil-ds-output-targets/releases/tag/%40stencil%2Fvue-output-target%400.8.6)     | [GitHub](https://github.com/ionic-team/stencil-ds-output-targets) | [Stencil Doc Site](../framework-integration/vue.md)         |

## Need Help Upgrading?

Be sure to look at the Stencil [v4.0.0 Breaking Changes Guide](https://github.com/ionic-team/stencil/blob/main/BREAKING_CHANGES.md#stencil-v400).

If you need help upgrading, please post a thread on the [Stencil Discord](https://chat.stenciljs.com).
