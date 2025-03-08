---
title: Stencil CLI
sidebar_label: CLI
description: Stencil CLI
slug: /cli
---

# Command Line Interface (CLI)

Stencil's command line interface (CLI) is how developers can build their projects, run tests, and more.
Stencil's CLI is included in the compiler, and can be invoked with the `stencil` command in a project where `@stencil/core` is installed.

## `stencil build`

Builds a Stencil project. The flags below are the available options for the `build` command.

| Flag | Description | Alias |
|------|-------------|-------|
| `--ci` | Run a build using recommended settings for a Continuous Integration (CI) environment. Defaults the number of workers to 4, allows for extra time if taking screenshots via the tests and modifies the console logs. | |
| `--config` | Path to the `stencil.config.ts` file. This flag is not needed in most cases since Stencil will find the config. Additionally, a Stencil config is not required. | `-c` |
| `--debug` | Adds additional runtime code to help debug, and sets the log level for more verbose output. | |
| `--dev` | Runs a development build. | |
| `--docs` | Generate all docs based on the component types, properties, methods, events, JSDocs, CSS Custom Properties, etc. | |
| `--es5` | Creates an ES5 compatible build. By default ES5 builds are not created during development in order to improve build times. However, ES5 builds are always created during production builds. Use this flag to create ES5 builds during development. | |
| `--log` | Write logs for the `stencil build` into `stencil-build.log`. The log file is written in the same location as the config. | |
| `--prerender` | Prerender the application using the `www` output target after the build has completed. | |
| `--prod` | Runs a production build which will optimize each file, improve bundling, remove unused code, minify, etc. A production build is the default, this flag is only used to override the `--dev` flag. | |
| `--max-workers` | Max number of workers the compiler should use. Defaults to use the same number of CPUs the Operating System has available. | |
| `--next` | Opt-in to test the "next" Stencil compiler features. | |
| `--no-cache` | Disables using the cache. | |
| `--no-open` | By default the `--serve` command will open a browser window. Using the `--no-open` command will not automatically open a browser window. | |
| `--port` | Port for the [Integrated Dev Server](./dev-server.md). Defaults to `3333`. | `-p` |
| `--serve` | Starts the [Integrated Dev Server](./dev-server.md). | |
| `--stats` | Write stats about the project to `stencil-stats.json`. The stats file is written in the same location as the config. | |
| `--verbose` | Logs additional information about each step of the build. | |
| `--watch` | Watches files during development and triggers a rebuild when files are updated. | |

## `stencil docs`

Performs a one-time generation of documentation for your project.
For more information on documentation generation, please see the [Documentation Generation section](../documentation-generation/01-overview.md).

## `stencil generate`

Alias: `stencil g`

Starts the interactive generator for a new Stencil component.
The generator will ask you for a name for your component, and whether any stylesheets or testing files should be generated.

If you wish to skip the interactive generator, a component tag name may be provided on the command line:
```shell
stencil generate my-new-component
```

All components will be generated within the `src/components` folder.
Within `src/components`, a directory will be created with the same name as the component tag name you provided containing the generated files.
For example, if you specify `page-home` as the component tag name, the files will be generated in `src/components/page-home`:
```plain
src
└── components
    └── page-home
        ├── page-home.css
        ├── page-home.e2e.ts
        ├── page-home.spec.ts
        └── page-home.tsx
```

It is also possible to specify one or more sub-folders to generate the component in.
For example, if you specify `pages/page-home` as the component tag name, the files will be generated in `src/components/pages/page-home`:
```shell
stencil generate pages/page-home
```
The command above will result in the following directory structure:
```plain
src
└── components
    └── pages
        └── page-home
            ├── page-home.css
            ├── page-home.e2e.ts
            ├── page-home.spec.ts
            └── page-home.tsx
```

## `stencil help`

Aliases: `stencil --help`, `stencil -h`

Prints various tasks that can be run and their associated flags to the terminal.

## `stencil test`

Tests a Stencil project. The flags below are the available options for the `test` command.

| Flag | Description |
|------|-------------|
| `--spec` | Tests `.spec.ts` files using [Jest](https://jestjs.io/). |
| `--e2e` | Tests `.e2e.ts` files using [Puppeteer](https://developers.google.com/web/tools/puppeteer) and [Jest](https://jestjs.io/). |
| `--no-build` | Skips the build process before running end-to-end tests. When using this flag, it is assumed that your Stencil project has been built prior to running `stencil test`. Unit tests do not require this flag. |
| `--devtools` | Opens the dev tools panel in Chrome for end-to-end tests. Setting this flag will disable `--headless` |
| `--headless` | Sets the headless mode to use in Chrome for end-to-end tests. `--headless` and `--headless=true` will enable the "old" headless mode in Chrome, that was used by default prior to Chrome v112. `--headless=new` will enable the new headless mode introduced in Chrome v112. See [this article](https://developer.chrome.com/articles/new-headless/) for more information on Chrome's new headless mode. |

## `stencil version`

Aliases: `stencil -v`, `stencil --version`

Prints the version of Stencil to the terminal.
