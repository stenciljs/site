# Stencil v5 Docs Plan

> **Living document.** Status and what's left are at the top. [Found Stencil Bugs Whilst Testing](#found-stencil-bugs-whilst-testing) tracks every engine/package bug the docs work turned up. The [Session Log](#appendix-session-log) at the bottom is a condensed history; append new entries there, one short bullet per change. The full, unabridged log up to 2026-10-28 is in git (`git show dffb9e10:V5_DOCS_PLAN.md`, plus the uncommitted entries from 2026-10-14 to 2026-10-28 that this tidy folded in).

Source material for what's changing in v5 lives in the sibling `stenciljs` repo:
- `/Users/John.Jenkins/projects/stenciljs/V5_PLANNING.md` - goals, in-flight work, new features.
- `/Users/John.Jenkins/projects/stenciljs/BREAKING_CHANGES.md` - canonical breaking-change list (the "Stencil v5.0.0" section).

Both have been wrong in places. Verify against source and a scratch build before writing. **After any multi-day gap, `git log` the `stenciljs` `v5` branch first** - features have landed unannounced between sessions (e.g. CSS-only components, which also renamed a placeholder an existing page used).

## Status (2026-10-29)

- **Restructure, rewrites and net-new pages: done.** Every page in `docs/` has been rewritten or checked against v5. The per-file audit tables that used to live here were all ticked off; see the session log and git history for what changed on each page.
- **In progress:** John's manual review of the whole v5 docs for coherence. Pages reworked during that review so far: `components/{api,slots,css-only,form-associated,functional-components,component-lifecycle,host-element,styling,templating-and-jsx}.md`, `guides/patterns/mixins-and-controllers.md`, `introduction/*`.
- **Next:** integrate `@stencil/playground` for live demos (see [Live Examples](#live-examples)).

## Remaining Work

Docs:
- [ ] **SSR section growth** (John 2026-10-13): integration examples for the major meta-frameworks under `output-targets/main/ssr/`.
- [ ] **`reference/support-policy.md`**: V5 row added as Preview / TBD (John 2026-11-03); fill in the release date at GA, and V4's maintenance end date (six months after it).
- [ ] **`config/dev-server.md`**: `historyApiFallback` exists but isn't documented.
- [x] **`framework-integration/framework-types.md`**: matches `@stencil/types-output-target` 1.0.2 (subpaths now `./react-native-types` etc., like its README and generated header).
- [ ] Optional: `guides/patterns/typed-components.md` could mention that `h.JSX.Element` now resolves to `VNode` (was `any`).
- [ ] Optional cleanup: `src/css/code.css` and probably the other loose files in `src/css/` aren't imported anywhere.
- [ ] Out of this repo: the stenciljs.com landing page (separate Next.js app) still has a "Stencil 4 is here!" banner.

At GA / when v5 merges:
- [ ] `introduction/02-installation.md` "Updating Stencil": `@stencil/core@beta` → `@latest`, drop the preview note.
- [ ] Getting started: `npm init stencil@next` → plain `npm init stencil`, drop the preview note (`@5` can't resolve before a stable `create-stencil@5.0.0` exists).
- [ ] `reference/upgrading-to-stencil-five.md`: `@stencil/core@beta` → `@stencil/core@5`, drop the preview note; repoint the `BREAKING_CHANGES.md` link from the `v5` branch to `main`.
- [ ] `guides/tooling/storybook.md`: drop `@dev` and its note once `@stencil/storybook-plugin` 1.0 ships.
- [ ] When v5 merges to `main` in `stenciljs/core`: `docs-json.md`'s two links to `blob/main/src/declarations/stencil-public-docs.ts` need the new `packages/core/src/declarations/…` path.
- [ ] At GA: `docusaurus docs:version v5.0`, then `lastVersion: 'v5.0'` (see [Versioning](#versioning--branch-strategy)).

## Standing Steers (apply to every page)

- **Shadow DOM is one option, not the default.** The footgun reputation belongs to shadow DOM. `encapsulation` defaults to `'none'`; shadow is opt-in. "Non-shadow" means `scoped` and `none` together. `none` + native [`@scope`](https://developer.mozilla.org/en-US/docs/Web/CSS/@scope) is the modern-browser alternative to `scoped` (Baseline "newly available" since Firefox 146, Dec 2025 - say so honestly).
- **Four component archetypes, equally first-class** (`concepts/component-archetypes.md`): CSS-only → progressively enhanced (a pattern, not a feature) → custom element without shadow → with shadow. All are typed and documented by the same static analysis.
- **Design systems first, apps second.** `www`, prerendering, service workers and routing stay documented, under `guides/applications/`, with proportionally less emphasis.
- **Writing quality bar:** the project's feedback memories (no em dashes, no "X, not Y" constructions, no meta-commentary, introduce before using, cut tutorial asides, don't over-specify how-to conditions, minimal corrections in context). Read them before writing or reviewing prose.
- **Verify, don't trust.** Run CLI/build/runtime claims in a scratch project; type-level and config-rename facts can come from source. Planning docs, JSDoc and `--help` text have all drifted from real behaviour this cycle.

## Docs Structure (as built)

| Category | Contents |
|---|---|
| `introduction/` | About (`/introduction`), Installation (`/getting-started`), Your First Component |
| `components/` | Decorators, lifecycle, JSX, slots, styling, host element, CSS-only, form-associated, functional components, … |
| `config/` | `stencil.config.ts`, CLI, dev server, `compat` (was `extras`), plugins, docs |
| `output-targets/` | `main/` (`loader-bundle`, `standalone`, `www`, `ssr/`, `ssr-wasm/`), `documentation-generation/` (incl. `docs-agent-skill`), `asset-outputs/` (`assets`, `global-style`), `supporting/` (`types`, `collection`, `copy-tasks`) |
| `framework-integration/` | Overview, Framework Types, React, Vue, Angular, JavaScript (Ember removed) |
| `testing/` | `@stencil/vitest`, `@stencil/playwright` (the v4 test runner is gone from v5 docs) |
| `guides/` | `patterns/`, `distribution/`, `tooling/`, `applications/` (overview + routing, deployment, prerendering, service workers) |
| `concepts/` | Goals, component archetypes, rendering strategies |
| `reference/` | Upgrading to v5 (and v4), FAQ, support policy, versioning, CLI/compiler/dev-server APIs |

Every page has an absolute `slug`, so moving files doesn't change URLs. Renamed v5 pages get **v5-only** redirects in `vercel.json` (`/v5/<old>` → `/docs/v5/<new>`), since the old pages still exist in the frozen v4 snapshots.

## Versioning & Branch Strategy

`docusaurus.config.js`:

```js
lastVersion: 'v4.43',
versions: {
  current: { label: 'v5 (Preview)', path: 'v5', badge: true, banner: 'unreleased' },
  'v4.43': { label: 'v4.43', banner: 'none' },
},
```

- The default (un-prefixed) site stays on stable `v4.43`; `docs/` is v5's, shown as `/v5/` in the version dropdown.
- Both `stencil-site` and `stenciljs` work on a `v5` branch. The intent is to merge into `main` early so beta/RC users have docs. Checked 2026-10-10: `main`'s `docs/` is identical to `versioned_docs/version-v4.43`, so the merge loses no v4 content.
- After the merge, v4-only fixes go directly into `versioned_docs/version-v4.43/`.

## Live Examples

- **Direction (John 2026-10-14):** integrate `@stencil/playground`. Earlier research: `playground-elements` was rejected because it can't run Stencil's compiler, and Stencil's compile step is what demos need to show. In-browser compilation was removed in Stencil v4. Candidate runtimes researched before `@stencil/playground` existed: StackBlitz WebContainers + `@stencil/unplugin`, or Sandpack + a Node runtime.
- `TODO(live-demo)` HTML comments mark candidate spots, e.g. `components/styling.md` ("Choosing an Encapsulation Strategy": three components differing only in `encapsulation`), `introduction/03-your-first-component.md`, `guides/patterns/mixins-and-controllers.md`.
- `ssr-wasm` language examples stay static (no in-browser non-Node runtimes).

## Working Notes

- **Scratch projects** live in `~/projects/stencil-scratch/` (outside both repos, not in git, created 2026-10-29). The session scratchpad under `/private/tmp` lost files to macOS's `/tmp` cleanup and was later withdrawn, so don't use it. Playwright is in `stencil-scratch/pwbin` (`createRequire('…/pwbin/')`); link core into a project with `ln -sfn …/stenciljs/packages/core node_modules/@stencil/core`. Use the scaffold tsconfig (`strictPropertyInitialization: false`) or doc snippets fail on uninitialised props. Run build steps from a bash script, not inline zsh: an unmatched glob aborts the rest of the line and leaves stale output behind. Never `rm` with a relative path after a `cd`; use absolute paths inside the scratch folder.
- **Testing a package as another library sees it:** copy it into `node_modules`, don't symlink. With a symlinked package (realpath outside `node_modules`), Stencil didn't pick up inherited members at all (see bugs).
- **Docusaurus anchors in tables:** the broken-anchor checker only knows anchors registered via its `Heading` hook, so a `<tr id>` fails the build. Use `src/components/TableAnchor.tsx` (`useBrokenLinks().collectAnchor(id)`).
- **Build only for structural changes** (headings, links, moves). The site build takes ~1 minute; if it takes much longer, check for a long-running `docusaurus start` competing over `.docusaurus/`.

## Found Stencil Bugs Whilst Testing

Status is as last checked (2026-10-29). "Branch" means committed but not released; "local" means fixed in the working tree, uncommitted.

### Open

| Package | Bug | Found |
|---|---|---|
| core | With `@stencil/store` and no component using `@Prop`/`@State`, `BUILD.updatable` is false and store changes re-render nothing. Unlikely in real apps. Parked (John 2026-10-29). | 2026-10-13 |
| repo | `pnpm-lock.yaml` still lists `webpack` / `@rspack/core` as regular `dependencies` of `packages/unplugin`; #6942 moved them to optional peers in `package.json`. Needs a `pnpm install` to resync; may trip `--frozen-lockfile`. | 2026-10-29 |
| core (CLI) | `KNOWN_INTEGRATIONS` gives `@stencil/storybook-plugin` `versionRange: '>=1.0.0-0'`, which resolves to the old `1.0.0-dev` build, not `2.0.0-dev`. Fine once 1.0.0 ships. Parked (John 2026-10-29). | 2026-10-10 |

### Fixed

| Package | Bug | Fix |
|---|---|---|
| core | Functional component reached through a re-export (`export *`, `export { } from`, directory `index.ts`) lost its classes, styles and listeners: `render()`'s functional-component deps were recorded on the component meta, which has no `functionalComponentDeps`, so they were dropped; `export … from` wasn't a local import; `/index` files weren't looked up. | `529deb207` (branch `v5-various-fixes`) |
| core | `utils.map` / `utils.forEach` turned text children into `<undefined>` elements; primitives now become `{ vtag: null, vtext }`. | `529deb207` (branch `v5-various-fixes`) |
| core | CSS-only: `@cssprop --name - description` (and `--name description`) now parse; `@property` `syntax`/`initial-value` merge into an already-documented property; a JSDoc comment above `&[attr]` / `tag[attr]` describes that attribute. | `86acafcbe` (branch `v5-various-fixes`) |
| core | docs-readme (and the agent skill) gained Syntax / Default columns for CSS custom properties, shown only when some property has them. | `86acafcbe` (branch `v5-various-fixes`) |
| `@stencil/types-output-target` | Generated files imported component types `from '<fsNamespace>'`, which drops `@scope/` (so broke every scoped package); now reads the `package.json` name. The header's import path now follows the real output filename and shows the `exports` entry it needs; README corrected to `react-native-types` with an `exports` section. | `0352a29` (`output-targets`, branch `wizard-fixes`) |
| core | Copy-task `ignore`: adding to the defaults (v5, `f39d5f1c7`) is now in `BREAKING_CHANGES.md`; directory copies now apply `ignore` (it was a no-op), matched relative to the copied directory; an explicitly named `src` is always copied. No opt-out for the defaults (John: copy a nested `dist/` with its own task). | `49f07819b` (branch `v5-various-fixes`) |
| core | A copy from outside `srcDir` that kept its directory structure (the default with no `dest`) carried the `../` into the destination and wrote outside the output dir; it's now a build error asking for `dest`. | `49f07819b` (branch `v5-various-fixes`) |
| core | Regular-component style docs now share the CSS-only `@prop` parsing (`--name - desc`, `--name: desc`, `--name desc`) and merge `@property` `syntax`/`default` into an already-documented property. | `7a1c85404` (branch `v5-various-fixes`) |
| core | `tsconfig` `target` warning raised from ES2017 to ES2022 (the browser floor); repo test projects bumped; upgrade guide and `BREAKING_CHANGES.md` mention it. | `566915ed2` (branch `v5-various-fixes`) |
| core | Extending a component from another Stencil library inherited nothing (its own members or its mixins'), with a misleading "couldn't find a class" warning: the class was found in the package's ambient `.d.ts`, never its collection JS, and the collection's relative `.js` imports needed `allowJs`. Reproduced identically with a symlinked workspace package and a copied one, so it wasn't symlink-specific (the 2026-10-16 "copy works" observation didn't reproduce). | `ddaa46141` (branch `v5-various-fixes`) |
| core | Mixin / extended class reached through an `export *` barrel (in the project or a package entry) lost its members with a barrel warning; `export *` now counts as the one allowed re-export hop. `mixins-and-controllers.md` updated, and the now-obsolete "Importing Functional Components" caveat removed from `functional-components.md`. | `ddaa46141` (branch `v5-various-fixes`) |
| `@stencil/unplugin` | Published `index.d.mts` used `WebpackPluginInstance` / `RspackPluginInstance` with no import (tsdown inlined the inferred names), so it failed to type-check. Exports are now annotated as `UnpluginInstance<…>['webpack']` etc., referencing `unplugin`'s own types. | `96c538e4d` (branch `v5-various-fixes`) |
| core | Re-rendering a component hydrated from prerendered/SSR markup could throw in the vdom patch (`createSimpleVNode` left `$children$` undefined), breaking router navigation on prerendered pages. | `8edd9838f` |
| core | CEM `demos[].url` was an absolute path on the build machine. | `7feeb7ee7` |
| core | `getSignal()` returned `null` in production builds (host-ref property names minified separately in the signals chunk). | `686d61182` |
| core | `ssr` output failed to build with Rolldown 1.2.13 (factory chunk parsed as a script). | `eb3bbe79d` / `bfc94e404` |
| core | `global-style-inject` migration removed `addGlobalStyleToComponents: false` without a replacement, so global CSS got bundled into the runtime. | `d523eabbf` |
| core | Multi-parameter `componentShouldUpdate` warning never fired. | `4ef24393f` |
| core | `stencil init` loader template: `module` and `types` didn't match without a `src/index.ts`. | `06a585118` |
| core | SSR ignored the tag transformer inside components; `defineCustomElement({ registry })` didn't cover nested components; `stencil add` ran installs with `NODE_ENV=production`, pruning devDependencies; `stencil docs` wrote nothing; `stencil --help` inaccuracies; `workbox-build@4.3.1` recommended; dead jest/puppeteer lazy-require entries; `setNonce` / `Config.nodeResolve` JSDoc wrong. | `dbcbfa87c` (`--docs` later removed, `65e48ea50`) |
| core | `Build.isBrowser` / `isServer` weren't dead-code-eliminated. | `7a6fdf6aa` |
| core | Spurious "couldn't find a class" warning for `Mixin(ReactiveControllerHost)` (bare-specifier imports resolved to `.d.ts`). | `00d733806` |
| core | React wrappers vs v5 `package.json`: `standalone.d.ts` didn't re-export `components`; export maps lacked `./standalone`, `./ssr`, `./components`. | beta.18 (`a7d9265d9`) |
| core | Static `component-starter` template shipped `stencil.config.ts` unconditionally; standalone asset paths weren't auto-set per component; no warning when `package.json` `files` misses output dirs. | `374026fa1`, `6f6ac8c97` / `aaf0ebddd`, `f968c9d3f` / `265ad5465` |
| core | `stencil --help` advertised the removed `stencil test`. | `1ba37c0da` |
| core (docs) | `BREAKING_CHANGES.md` / JSDoc drift: `lightDomPatches` field names, `validatePrimaryPackageOutputTarget`, `externalRuntime`, `transformAliasedImportPaths` and `skipInDev` defaults, `SerializeDocumentOptions` defaults, `docs-agent-skill` `name`, `global-style` `inject` default, `*Hydrate` aliases, "no `stencil add`" and Node 18 lines in `V5_PLANNING.md`, missing TypeScript-not-bundled and ES2022 entries. | 2026-09-30 to 2026-10-13 |
| `output-targets` | React generator used backslash paths on Windows. | `214140f` |
| `output-targets` | React wizard installed the output target as a devDependency; Vue lazy mode scaffolded no plugin. | `e4c6c12`, `f8cec80` (branch) |
| `output-targets` | Angular wizard, NgModule type: added `standalone` instead of `loader-bundle`, and the module registered nothing. | `44eaf4a` (branch `wizard-fixes`) |
| `@stencil/playwright` | Wizard wrote `serviceWorker: null` (triggers a "Migrations Required" stop); no support for standalone-only projects. | `960b18f` (branch `v5-wizard-tweaks`), needs release - `testing/playwright/01-overview.md` already documents it |
| `@stencil/vitest` | `toEqualHtml` failed on inline text; no Vitest 5 support. | 1.16.1, 1.16.0 |
| `@stencil/storybook-plugin` | Wizard's `.storybook/tsconfig.json` didn't include `components.d.ts`; README used Storybook 8's `addon-essentials`. | local (`v5-integration`) |
| `@stencil-community/router` | npm's 1.0.2 (component router) broke on first render in v5. | 2.0.0 (`createRouter` API) |

Not bugs, for the record: the `<5.0.0-next.0` bound in peer ranges is deliberate (it excludes an accidentally published `5.0.0-next.0`); never widen past it.

## Appendix: Session Log

Condensed. One bullet per change; details are in git history.

### 2026-08-25 to 2026-09-16

- Versioning config (`v5 (Preview)` at `/v5/`); audit of every page; IA restructure (`a2a87d88`): `core/` → `reference/`, docs targets and SSG folded under `output-targets/`, Ember page and the v4 test runner removed.
- First rewrites: getting started around `stencil init`; the `encapsulation` sweep (`component`, `styling`, `host-element`, `form-associated`, `attach-internals`); `componentShouldUpdate` batching; `config/compat.md` (from `extras`); `loader-bundle` / `standalone` (renamed from `dist` / `custom-elements`, v5-only redirects); `output-targets/01-overview.md` incl. "Choosing Between `loader-bundle` and `standalone`"; `config/plugins.md` for Rolldown.
- `styling.md` line-by-line review with John produced most of the feedback memories.
- `guides/design-systems.md` removed (folded into the About page); `publishing.md` rewritten (publish then consume, `files` gotcha, CDN paths).
- Assets: `assets` output target always on, unified `dist/assets/`; `guides/assets.md` rewritten as a numbered how-to; new `output-targets/assets.md`.
- `guides/extends.md` → `mixins-and-controllers.md`: `Mixin(ReactiveControllerHost)`; decorated members need a named class declaration (TypeScript's rule, `TS1206`); `LifecycleMethodsChart` gained a controller variant; `TableAnchor` component.
- `collection.md` written (consumers need `collections` config or a side-effect import).

### 2026-09-30

- After a 2-week gap: CSS-only components had landed (`1c9a644c8`) and renamed `stencil-globals` → `stencil-component-globals`; fixed `styling.md`. New `components/css-only.md` and `concepts/component-archetypes.md`. Default encapsulation confirmed `'none'`.
- New: `global-style.md` (`inject` defaults to `'client'` unless `input` is set), `types.md`, `docs-agent-skill.md`. `docs-json` gained `usage`.
- `output-targets/` subgrouped (`main/`, `documentation-generation/`, `asset-outputs/`, `supporting/`).
- SSR rewrite: `ssr/{01-overview,frameworks,authoring}`, `ssr-wasm`, `concepts/rendering-strategies.md`; `hydrate-app` / `server-side-rendering` guides removed; `@stencil/ssr` content dropped (John). `PrerenderConfig` hook renames have no aliases.

### 2026-10-02 to 2026-10-09

- `framework-integration/framework-types.md` written. React, Vue, Angular pages rewritten wizard-first around a monorepo. Vue lazy mode: the library owns a plugin that calls `defineCustomElements()` (John). Export-map and wrapper-types fixes in core (beta.18) and output targets.
- `generateExportMaps` is opt-in everywhere (beta.16+); `config/01-overview.md#generateexportmaps` rewritten.

### 2026-10-10

- Rewritten: `framework-integration/javascript.md`, `config/cli.md` (from source, not `--help`), `guides/module-bundling.md` (Rolldown), `csp-nonce.md` (nonce only ever applied to `<style>`), `tag-transformation.md` (+ scoped registries), `service-workers.md` (Workbox 7), `storybook.md` (plugin `2.0.0-dev`), `style-guide.md` fixes.
- Vitest docs reworked around `@stencil/unplugin` (`stencilVite()`, browser mode first; `stencilSpecPage()` for migration). Wizard steps added to Vitest and Playwright pages. Playwright doesn't need `www`.
- Getting started uses `npm init stencil@next` (`@5` can't resolve a prerelease). Node floor 22 (John). `telemetry.md` deleted.

### 2026-10-12 to 2026-10-13

- New: `reference/upgrading-to-stencil-five.md` (from a real v4.45 → beta.20 upgrade), `guides/signals.md`.
- Rewritten: `reference/{cli-api,compiler-api,dev-server-api}.md`, `docs-readme.md` generation rules, `support-policy.md` (Vitest/Playwright tables, TypeScript from the project), `properties.md` (~1000 → ~250 lines, after a section-by-section review with John).
- Browser floor ES2022 (John): Chrome/Edge 94+, Firefox 93+, Safari 16.4+.
- `guides/` regrouped into `patterns/`, `distribution/`, `tooling/`, `applications/`; prerendering and deployment moved under applications. `--docs` removed from core; `stencil docs` generates every docs target.

### 2026-10-14

- Routing section in `guides/applications/01-overview.md` (`ion-router`, `@stencil-community/router` 2.0.0). FAQ cut from 30 to 11 questions. GitHub links → `stenciljs/*`. CEM default location `dist/`, `customElements` in `package.json`.
- Playwright: `www` writes every `src/**/*.html`; CSS still needs a copy task; standalone-only support in the adapter.
- Introduction section restored: About, Installation, Your First Component (a `stencil generate` walkthrough with the dev server's component preview). `config/dev-server.md` gained "Component Previews". Code blocks restyled to match the homepage (Prism `vsDark`, `#0a1220`, Roboto Mono, shadow; default radius).
- Upgrade guide tweaks with John; `api.md`: `componentOnReady()` and `appload` clarifications.
- Legacy JSX setup removed from the docs: `react-jsx` + `jsxImportSource` only; `h`/`Fragment` stripped from every example import; `api.md` describes them as legacy-only.

### 2026-10-15 to 2026-10-16

- New `components/slots.md` (basics, forwarding incl. renamed slots, `slotchange`, slots without shadow DOM, `::slotted()`, documenting slots); FAQ entry on non-shadow slots.
- Mixin barrel caution moved from `api.md` to a new "Use mixins from other Stencil libraries" section (package `exports` subpath: `types` → `dist/types`, `default` → `dist/collection`).

### 2026-10-28

- `component-lifecycle.md`: `componentShouldUpdate` note and `@Watch()` pointer; clock example moved under `disconnectedCallback()`.
- `css-only.md` rewritten around a worked `my-badge` example with real generated output; sidebar label "CSS-Only Components".
- `form-associated.md` rewritten (~280 → ~140 lines), browser-verified; note that `scoped`/`none` inner inputs already join the form (and the double-submit catch).
- `functional-components.md` rewritten; the old array-return and `AddClass` examples were broken.
- Host styling moved to `styling.md` "Styling the Host Element": `:host` works in `shadow` and `scoped`, the tag name only in `none`.
- Plan tidied (this version): audit tables, phasing and resolved decisions removed; bugs collected into their own section; log condensed.

### 2026-10-29

- Bug pass: fixed (local, uncommitted) functional components through re-exports, `utils.map`/`forEach` text children, three CSS-only doc-parsing bugs, readme Syntax/Default columns, and `types-output-target` paths + scoped package names. New open bugs from the pass: copy `ignore` is a no-op for directory copies, glob copies from outside `srcDir` escape the output dir, regular-component style docs share two CSS-only bugs.
- Copy `ignore`: kept additive, documented it in `BREAKING_CHANGES.md`, made directory copies honour it.
- Copy tasks from outside `srcDir` that would write outside their destination now error.
- Style docs aligned with CSS-only parsing; `target` warning raised to ES2022 (upgrade guide step 3 gained a `target` paragraph).
- Fixed extending another library's component (members and its mixins were dropped); the "symlinked package" bug turned out to be this, for installed packages too.
- `export *` barrels now followed for mixins / extended classes (one hop); docs updated.
- `@stencil/unplugin` published types fixed. All 2026-10-29 fixes committed on `v5-various-fixes` (stenciljs) and `wizard-fixes` (output-targets).
- Docs after re-verifying the 2026-10-29 fixes on a rebuilt core (scratch `v2/fix`, `v2/mx`): `css-only.md` (doc comments above attribute/slot rules describe them; `@cssprop` dash form; `@property` merges), `docs-readme.md` Styling Details (Syntax/Default columns), `functional-components.md` (`AddClass` guards text children, `vtag` is `null` for text), `copy-tasks.md` (directory copies apply `ignore`; explicit `src` always copied; outside-`srcDir` needs `dest`), upgrade guide Config bullet for copy tasks, `framework-types.md` subpaths. Confirmed: `export *` mixin barrels work copied and symlinked; a two-hop chain still warns.
- `components/methods.md`: removed the "rely on methods as little as possible" note (John).
- `components/reactive-data.md` → "Watching Changes" (sidebar "Watch", slug `/reactive-data` kept): ~250 → ~80 lines. One-member example, then immediate / several members (third `propName` arg, `set-value.ts`) / native attributes (core `watch-native-attributes` test) / arrays and objects (one line + link to `state.md#complex-types`; both timer examples dropped as duplicates). Links to `#the-watch-decorator-watch` (api, properties, component-lifecycle, `LifecycleMethodsChart`) repointed to the page.
- `components/state.md` tightened (~270 → ~80 lines): toggle example, one clock example under "When to Use" (state vs plain member), "Arrays and Objects" (replaces "Complex Types"; push/in-place vs reassign, objects too). Cut the `@Listen` example and the three near-duplicate clock versions. Inbound anchors repointed (`api.md`, `reactive-data.md`).
- **`components/styling.md` split (John, 2026-10-29)** into `components/styling/` ("Styling" category): `01-overview.md` (`/styling` kept: encapsulation, host element, `@scope`, links to the rest), `styling-api.md` (`/styling-api`, "Defining a Styling API": custom properties, parts, exportparts; John's framing - the component's public styling API), `global-styles.md` (`/global-styles`), `style-modes.md` (`/style-modes`, rewritten). Style-mode claims verified in `~/projects/stencil-scratch/modes`: no `setMode()` → no styles; unsupported mode → no styles; v5 auto-uses `src/global.ts` as `globalScript` (now on `config/01-overview.md`). 15 files' links repointed by anchor; Playwright API's hard-coded stenciljs.com link made relative. Old `/styling#style-modes` etc. anchors now land on the overview (no redirect).
- "Styling Shadow DOM Components From a Global Stylesheet" moved from `global-style.md` (output target) into `components/styling/global-styles.md` as "Styling Shadow DOM Components" (replacing "Constructable Stylesheets"); `inject` links to it. Dropped the `scoped`/`none` tag-selector line (John: injection is shadow-only, so it doesn't belong there). Verified: from a global stylesheet, `:host(tag)` matches only shadow hosts; a plain tag selector matches all three. Stale "§6" references in TODO comments → "Live Examples".
- SSR in frameworks: Next.js setup moved into `framework-integration/react.md#server-side-rendering` (opening reworded for that page); `ssr/frameworks.md` keeps "Any Server Framework" + a Next.js pointer (home for future meta-framework examples). **Nuxt removed** (John: integration underbaked / doesn't work): SSR page section, `vue.md` SSR section + `hydrateModule` option + intro mention, overview table cell. `@stencil/vue-output-target` still has the option; undocumented on purpose.
- `components/build-conditionals.md` rewritten: all four `Build` flags (table), `isBrowser` and `isTesting` examples, link to SSR-friendly components; dropped "disable auth checks in dev". Verified (`~/projects/stencil-scratch/bc`): CLI build `isTesting` true with `NODE_ENV=test` or `VITEST=1`, false otherwise. **Open for John:** under Vitest with `stencilVite()` (the documented setup), `Build.isTesting` is **false** - unplugin doesn't apply core's test-env check. Bug?
- **`Build.isTesting` / `isDev` fixed for the transpile path (uncommitted, `stenciljs`, 2026-11-02):** `client/client-build.ts` made `isDev`/`isTesting` getters (the copied values were read before each component module's `BUILD.*` overrides ran, so unplugin's overrides never reached `Build`); `BuildOverrideKeys` gained `isDev`/`isTesting`; unplugin `isTestEnvironment()` (mirrors core's env check) sets `isTesting` in `configOverrides`, + spec. Verified: Vitest + `stencilVite()` now `dev=true testing=true` (was `false`/`false`); CLI prod/`--dev`/`NODE_ENV=test` builds unchanged; unplugin 80/80, core runtime/client/bundle 822/822, core `tsc` clean. Build-conditionals row updated to "built under a test runner such as Vitest or Playwright, or with `NODE_ENV=test`" - needs the fix released.
- `build-conditionals.md` moved from `guides/patterns/` to `components/` (John); `Build` entry added to `api.md` "Other". Slug kept at `/guides/build-conditionals`: `vercel.json` has a legacy all-versions 302 for `/:version?/build-conditionals` → version root, which would swallow a `/build-conditionals` slug in production.
- Output-targets overviews: top-level `01-overview.md` is now a map grouped like the sidebar; new `main/01-overview.md` (`/main-output-targets`) holds "Choosing Between loader-bundle and standalone", the both-targets config example, and package.json validation. Rule (John agreed): category gets one map page; a group gets an Overview only with shared material (Main, Documentation; not Assets/Supporting). Links from `publishing.md` and `standalone.md` repointed.
- New `testing/playwright/04-migration.md` (`/testing-playwright-migration`): v4 `newE2EPage()` → `@stencil/playwright`; before/after, API mapping, key differences. Every mapping run with `@stencil/playwright` 0.6.0 + Playwright 1.64 in `~/projects/stencil-scratch/pwmig` (setContent, page/locator spyOnEvent, class/text assertions, evaluate for props + methods, waitForChanges, event matchers, shadow piercing); adapter's setContent/goto wait for `appload`. Overview's migration section → pointer; Vitest migration E2E section cross-links it. Also verified: `Build.isTesting` is true under Playwright's dev server (local core).
- `guides/patterns/typed-components.md` rewritten around practical uses (refs, typed querySelector, typed events incl. `MyToggleCustomEvent`, type-checked JSX, tests, consumer pointers) and a neutral commit-or-ignore note for `components.d.ts`; "moved" stubs removed. Examples compiled in `~/projects/stencil-scratch/pwmig`; a fresh clone with no `components.d.ts` builds cleanly. **Open for John:** with a *stale* `components.d.ts`, the first build after adding a component that references its own `HTML{Tag}Element` fails (`Cannot find name`); the next build passes.
- `guides/patterns/workers.md` tightened (~285 → ~150 lines): vanilla section → one intro sentence; "When to use" + "Best Practices" merged into Limits; fixed broken examples (missing `)`, ArrayBuffer `.length`, undefined `buffer`, `await` in non-async method); Rollup → bundled by Stencil; `importScript` → `importScripts`. Verified in `~/projects/stencil-scratch/wk`: proxies, callbacks, `?worker` exports + `workerPath` pool. The "must return a Promise" check only runs in dev builds (`worker-plugin.ts`); workers are classic, so `importScripts()` works.
- New `guides/distribution/scoped-registries.md` (`/scoped-registries`): problem, scoped vs tag transformation table, `setRegistry` (loader + standalone index) and `defineCustomElement({ registry })`, nested components, browser support. Tag-transformation section → pointer (anchor kept). Verified in `~/projects/stencil-scratch/scer` (Chromium 156 + WebKit 27.2): all three setups upgrade scoped, shadow-nested and light-nested components; global tag untouched; children auto-defined. Firefox 157: no native support. **Open for John:** `@webcomponents/scoped-custom-element-registry` 0.0.10 (latest) only knows `attachShadow({ customElements })`; Stencil passes `customElementRegistry`, so nested components don't upgrade with the polyfill (V5_PLANNING says the polyfill works). Fix by passing both option names? Also: the standalone auto-loader (`loader.js`) doesn't export `setRegistry`.
- Tag-name clashes grouped (John): `guides/distribution/tag-name-clashes/` ("Avoiding Tag Name Clashes"): new `01-overview.md` (`/tag-name-clashes`: the problem + comparison table incl. framework-support row), `tag-transformation.md` (Background removed, slug kept) and `scoped-registries.md` (problem + table removed, slug kept). Inbound links in 7 files repointed.
- Guides > Tooling rethought (John): new `guides/tooling/linting.md` (`/linting`, `@stencil/eslint-plugin` under ESLint or oxlint: wizard, manual ESLint flat config with `projectService`, oxlint `jsPlugins`, presets, README rules link); `style-guide.md` moved to `guides/patterns/` (slug kept), its linter note → Linting. Verified in `~/projects/stencil-scratch/lint` (plugin 1.4.0, ESLint 10.14, oxlint 1.90, TS 6.0.3, v5 core): both report props-must-be-public, no-unused-watch, required-jsdoc; `async-methods` needs `projectService` in ESLint and doesn't fire in oxlint. **Open for John:** plugin crashes on load with **TypeScript 7** (`ts.SyntaxKind` undefined - TS 7's JS API) - plain `npm i typescript` now resolves 7.0.2. Also worth checking Stencil core itself against TS 7.
- New `guides/tooling/editor-support.md` (`/editor-support`): TSX via components.d.ts, VS Code via `docs-vscode`, JetBrains via `@stencil-community/web-types-output-target` (1.0.14, verified on v5 core in `~/projects/stencil-scratch/webtypes`: writes tag, description, attributes + default, slots, events), other tools via CEM. Side note: its `js.events` output nests an `events` array inside an `events` array - possibly a schema quirk; IDE behaviour not tested.
- Editor Support gained "In TypeScript: Apps Using Your Library": consumer apps get element types from the package's `types` field as soon as they import anything from it (side-effect, loader, or `import type {}`) - verified in `~/projects/stencil-scratch/consumer` (TS 6); script-tag apps use `import type {} from 'pkg'` or `compilerOptions.types` (also verified). No tsconfig path to `components.d.ts` needed. Typed Components' consumer bullet links to it.
- `concepts/rendering-strategies.md` kept (John agreed it does real work) but was orphaned: linked from SSR page intro, Prerendering overview, Main output targets overview, and the applications overview; two " - " dashes fixed.
- `reference/build-variables.md` deleted (an older duplicate of Build Conditionals, nothing linked to it); v5-only `vercel.json` redirect `/v5/build-variables` → `/docs/v5/guides/build-conditionals`.
- `reference/support-policy.md` (John): version table gained V5 (Preview, TBD), V4 maintenance ends "6 months after the V5 stable release", V3 → End of Support, "Ext. Support Ends" column and the Enterprise extended-support policy + theoretical example table removed (replaced by one paragraph); Community Maintenance intro updated (OutSystems / community / Ionic).
