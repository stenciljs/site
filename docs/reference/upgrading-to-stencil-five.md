---
title: Upgrading to Stencil v5
sidebar_label: Upgrading to Stencil v5
description: How to upgrade a Stencil v4 project to Stencil v5
slug: /upgrading-to-stencil-5
---

# Upgrading to Stencil v5

This guide takes a Stencil v4 project to v5. Most of the work is done by the `stencil migrate` command. The rest is a short list of changes to make by hand, grouped below by where they are.

Upgrade from the latest Stencil v4. If your project is on an older major version, upgrade one major version at a time.

For the reasoning behind each change, see the [list of breaking changes](https://github.com/stenciljs/core/blob/v5/BREAKING_CHANGES.md#stencil-v500).

## Before You Start

- Use Node.js 22 or later.
- Commit your work, so that you can review what the migration changes.
- Check that your project builds on Stencil v4.

## 1. Install Stencil v5

```bash npm2yarn
npm install @stencil/core@beta --save-dev
```

:::note
While Stencil v5 is in preview, it's published under the `beta` tag.
:::

If your project uses Stencil's framework output targets, update them too. They support both v4 and v5:

```bash npm2yarn
npm install @stencil/react-output-target@latest @stencil/vue-output-target@latest @stencil/angular-output-target@latest --save-dev
```

## 2. Run the Migration

Preview the changes first. This command lists every change and modifies nothing:

```bash
npx stencil migrate --dry-run
```

Then apply them:

```bash
npx stencil migrate
```

`stencil build` also detects a project that needs migrating, and offers to run the migration for you.

The migration updates your Stencil config and your component files:

| In | Change |
| --- | --- |
| Components | `shadow`, `scoped`, and `formAssociated` become the [`encapsulation`](../components/component.md#encapsulation) option and [`@AttachInternals()`](../components/attach-internals.md) |
| Components | Imports of raw `.css`, `.svg`, and text files gain a `?stencil` suffix |
| Config | Output targets are renamed: `dist` to [`loader-bundle`](../output-targets/main/loader-bundle.md), `dist-custom-elements` to [`standalone`](../output-targets/main/standalone.md), `dist-hydrate-script` to [`ssr`](../output-targets/main/ssr/01-overview.md) |
| Config | `esmLoaderPath` becomes `loaderPath`, adjusted so that the loader stays where it was |
| Config | `extras` becomes [`compat`](../config/compat.md), and its slot-fix options become `lightDomPatches` |
| Config | `rollupConfig` becomes `rolldownConfig` |
| Config | `buildDist`, `buildDocs`, and `devMode` are replaced by `skipInDev` on each output target |
| Config | `hashFileNames` and `hashedFileNameLength` move onto the `loader-bundle` and `www` output targets |
| Config | `extras.addGlobalStyleToComponents` and `globalStyle` become one [`global-style`](../output-targets/asset-outputs/global-style.md) output target, with `input` and `inject` options |
| Config | Options that now match the default are removed, such as `serviceWorker: null` |

Review the diff before you go on.

## 3. Update `tsconfig.json`

Stencil v4 shipped its own copy of TypeScript. Stencil v5 uses the TypeScript installed in your project, and installs TypeScript 6 if your project has none. TypeScript 6 rejects two settings that Stencil v4 projects commonly have.

Change `moduleResolution` from `node` to `bundler`. Otherwise the build fails with `Option 'moduleResolution=node10' is deprecated`:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

TypeScript 6 also turns on `strict` by default, and a decorated member with no initial value, such as `@Prop() name: string;`, then fails with `Property 'name' has no initializer`. To keep these members as they are, turn that one check off:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "strictPropertyInitialization": false
  }
}
```

To stay on TypeScript 5 instead, add it to your project's `devDependencies`.

## 4. Update `package.json`

The output targets write to new directories, and files that ended in `.esm.js` now end in `.js`:

| Stencil v4 | Stencil v5 |
| --- | --- |
| `dist/` (`dist` output target) | `dist/loader-bundle/` |
| `dist/components/` | `dist/standalone/` |
| `hydrate/` | `dist/ssr/` |
| `dist/types/` | `dist/types/` |
| `dist/collection/` | `dist/collection/` |
| `dist/my-library/my-library.esm.js` | `dist/loader-bundle/my-library/my-library.js` |

Update the `main`, `module`, `types`, `unpkg`, and `exports` fields to match. The build warns when `main` or `module` point to a file that doesn't exist. It doesn't check `unpkg` or your `exports` entries, so check those yourself.

Stencil can also write the `exports` field for you. See [`generateExportMaps`](../config/01-overview.md#generateexportmaps) and [Publishing](../guides/distribution/publishing.md).

Two more changes affect what you publish:

- **CommonJS is opt-in.** The `loader-bundle` and `ssr` output targets write ES modules only. If your consumers still need CommonJS, set `cjs: true` on the output target. Setting `"type": "module"` in your `package.json` is recommended either way.
- **The browser build has moved.** Pages that load your library from a CDN use a URL that ends in `dist/my-library/my-library.esm.js`. To keep that URL working, set `buildDir: '../'` on the `loader-bundle` output target. The browser build is then written to `dist/my-library/` as before, and `my-library.esm.js` remains as a file that forwards to `my-library.js`.

Then update your scripts:

- Remove `--prod`. Production is the default build, and `--dev` opts out of it.
- Remove `--no-open` from dev server commands. The dev server no longer opens a browser unless you pass `--open`.
- Remove `--docs`. A production build already generates your documentation output targets. To generate them in a development build, set `skipInDev: false` on them, or run `stencil docs`.
- Remove `stencil telemetry` commands.
- Replace `stencil test`, as described in [Move your tests](#6-move-your-tests).

## 5. Update Your Code

The migration doesn't make these changes, because they depend on what your code means to do.

### Components

**Replace `hostData()` with `<Host>`.** `hostData()` is ignored in v5, with no warning:

```diff
- hostData() {
-   return { role: 'alert' };
- }
  render() {
-   return <slot />;
+   return (
+     <Host role="alert">
+       <slot />
+     </Host>
+   );
  }
