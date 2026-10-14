---
title: Stencil CLI
sidebar_label: CLI
description: The stencil command and its flags
slug: /cli
---

# Command Line Interface (CLI)

The `stencil` command builds your project, runs the dev server, scaffolds new projects and components, and more. It's available in any project with `@stencil/core` installed, through your package manager's scripts or `npx stencil`.

Flags can be written in dash-case or camelCase (`--max-workers` or `--maxWorkers`). Boolean flags can be turned off with a `no-` prefix (`--no-cache`).

These flags work with every command:

| Flag | Description | Alias |
|------|-------------|-------|
| `--config` | Path to the config file. Only needed if it isn't a `stencil.config.ts` in the project root. | `-c` |
| `--log-level` | How much is logged: `debug`, `info`, `warn`, or `error`. | |
| `--debug` | Sets the log level to `debug`. | |
| `--verbose` | The same as `--debug`. | |
| `--ci` | For continuous integration environments: turns off colors and the new-version check, and uses at most 4 workers. | |
| `--help` | Shows the help text. | `-h` |
| `--version` | Prints the installed Stencil version. | `-v` |

## `stencil build`

Builds the project. A build is a production build unless `--dev` is passed.

| Flag | Description | Alias |
|------|-------------|-------|
| `--dev` | Runs a development build: faster, unminified, and skipping the outputs only needed for publishing. | |
| `--watch` | Rebuilds when files change. | |
| `--serve` | Starts the [dev server](./dev-server.md). Requires `--watch`. | |
| `--port` | The dev server's port. | `-p` |
| `--address` | The address the dev server listens on. | |
| `--open` | Opens the dev server's URL in your browser. | |
| `--ssr` | Server-renders each page the dev server serves. | |
| `--prerender` | [Prerenders](../guides/applications/prerendering/01-overview.md) the `www` output after the build. | |
| `--service-worker` | Generates the `www` output's service worker in a development build, which skips it otherwise. | |
| `--stats` | Writes build stats to `stencil-stats.json`, or to a path you give it. | |
| `--log` | Writes the build log to `stencil-build.log`. | |
| `--no-cache` | Builds without the build cache. | |
| `--max-workers` | The number of worker threads to use, up to 16. Defaults to 8. | |
| `--profile` | Adds performance marks to the build, for profiling components in the browser's developer tools. | |

The usual development command builds, watches, and serves:

```bash
stencil build --dev --watch --serve
```

Before building, Stencil checks your config for options from an older major version, and offers to run [`stencil migrate`](#stencil-migrate) if it finds any.

## `stencil serve`

Starts the [dev server](./dev-server.md) on its own, without building or watching. Use it to serve an existing build.

| Flag | Description | Alias |
|------|-------------|-------|
| `--root` | The directory to serve. Defaults to the current directory. | |
| `--port` | The port to listen on. | `-p` |
| `--address` | The address to listen on. | |
| `--open` | Opens the URL in your browser. | |

```bash
stencil serve --root www
```

## `stencil init`

Starts the project wizard. In an empty directory it scaffolds a new project. In an existing Stencil project it offers integrations to add, the same as `stencil add`. See [Getting Started](../getting-started/01-getting-started.md).

## `stencil add`

Installs and sets up an integration in an existing project, such as a testing tool or a [framework output target](../framework-integration/01-overview.md). Run it with no arguments to pick from a list, or name a package:

```bash
stencil add @stencil/vitest
```

Any package can take part by shipping its own setup wizard.

`stencil init` and `stencil add` are interactive, and don't run in CI environments.

## `stencil generate`

Alias: `stencil g`

Starts the interactive generator for a new component. It asks for the tag name, whether to create a regular or a [CSS-only](../components/css-only.md) component, the stylesheet format, and which extra files to create, such as a usage example or tests.

Pass the tag name to skip that question:

```bash
stencil generate my-button
```

The component is created in a directory named after its tag, inside `src/components`:

```tree
src
└── components
    └── my-button
        ├── my-button.css
        └── my-button.tsx
```

Add one or more folders to the name to nest it:

```bash
stencil generate forms/my-input
```

```tree
src
└── components
    └── forms
        └── my-input
            ├── my-input.css
            └── my-input.tsx
```

## `stencil docs`

Generates every [documentation output target](../output-targets/documentation-generation/01-overview.md) in your config, without building anything else. A production `stencil build` generates them too. A development build skips them, unless an output target sets `skipInDev: false`.

| Flag | Description | Alias |
|------|-------------|-------|
| `--docs-json` | Also writes a [`docs-json`](../output-targets/documentation-generation/docs-json.md) file to the given path. | |
| `--watch` | Regenerates the documentation when source files change. | |

The command exits with an error code if the build has errors, and warns if your config has no documentation output targets.

## `stencil prerender`

Prerenders your `www` output with an [`ssr` module](../output-targets/main/ssr/01-overview.md) that's already built, without rebuilding the project:

```bash
stencil prerender dist/ssr/index.js
```

## `stencil migrate`

Updates your project for the breaking changes in the latest major version, rewriting renamed and removed config options and APIs.

| Flag | Description | Alias |
|------|-------------|-------|
| `--dry-run` | Shows what would change, without modifying any files. | |

## `stencil info`

Prints details about your environment: operating system, Node.js, and the versions of Stencil and the tools it's built on. Include this output when reporting a bug.

## `stencil version`

Prints the installed Stencil version.

## `stencil help`

Alias: `-h`

Lists the commands and their most common flags.