```

**Update `componentShouldUpdate()`.** It now runs once for each render, and receives one argument that holds every change:

```diff
- componentShouldUpdate(newVal, oldVal, propName) {
-   return !(propName === 'name' && newVal === oldVal);
- }
+ componentShouldUpdate(changes: ComponentShouldUpdateChanges<this>) {
+   return !(changes.name && changes.name.newVal === changes.name.oldVal);
+ }
```

A method that still takes three parameters compiles, and receives `undefined` for the second and third. The build warns about each one.

**Check boolean props that are set to `"false"`.** A boolean prop is now `true` whenever its attribute is present, as with native HTML elements. `<my-cmp disabled="false">` gave `false` in v4 and gives `true` in v5. Remove the attribute, or set the property instead. To keep accepting the string, see [`@AttrDeserialize()`](../components/serialization-deserialization.md).

**Check `@Watch()` handlers that ran before the first render.** A watcher no longer runs until its component has rendered once. If you need it to run on the initial value, use `@Watch('name', { immediate: true })`.

**Wrap functional components that return an array.** A `FunctionalComponent` must now return one node or `null`, so wrap an array in a fragment: `<>{items}</>`.

### Config

- Remove `buildEs5` and any `extras.__deprecated__*` options. ES5 builds and their polyfills are gone, and v5 supports [browsers that implement ES2022](./support-policy.md#browser-support).
- Remove the `testing` section.
- If you use the `docs-custom-elements-manifest` output without setting `file`, the manifest now goes to `dist/custom-elements.json` instead of the project root. Delete the old `custom-elements.json` and update anything that read it, or set `file: 'custom-elements.json'` to keep it where it was. Stencil also sets the `customElements` field in your `package.json` to the manifest's path.
- Add `{ type: 'docs-readme' }` to `outputTargets` if you rely on generated component readme files. They're no longer generated unless you ask for them.
- Set `serviceWorker: true` on a `www` output target if your app relies on a [service worker](../guides/applications/service-workers.md). It's no longer generated by default.
- If your project imports from another Stencil library to bundle that library's components into its own, list the library in [`collections`](../config/01-overview.md#collections).
- If you use Rollup plugins, see [Module Bundling](../guides/distribution/module-bundling.md). Stencil now bundles with Rolldown, which runs most Rollup plugins and replaces `@rollup/plugin-commonjs` and `@rollup/plugin-node-resolve`.

### Code That Uses Your Library

- Remove calls to `applyPolyfills()`. The loader no longer exports it.
- Update server code that uses the `ssr` output. `hydrateDocument()` is now `ssrDocument()`, the `beforeHydrate` and `afterHydrate` options are now `beforeSsr` and `afterSsr`, and `streamToString()` returns a web `ReadableStream`. See [Server-Side Rendering](../output-targets/main/ssr/01-overview.md).
- Update imports of Stencil's internal packages:

  | Stencil v4 | Stencil v5 |
  | --- | --- |
  | `@stencil/core/internal` | `@stencil/core/runtime` |
  | `@stencil/core/internal/client` | `@stencil/core/runtime/client` |
  | `@stencil/core/internal/hydrate` | `@stencil/core/runtime/server` |
  | `@stencil/core/cli` | `@stencil/cli` |
  | `@stencil/core/dev-server` | `@stencil/dev-server` |
  | `@stencil/core/mock-doc` | `@stencil/mock-doc` |

- Use `import`, not `require()`, to load any `@stencil/core` module from a Node.js script. The package is now ES modules only.

## 6. Move Your Tests

The `stencil test` command, with its Jest and Puppeteer integrations, is removed.

- For spec tests, follow the [Vitest migration guide](../testing/vitest/07-migration.md). Existing `newSpecPage()` tests can keep running with few changes.
- For e2e tests, use [browser tests in Vitest](../testing/vitest/01-overview.md) for components, or [`@stencil/playwright`](../testing/playwright/01-overview.md) for whole pages.

## 7. Build and Check

Run a build, and fix any warnings it reports:

```bash npm2yarn
npm run build
```

Then check the things a build can't:

- Load your library the way your consumers do, from a `<script>` tag or through a bundler.
- If you publish framework wrappers, build them against the new output.
- Run `npm pack --dry-run`, and confirm that every path in your `package.json` is in the package.
