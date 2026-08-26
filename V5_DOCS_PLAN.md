# Stencil v5 Docs Plan

> **Living document.** Update statuses as work lands. This spans multiple sessions — re-read it fresh each time rather than trusting a summary of it.

Source material for what's actually changing in v5 lives in the sibling `stenciljs` repo, not here:
- `/Users/John.Jenkins/projects/stenciljs/V5_PLANNING.md` — goals, in-flight work, new features.
- `/Users/John.Jenkins/projects/stenciljs/BREAKING_CHANGES.md` — canonical breaking-change list (the "Stencil v5.0.0" section).

Both are living documents on the engineering side. Re-check them for drift before doing a rewrite pass on anything they touch.

## Vision

Two audiences, one site:
1. **New users** get a seamless line from "never heard of Stencil" to "shipped a component library" — install → `stencil init` wizard → author a component → configure output → test → document → deploy/integrate.
2. **Existing users** can find one specific fact fast, without wading through onboarding prose.

This is not just "update the docs for renamed APIs." The audit below treats structure, writing quality, and example freshness as equally in scope.

---

## 1. Versioning & branch strategy — DONE

Implemented in `site/docusaurus.config.js` (2026-08-25):

```js
lastVersion: 'v4.43',
versions: {
  current: { label: 'v5 (Preview)', path: 'v5', badge: true, banner: 'unreleased' },
  'v4.43': { label: 'v4.43', banner: 'none' },
},
```

- **Default (un-prefixed) site view stays on stable `v4.43`.** Most visitors aren't beta testers; they shouldn't land on preview docs by accident.
- **`docs/` (the "current"/editable slot) is now v5's exclusively**, all the way through beta → RC → GA. It shows as a real, permanent, linkable `/v5/` entry in the version dropdown — not `/next/` — so beta/RC testers can be pointed at it directly. Label is stage-agnostic ("Preview") so it doesn't need edits as the prerelease stage changes.
- **Branch model:** both `stencil-site` and `stenciljs` are checked out on a `v5` branch, diverged from `main`. `main` (stencil-site) is the live site and keeps cutting ordinary `v4.x` doc versions independently — it already reflects the engine repo's `main`, which shipped v4.44.1 on 2026-08-21 while `v5` sat 362 commits ahead. **Intent is to merge this branch into `main` ASAP**, not hold it back until GA, so beta/RC users have real docs to refer to while trying prereleases.
- **Consequence of merging early:** once merged, `docs/` no longer doubles as "next v4.x." Any v4.x-only doc fix needed after the merge must be hand-applied directly inside the frozen `versioned_docs/version-v4.43/` snapshot (or a hand-created `version-v4.44/` folder + matching `versions.json`/`versioned_sidebars` entry) — versioned snapshots are static files, fully editable without `docs:version`. There's no "next" slot for v4 once v5 owns `docs/`.
- **Before merging:** check whether `main`'s already-shipped v4.44.1 needs a corresponding `v4.44` docs version cut first (not yet investigated — flag next time this comes up).
- **At GA:** cut `docusaurus docs:version v5.0`, then flip `lastVersion` to `'v5.0'`. `docs/` reverts to being a genuine "next" slot again (v5.1, v6, ...).

---

## 1.1 Verified: `stencil init` vs `stencil add`, and current CLI state (2026-08-25)

Confirmed by reading `packages/cli/src/{run.ts,task-init.ts,task-add.ts}` on the local `stenciljs` `v5` branch and running the built CLI directly in a scratch directory (build artifacts were already present, current version `5.0.0-alpha.35-dev.1787665438.64571f0` — no fresh build needed for this check):

- **`stencil init` and `stencil add` are two distinct, real CLI tasks**, not one merged entry point — `run.ts` dispatches `'add'` → `taskAdd()` and `'init'` → `taskInit()` separately. Docs should reference both by name, not just `init`: `stencil init` scaffolds a new project; `stencil add` adds capabilities (testing, styling, framework output targets, etc.) to an existing one. (`V5_PLANNING.md` has one stale line claiming "no `stencil add` command needed" that predates this — don't trust that line.)
- **Monorepo detection is real**: `detectWorkspaceRoot()` walks up from the working directory looking for `pnpm-workspace.yaml` or a `package.json` with a `workspaces` array, and both tasks use it to install/scaffold into the right workspace package rather than assuming a single-package repo root.
- **Neither task supports non-interactive/CI mode yet** — both print "Running in CI - non-interactive mode is not yet supported" and exit when `CI` env is set. Worth a callout in docs (can't script `stencil init`/`stencil add` in a CI pipeline today) and worth re-checking before final docs ship in case this lands before GA.
- **Package-manager-prefixed entry point** (`npm init stencil@5`, `pnpm create stencil@5`, `yarn create stencil@5`, `bun create stencil@5`) is the intended primary docs framing, not `npx stencil init` — per `V5_PLANNING.md`'s `create-stencil` shim design, these resolve to the `create-stencil` npm package. **The `@5` (or `@next`/`@alpha`) suffix matters for the whole preview window**: plain `npm create stencil` keeps resolving to the current stable line until `create-stencil` publishes a v5-compatible dist-tag. Docs must show the explicit version suffix throughout beta/RC and only drop it once v5 is GA/`latest`.
- ~~Bug found, not yet reported to engineering: `stencil --help` on the current alpha build still advertises `stencil test --spec --e2e`...~~ **Fixed 2026-08-26** (commit `1ba37c0da`, "chore: update breaking changes and cli --help (#6850)"). Re-ran `--help` to confirm: the stale `stencil test` text is gone, and the output is now accurate and worth treating as the source of truth for `config/cli.md`'s rewrite:

  ```
  Init: Scaffold a new project, or add capabilities to an existing one.
    $ stencil init

  Add: Install and configure an integration (framework wrapper, output target, etc).
    $ stencil add [package]

  Generate: Bootstrap a new component.
    $ stencil generate [name] or stencil g [name]

  Build: Build components for development or production.
    $ stencil build [--dev] [--watch] [--serve] [--prerender] [--debug]
      --dev / --watch / --serve (requires --watch) / --prerender / --docs
      --ssr ............. Build a server-side-rendering bundle
      --config / --maxWorkers / --no-cache / --stats / --log / --ci / --debug

  Serve: Start the dev-server without building or watching.
    $ stencil serve [--root] [--no-open]

  Docs: Generate configured docs output targets.
    $ stencil docs [--docsJson]

  Prerender: Prerender a hydrate app script against the source index.html.
    $ stencil prerender <hydrate-app-path>

  Migrate: Codemod a project for the latest major version breaking changes.
    $ stencil migrate [--dry-run]

  Info / Version / Telemetry: unchanged in shape from v4.
  ```

  Notable, not yet reflected in the plan's earlier `config/cli.md` notes: `--ssr`, `--maxWorkers`, `--no-cache`, and `--ci` are build flags not previously called out; `serve`, `docs`, and `prerender` are now standalone top-level tasks (not just `build` flags) — `config/cli.md`'s rewrite should document all three as their own commands. `stencil init`'s own description now explicitly says it also covers "add capabilities to an existing one," while `stencil add [package]` reads as the more targeted, package-scoped shortcut — don't over-assert the exact division of labor between the two without a live run of both; note the apparent overlap and verify by actually running each before writing the final doc section.

**Method note:** this is the working pattern going forward for CLI/build-behavior claims — read the source, then actually run the built CLI in a scratch directory, rather than trusting planning-doc prose alone (which, per the `stencil add` line above, can itself be stale). Not every fact needs a live run (type-level changes, config renames confirmed by reading the compiler source are usually enough), but anything about *runtime/CLI behavior* specifically should get a quick real check before it goes into a doc.

---

## 2. Proposed information architecture

Four independent audits converged on the same core critique: the current top-level list (`introduction`, `components`, `framework-integration`, `static-site-generation`, `config`, `output-targets`, `documentation-generation`, `guides`, `core`, `testing`, `reference`, plus two orphaned loose files) reads as accretion, not a designed journey. Framework integration (a late-journey "consume it" concern) outranks config and output targets (early/mid-journey "build it" concerns). `core/` vs `config/` is a naming collision only an insider would parse. SSR is split across a whole rival top-level category (`static-site-generation/`) instead of living with its actual output target.

### New top-level structure

| Pos | Category | Purpose |
|---|---|---|
| 1 | `getting-started/` | Install → `stencil init` wizard (new project + add-capabilities modes) → `stencil generate` → first component. Tutorial mode, replaces most of today's `introduction/`. |
| 2 | `components/` | Author a component: decorators, `encapsulation`, styling, JSX, signals, reactive controllers. |
| 3 | `config/` | `stencil.config.ts` reference: CLI flags, dev server, `compat` (renamed from `extras`), plugins. |
| 4 | `output-targets/` | One page per target: `loader-bundle`, `standalone`, `www`, `ssr` (+ nested `ssr/<language>.md` family for `ssr-wasm`), new first-class `collection`/`types`/`global-style`/`assets`, and the `docs-*` targets folded in from today's `documentation-generation/`. |
| 5 | `framework-integration/` | Consuming components from Angular/React/Vue/Ember/vanilla JS — a "consume it" concern, moved later than today's position 3. |
| 6 | `testing/` | `@stencil/vitest` + `@stencil/playwright` only. |
| 7 | `guides/` | How-to catch-all for what doesn't fit the linear journey — needs internal subgroups (see §5). |
| 8 | `concepts/` (new) | Explanation mode: what/why Stencil, design systems, rendering-strategy trade-offs. Absorbs the "why" half of today's FAQ. |
| 9 | `reference/` | Pure fact-lookup only: support policy, versioning policy, CLI/compiler/dev-server embedding API (merged from today's `core/`), `build-variables.md` (finally given a home), telemetry CLI facts. |
| — | Community (manual) | Unchanged. |
| — | Legal (manual) | Privacy policy + telemetry opt-out prose (CLI facts move to `reference/`). |

### Old → new mapping

| Old | New | Note |
|---|---|---|
| `introduction/01-overview.md`, `02-goals-and-objectives.md` | `concepts/` | "What/why" is explanation, not onboarding steps. |
| `introduction/03-getting-started.md` | `getting-started/` | Rebuilt around `stencil init`, not `create-stencil`. |
| `introduction/upgrading-to-stencil-four.md` | `reference/` | Migration reference doesn't belong in "welcome." |
| `components/` | `components/` | Same position-ish, unchanged as a category. |
| `config/` | `config/` | Unchanged, renumbered earlier (3, was 5). |
| `core/` (`cli-api.md`, `compiler-api.md`, `dev-server-api.md`) | `reference/` | Embedder/programmatic API, not what a typical author touches daily. |
| `documentation-generation/` | `output-targets/` | The `docs-*` targets are output targets; stop splitting them into a sibling category. |
| `framework-integration/` | `framework-integration/` | Kept, moved later (5, was 3). |
| `guides/` | `guides/` | Kept, renumbered (7, was 8), gains internal subgroups. |
| `output-targets/` | `output-targets/` | Anchor category; absorbs SSG and docs-generation; gains `ssr/` sub-family. |
| `static-site-generation/` | `output-targets/ssr/` (reference) + `concepts/rendering-strategies.md` (explanation) | SSR/SSG is one output mode, not a rival top-level category. The "which strategy do I pick" trade-off discussion is genuinely explanation-mode and split out. |
| `testing/` | `testing/` | Kept; `stencil-testrunner/` subtree deleted from v5 docs entirely (archived only in the frozen v4.43 snapshot — it documents `--spec`/`--e2e`/`stencil test`, which don't exist in v5). |
| `reference/faq.md` | Split: fact-lookup → `reference/`; "why/what is Stencil" → `concepts/` | Currently one file straddling two Diátaxis modes. |
| `reference/support-policy.md`, `versioning.md` | `reference/` | Stay, rewritten for v5 facts. |
| `build-variables.md` (loose, orphaned — see bug below) | `reference/build-variables.md` | Give it an actual folder + sidebar entry. |
| `telemetry.md` (loose) | Split: policy prose → Legal (as today); CLI command facts → `reference/` | |

**Cross-cutting: `stencil init`/`stencil add` should be the "easy way" callout on many pages, not just `getting-started/`.** Since third-party packages participate in both via a `stencil.wizard` export, most "how do I set up X" questions now have a one-line wizard answer worth surfacing right at the top of the relevant page, before the manual steps: framework output targets (`framework-integration/*`, once `@stencil/react-output-target` etc. ship a wizard), Storybook (`guides/storybook.md`), Signals (once that config flag has a wizard path), testing (`testing/vitest`, `testing/playwright` — already wizard-integrated per `KNOWN_INTEGRATIONS`), and linting, once/if a lint package ships one. Add "the easy way: `stencil add <package>`" callouts as each of these gets rewritten, not as a separate pass.

**Why `ssr-wasm` nests under `output-targets/ssr/` rather than getting its own top-level category:** it's one output target's per-language onboarding family, and this mirrors the already-proven `framework-integration/{angular,react,vue}.md` and `testing/{vitest,playwright}/` pattern — scales to a dozen languages without a second reorg.

---

## 3. Structural bugs to fix regardless of v5

These aren't v5-caused, found incidentally during the audit. **Both fixed in Phase 1 (2026-08-26).**

- ~~`build-variables.md` is currently unreachable.~~ **Fixed**: moved to `reference/build-variables.md` and removed from `docusaurus.config.js`'s `EXCLUDE_TOP_LEVEL_IDS`. Confirmed live at `/docs/v5/build-variables` and appearing under the Reference category in a real build + served-site check.
- ~~`core/_category_.json` and `testing/_category_.json` both declare `position: 9`.~~ **Fixed**: `core/` no longer exists (merged into `reference/`); `testing/` has its own clean position (6) in the new top-level order.
- **Bonus catch, not in the original audit:** `guides/storybook.md` (and all 12 versioned copies, v4.33–v4.43) hardcoded an absolute link to `/docs/next/distribution#loader`. This resolved fine while "current" lived at the implicit `/next/` path, but broke across every single version the moment `docs.versions.current.path` was set to `v5` in §1 — a full production build (`onBrokenLinks: 'throw'`) caught it immediately. Fixed by replacing the absolute link with a relative one (`../output-targets/dist.md#loader`) in all 13 copies, which resolves correctly within each version's own snapshot regardless of what "current" is called.
- **`reference/faq.md` is Diátaxis explanation mode shelved as "reference."** Reference mode is supposed to be dry/no persuasion; the FAQ is full of opinion ("Stencil's superpowers," "the current debate is somewhat unproductive"). That's fine for explanation, wrong shelf — see the split in the mapping table.
- **`guides/hydrate-app.md` and `guides/server-side-rendering.md` duplicate each other** — near-identical `renderToString`/`serializeShadowRoot` examples and prose, with no cross-reference explaining which to read first. Resolve as part of the SSR section rebuild (§2).
- **Node-version conflict inside `stenciljs/V5_PLANNING.md` itself**: one line says "Pure ESM, Node 18+," another says "Node floor: 22 LTS." Not a docs bug, but flag back to engineering before writing any Node-version claims into `reference/support-policy.md`.

---

## 4. File-by-file audit findings

Verdict key: **KEEP** = no v5-blocking change · **LIGHT EDIT** = a few facts/names to fix · **REWRITE** = substantial rework · **REMOVE** · **MERGE→X** · **MOVE→X**

### 4.1 `getting-started/` (was `introduction/`)

| File | Verdict | What needs to change |
|---|---|---|
| `01-overview.md` | LIGHT EDIT | Add a sense that a major version just landed (currently timeless marketing copy). |
| `02-goals-and-objectives.md` | REWRITE | "Wide Browser Support" section claims automatic polyfilling — ES5/all legacy polyfills are removed in v5 (ES2017+ only, no IE11/old Edge). Also a general tone pass (buzzwords: "robust and highly extensible," "amazing tools"). |
| `03-getting-started.md` | REWRITE (highest priority in this category) | Lead with the package-manager-prefixed entry point (`npm init stencil@5` / `pnpm create stencil@5` / `yarn create stencil@5` / `bun create stencil@5` — keep the version suffix through the whole preview window, see §1.1) driving the `stencil init` wizard, and cross-link `stencil add` for adding capabilities to an already-scaffolded project. Example uses `shadow: true` → `encapsulation: { type: 'shadow' }`. References `.esm.js` output → `.js`. Claims `create-stencil` scaffolds Jest/Puppeteer tests → integrated testing is removed; wizard-driven `@stencil/vitest`/`@stencil/playwright` setup instead. Also a Diátaxis violation: page claims to be a tutorial but interleaves reference-style decorator-option lists mid-lesson — split rather than interleave. |
| `upgrading-to-stencil-four.md` | KEEP (as historical record) | Needs a **new sibling**, `upgrading-to-stencil-five.md`, mirroring the (much larger) v5.0.0 section of `BREAKING_CHANGES.md`. This is the single largest net-new writing task in the whole plan — budget real time for it. |

Also missing entirely, independent of staleness: any mention of `stencil generate` (the everyday "add a component" command) — not referenced anywhere in the current `introduction/`+`guides/` audit.

### 4.2 `components/`

Cross-cutting finding: the biggest v5 breaking change in this category (`encapsulation` replacing `shadow`/`scoped`/`formAssociated`) is stale in **five separate files**, not one — a rewrite pass needs to sweep them together or a reader gets a coherent story in one file and a contradiction two clicks later.

| File | Verdict | What needs to change |
|---|---|---|
| `api.md` | LIGHT EDIT | Lifecycle table still shows `componentShouldUpdate(newValue, oldValue, propName)` → batched `(changes)`. Links to `output-targets/dist.md`/`custom-elements.md` will break once those rename. |
| `attach-internals.md` | LIGHT EDIT | Add: `@AttachInternals()` now auto-sets `formAssociated: true`; `@AttachInternals({ formAssociated: false })` opts out. Note interaction with closed shadow roots. |
| `component-lifecycle.md` | REWRITE (one section) | `componentShouldUpdate()` section's entire worked example (two calls per render, one per prop) describes the exact bug v5 fixes — rewrite around the batched `changes` map, one call per render. |
| `component.md` | **REWRITE — highest priority in this category** | `formAssociated`, `scoped`, `shadow` (incl. object-literal form) sections are all removed properties. Replace with one `encapsulation` section covering the full union type, including genuinely new capabilities with zero existing docs: `mode: 'closed'`, per-component `patches`, `clonable`, `serializable`. |
| `events.md` | KEEP | No v5-breaking changes found. |
| `form-associated.md` | REWRITE | Every code example (5 occurrences) uses `formAssociated: true` in `@Component()` — remove the property, rely on `@AttachInternals()` alone. Intro sentence's whole premise ("sets the new `formAssociated` option...") no longer holds. |
| `functional-components.md` | LIGHT EDIT | `AddClass` example returns `VNode[]` via `utils.map()` — `FunctionalComponent`'s return type narrowed to `VNode \| null` in v5; wrap in a fragment (`<>{utils.map(...)}</>`). |
| `host-element.md` | LIGHT EDIT | One `shadow: true` example → `encapsulation: { type: 'shadow' }`. |
| `methods.md` | KEEP | No `@Method()` API changes. |
| `properties.md` | LIGHT EDIT + consider trimming | No API changes, but ~1020 lines of near-duplicate Boolean/Number/String/Object/Array sections reading as tutorial narration wrapped around reference tables (a Diátaxis mode-mixing violation per the style standard) — good candidate to condense by half. Add a forward-pointer to signals once that's written. |
| `reactive-data.md` | KEEP | Already documents the *correct* v5 `@Watch` behavior (doesn't fire before first render) — v4's runtime had a bug relative to its own docs; v5 fixes it. Optionally note this explicitly. |
| `serialization-deserialization.md` | KEEP | No stale APIs. |
| `state.md` | LIGHT EDIT | Natural home for a "Signals" pointer once written (see §6) — currently absent. |
| `styling.md` | REWRITE | Both `shadow: true` and `scoped: true` examples need `encapsulation: {...}`. Closing line references `extras.addGlobalStyleToComponents`, which is **removed outright**, replaced by `inject` on the new `global-style` output target — needs a real rewrite, not a link fix. |
| `templating-and-jsx.md` | KEEP | `JSX.Element`/`Host`/`Fragment` type changes are type-only; low-priority footnote candidate only. |

**Structural notes for this category:**
- No visible tier between "fundamentals" (component, properties, state, events, methods, styling, JSX, host-element) and "advanced/niche" (attach-internals, form-associated, serialization-deserialization, functional-components). All 15 files sit at the same level with no signal. `api.md` is well-positioned to become the landing/index page but nothing currently points a newcomer there first.
- `component.md` and `styling.md` duplicate shadow-DOM explanation. Recommend: `component.md` owns the `encapsulation` *option reference*, `styling.md` owns the *concept/consequences*, cross-linked.
- New content needed with **zero existing home**: **Signals** (`compat.signalBacking`, `@stencil/core/signals`: `signal`/`computed`/`effect`/`batch`/`untracked`/`@Effect()`) — recommend a new `components/signals.md` or `components/reactivity.md`. **Reactive controllers** (`ReactiveController`/`ReactiveControllerHost` via `Mixin()`) — extend the existing `api.md` `Mixin()` section or a new `components/reactive-controllers.md`.

### 4.3 `config/` and `core/` (→ split into `config/` + `reference/`)

| File | Verdict | What needs to change |
|---|---|---|
| `config/01-overview.md` | **REWRITE — hit hardest in this category** | Remove `buildDist`/`buildEs5` sections entirely (both removed). `rollupConfig`→`rolldownConfig`. `validatePrimaryPackageOutputTarget`→`validatePackageJson` (auto-detection replaces the `isPrimaryPackageOutputTarget` flag it depended on). `hashFileNames`/`hashedFileNameLength` moved off top-level config onto `loader-bundle`/`www`. `extras`→`compat`. `## testing` section points at the now-deleted Stencil Test Runner. |
| `config/cli.md` | REWRITE | Remove `--es5`, `--prod` flag docs (removed). Remove the entire `stencil test`/`--spec`/`--e2e` section (task no longer exists) — replace with a pointer to `@stencil/vitest`/`@stencil/playwright`. **Add `stencil migrate --dry-run`**, **`stencil init`**, and **`stencil add [package]`** as their own sections (see §1.1's verified `--help` output — this is now the source of truth for this file's rewrite, not the pre-fix help text). Document `serve`, `docs`, and `prerender` as standalone tasks, not just `build` flags. Add previously-uncalled-out build flags: `--ssr`, `--maxWorkers`, `--no-cache`, `--ci`. Fix `--no-open` framing (no longer needed since `openBrowser` now defaults `false`). |
| `config/dev-server.md` | LIGHT EDIT | `openBrowser` default flips `true`→`false`; flip the description too. |
| `config/docs.md` | KEEP | Unaffected; could eventually cross-link `docs-agent-skill`. |
| `config/extras.md` | **REWRITE — second-highest priority in this whole audit** | Title/section `extras`→`compat`. `experimentalSlotFixes`+4 individual flags consolidated into one `lightDomPatches` option. `experimentalImportInjection`/`experimentalScopedSlotChanges` fully removed (not just deprecated). `enableImportInjection` default flips `false`→`true` — rewrite from opt-in to opt-out framing. `scriptDataOpts` fully removed (doc currently only warns it's deprecated). `addGlobalStyleToComponents` removed, replaced by `inject` on `global-style` output target. **Add** `compat.suppressPublicNameWarnings`/`suppressEventNameWarnings` (undocumented today, not just renamed). |
| `config/plugins.md` | LIGHT EDIT | `rollupPlugins`→`rolldownPlugins`/Rolldown's plugin model; verify whether Rolldown needs the same node-polyfills workaround Rollup did. |
| `core/cli-api.md` | LIGHT EDIT | `@stencil/core/cli`→`@stencil/cli`. |
| `core/compiler-api.md` | REWRITE (partial) | Node example uses `require('@stencil/core/compiler')` — Stencil's own package is pure ESM now, `require()` fails regardless of Node version; convert to `import`. Add a note on the narrowed type-export surface (only 6 named types now, not wildcard) and point to `HTMLStencilElement` from `@stencil/core/runtime` for host-element typing. Independent bug: this file calls the createCompiler import `createNodeSys` while `cli-api.md` calls the equivalent `createNodeSystem()` — resolve the naming inconsistency while rewriting. |
| `core/dev-server-api.md` | LIGHT EDIT / consider merging into `compiler-api.md` | `@stencil/core/dev-server`→`@stencil/dev-server`. At 16 lines documenting one function, it's disproportionately thin as its own nav entry. |

**Structural notes:** `config/cli.md` ("Stencil CLI," end-user flags) and `core/cli-api.md` ("Stencil Core CLI API," programmatic embedding API) share "CLI" in both title and sidebar label with no way to tell them apart by name — rename the embedding one clearly (e.g. "CLI Embedding API") when it moves into `reference/`.

### 4.4 `output-targets/` (absorbs `static-site-generation/` + `documentation-generation/`)

| File | Verdict | What needs to change |
|---|---|---|
| `output-targets/01-overview.md` | REWRITE | Only lists `dist`/`www`/`dist-custom-elements` — none of v5's actual target set. Entire "Primary Package Output Target Validation" section documents the removed `isPrimaryPackageOutputTarget`/`validatePrimaryPackageOutputTarget`. |
| `output-targets/dist.md` → rename `loader-bundle.md` | REWRITE | Every heading needs the rename. `collectionDir` config **removed entirely** (use new first-class `collection` target). `isPrimaryPackageOutputTarget` removed. `esmLoaderPath`→`loaderPath` **with a changed relative-path base** (now relative to `dist/loader-bundle`, not `dist` — `loaderPath: '../'` reproduces old behavior; this is semantic, not cosmetic). Loader code sample calls `applyPolyfills()` — actively wrong now (ES5 removed). CJS no longer default (opt-in via `cjs: true`). File extensions modernized (`.esm.js`→`.js`, permanent forwarding shim for old CDN URLs). |
| `output-targets/custom-elements.md` → rename `standalone.md` | REWRITE | Rename target throughout. `externalRuntime` default **flips `true`→`false`** — whole explanation needs reversing. `generateTypeDeclarations` option removed (types always generated via new `types` target). `isPrimaryPackageOutputTarget` removed. |
| `output-targets/www.md` | LIGHT EDIT | `serviceWorker` default flips from Workbox-auto-generated to `null` (opt-in via `serviceWorker: true`) — the doc currently states automatic generation as fact. Add new `hashFileNames`/`hashedFileNameLength` rows (moved here from top-level config). Remove stale `es5`/`esm` build mention in `buildDir`. |
| `output-targets/copy-tasks.md` | REWRITE | Target-name renames throughout (`dist`→`loader-bundle` etc.); verify whether generic `copy` tasks are distinct from the new `assets`/`global-style` mechanism or should cross-link it. |
| **New:** `output-targets/collection.md`, `types.md` | net-new | Previously implicit sub-outputs of `dist`, now first-class configurable targets with no doc home at all. |
| **New:** `output-targets/global-style.md`, `assets.md` | net-new | `copyAssets` removed from `loader-bundle`/`www` in favor of these; unified `dist/assets/` location. No current doc home. |
| **New:** `output-targets/ssr.md` | net-new (see below) | The `ssr` output target (formerly `dist-hydrate-script`) currently has **no dedicated reference page anywhere in the site** — `static-site-generation/server-side-rendering-ssr.md` is a one-paragraph stub pointing at a guide instead. |
| `documentation-generation/01-overview.md` | REWRITE | Missing `docs-agent-skill` entirely (net-new v5 target). Missing the workflow-changing fact that **no docs output generates unless explicitly declared** (previously `docs-readme` was implicitly added to every non-dev build). |
| `documentation-generation/docs-readme.md` | **REWRITE — biggest correctness gap in this category** | Currently documents the old implicit-injection behavior as if current. v5: nothing generates unless `{ type: 'docs-readme' }` is explicit. Missing two genuinely new, undocumented v5 features: `customColumns` (arbitrary-JSDoc-tag-driven extra table columns) and multi-component-per-directory `readme.md` generation. |
| `documentation-generation/docs-json.md` | LIGHT EDIT | Missing the new shared `usage` field (populated from `<srcDir>/usage/*.md`, feeds `docs-agent-skill`). |
| `documentation-generation/docs-stats.md` | REWRITE | Sample JSON is deeply stale: lists `dist-collection`/`dist-lazy`/`dist-types` (none are real v5 names), `"buildEs5": true` (removed option), `"es5"`/`"system"` format arrays (removed formats), old `.cjs.js` filename convention. Needs regenerating against real v5 output. |
| `documentation-generation/docs-custom-elements-manifest.md`, `docs-custom.md`, `docs-vscode.md` | KEEP | No v5-breaking references found. |
| **New:** `output-targets/docs-agent-skill.md` | net-new | Brand-new v5 target (emits an Agent Skill so AI coding agents can consume a component library directly) — zero existing documentation. |
| `static-site-generation/01-overview.md` | LIGHT EDIT, then MERGE→ split (see §2 mapping) | Solid explanation prose; needs to name the `ssr` output target explicitly instead of the vague "hydrate app" phrasing. |
| `static-site-generation/basics.md`, `deployment.md` | KEEP | No stale references found. |
| `static-site-generation/meta.md`, `prerender-config.md` | LIGHT EDIT | `afterHydrate`/`beforeHydrate`→`afterSsr`/`beforeSsr` (old names remain as deprecated aliases). |
| `static-site-generation/server-side-rendering-ssr.md` | REWRITE, folds into new `output-targets/ssr.md` | Currently one sentence pointing at a guide. Needs full treatment of the renamed target, no-more-`package.json`, `hydrateDocument()`→`ssrDocument()`, and — notably — `streamToString()`'s new **web-standard `ReadableStream<string>`** return type, which makes this genuinely usable on Cloudflare Workers/Deno/Bun/Node 22+, not just "any Node.js server" as currently framed. |

**`framework-integration/` files** (angular, react, vue all REWRITE; javascript LIGHT EDIT) share the exact same failure mode: every wrapper config sample, FAQ answer, and `esmLoaderPath` reference uses the pre-rename target names (`dist`, `dist-custom-elements`, `dist-hydrate-script`). `react.md` additionally needs its Next.js hydrate-module story rewritten now that `ssr` no longer generates its own `package.json`. `vue.md`'s `applyPolyfills()` call is now actively wrong code. `angular.md` mentions Jest as "Stencil's unit testing solution," which is gone. See §2 mapping for the category's new position (5, moved later).

**`framework-integration/ember.md` — REMOVE (decided).** The audit already flagged it as self-admittedly broken ("`ember-cli-stencil` hasn't kept up with ember's evolution and will not work in newer ember apps"); dropping it for v5 rather than maintaining docs for a known-non-functional integration.

**New: `output-targets/types-output-target.md`.** Covers `@stencil/types-output-target` (verified against its published README, 2026-08-25, current version `1.0.0`) — generates framework-native TypeScript type definitions (not full component wrappers) for React (v19+, which natively supports custom elements), Vue 3+, Solid, Svelte, and Preact:

```ts
import { typesOutputTarget } from '@stencil/types-output-target';
export const config: Config = {
  outputTargets: [
    typesOutputTarget({
      reactTypesPath: 'dist/types',
      vueTypesPath: 'dist/types',
      solidTypesPath: 'dist/types',
      svelteTypesPath: 'dist/types',
      preactTypesPath: 'dist/types',
    }),
  ],
};
```

Consumers import the generated types directly (e.g. `import 'your-component-library/react-types'`) and use the custom elements as-is — no wrapper components. **Distinguish this clearly from `@stencil/react-output-target`/`@stencil/vue-output-target`** (full wrapper-component generation, already covered in `framework-integration/react.md`/`vue.md`): types-output-target is the lighter-weight option for frameworks with native/good custom-element support, wrappers are for frameworks that need more ergonomic proxying. Cross-link both directions from `framework-integration/01-overview.md`'s new framework-agnostic anchor content (§4.4).

### 4.5 `testing/`

| File | Verdict | What needs to change |
|---|---|---|
| `01-overview.md` | REWRITE | State plainly there are two tools now (vitest, playwright); remove the migration-from-test-runner section. |
| `playwright/01-overview.md`, `02-e2e-testing.md`, `03-api.md` | LIGHT EDIT | Drop the "experimental package" framing (confirm status for v5 launch). `02-e2e-testing.md`'s `<script>` example uses `nomodule`/`.esm.js` — both gone (ES5/`nomodule` removed, extension modernized). `03-api.md`'s example CLI command uses `--no-open` (no-op now) and implies `--prod` exists (removed). Remove the duplicate test-runner-migration section. |
| `vitest/01-overview.md`, `03-writing-tests.md`, `04-api.md`, `05-mocking.md`, `06-cli.md` | KEEP / LIGHT EDIT | Clean reference content overall; verify `stencil-test` binary name is final. |
| `vitest/02-configuration.md` | LIGHT EDIT | References `dist-custom-elements` (→`standalone`) and `buildDist: true` (removed option) in the same paragraph. |
| `vitest/07-migration.md` | KEEP short-term | Necessary v4→v5 bridge doc; plan a sunset once migration traffic drops. |
| `stencil-testrunner/` (all 7 files) | **REMOVE from v5 docs entirely** | Documents `--spec`/`--e2e`/`stencil test`/`newSpecPage`/`newE2EPage`/`ScreenshotConnector` — none of it exists in v5. Only the overview page currently carries a deprecation banner; the six files underneath teach the deleted API in full present tense with zero warning. Keep only inside the frozen `v4.43` versioned snapshot. |

### 4.6 `guides/`

| File | Verdict | What needs to change |
|---|---|---|
| `assets.md` | REWRITE | Built around `dist`/`dist-custom-elements`/`copyAssets`, all renamed or removed — `copyAssets` is gone, replaced by the new first-class `assets` output target writing to unified `dist/assets/`. |
| `build-conditionals.md` | LIGHT EDIT | `Build.isDev` unaffected; thin but fine. |
| `csp-nonce.md` | REWRITE | Output-target subsections keyed to old names; SSR nonce discussion needs to point at renamed `ssr` target. |
| `design-systems.md` | REWRITE | Heaviest marketing-filler offender in the audit ("robust and highly extensible," icons that "pop"). v5 explicitly repositions Stencil as "90% design systems, not apps" (zero-config DX work, `loader-bundle`-first defaults) — this page's premise becomes *more* central, so tighten and give it real substance rather than cutting it. |
| `extends.md` | **REWRITE — actively incorrect for v5, high priority** | Documents a component directly `extends ReactiveControllerHost` — per `V5_PLANNING.md`, this exact pattern doesn't work in `standalone` builds (the class-extension AST walk can't rewrite prebuilt `node_modules` code). The real v5 pattern is `class MyComponent extends Mixin(ReactiveControllerHost)`. This file will actively mislead readers into broken code if left as-is. |
| `forms.md` | REWRITE | Example still sets `formAssociated: true` in `@Component()` — remove it, `@AttachInternals()` alone now implies it. |
| `hydrate-app.md` | REWRITE, merge target for `output-targets/ssr.md` | `dist-hydrate-script`→`ssr`, `hydrateDocument`→`ssrDocument`, `streamToString()` type change, `beforeHydrate`/`afterHydrate`→`beforeSsr`/`afterSsr`. Duplicates `server-side-rendering.md` — resolve per §2/§3. |
| `module-bundling.md` | REWRITE — entire premise stale | Built end-to-end on Rollup (`rollupPlugins.before`/`.after`, specific Rollup plugin names). Rolldown replaces Rollup in v5; verify whether the CJS-interop workarounds this guide exists for are even still needed under Rolldown's different architecture. |
| `publishing.md` | REWRITE | `dist`/`dist-custom-elements` renames throughout; `package.json` example paths/extensions are wrong under the new defaults; `generateTypeDeclarations` flag removed; `externalRuntime` default inverted. |
| `server-side-rendering.md` | REWRITE, split per §2 | Best-argued file in the guides audit (real decision-tree POV) — keep the strategy discussion, move it to `concepts/rendering-strategies.md`, keep the how-to steps here updated for `ssr`/no-more-`package.json`. Natural spot to introduce `ssr-wasm` as a third strategy — currently entirely absent. |
| `service-workers.md` | REWRITE | States automatic service-worker generation as fact — v5 flips `serviceWorker` to `null`-by-default (opt-in). |
| `store.md` | LIGHT EDIT | Add a cross-reference/decision note vs. the new Signals feature — both solve "shared reactive state" with no signposting between them today. |
| `storybook.md` | REWRITE (once the v5 plugin ships) | v5's `@stencil/storybook-plugin` v1 is a clean break: CEM-based docs pipeline replaces the current `docs-json`/`setCustomElementsManifest` flow this file documents. |
| `style-guide.md` | REWRITE | Centerpiece "high level example" shows the old 3-arg `componentShouldUpdate` signature. |
| `tag-transformation.md` | REWRITE | Premise ("scoped custom element registries have limited adoption, so use tag transformation instead") is partly superseded — v5 ships first-class SCER support. Reposition as two options with a trade-off, not tag-transformation-as-only-option. Also has the standard output-target renames. |
| `typed-components.md` | LIGHT EDIT | Could mention the v5 JSX type change (`h.JSX.Element` now resolves to `VNode` instead of silently falling back to `any`) — directly relevant to this page's audience. |
| `vs-code-debugging.md` | LIGHT EDIT | Hardcoded `dist/hydrate/index.js` debug path → new `ssr` target's default `dist/ssr/`. |
| `workers.md` | KEEP | No breaking changes touch the Worker API; one of the strongest files in the audit. |

**Internal subgrouping for `guides/`** (currently one flat, unordered list of 17 files at equal visual weight — no `_category_.json` subgroups exist today): group into **Core patterns** (forms, extends, store, typed-components) · **Shipping & distribution** (assets, publishing, module-bundling, csp-nonce, tag-transformation) · **Tooling** (vs-code-debugging, storybook, style-guide) · **PWA/performance** (service-workers, workers, build-conditionals) · **Strategy** (design-systems). (Rendering strategy content moves out to `output-targets/ssr/` + `concepts/`, per §2.)

### 4.7 `reference/` and `concepts/` (from `reference/`)

| File | Verdict | What needs to change |
|---|---|---|
| `reference/faq.md` | Split — see §2/§3 | Fact-lookup answers stay in `reference/`; "what/why is Stencil" answers move to `concepts/`. One concrete v5 fact-fix regardless: "Does Stencil come with a testing framework?" currently answers "yes... rich set of APIs for unit and e2e tests" — must become a pointer to `@stencil/vitest`/`@stencil/playwright`. |
| `reference/support-policy.md` | **REWRITE** | No v5 row in the version/browser/Node/TypeScript tables. Entire "Testing Libraries" section is Jest/Puppeteer compatibility tables — wholesale dead, replace with vitest/playwright tables. Browser table needs an Edge-18-and-below-dropped row (ES2017+ floor). Node table needs the v5 floor confirmed against the conflicting `V5_PLANNING.md` statements (flagged in §3). |
| `reference/versioning.md` | LIGHT EDIT | Evergreen SemVer policy content; re-verify release-cadence claims against the new Changesets-based release process V5_PLANNING describes. |
| `build-variables.md` | MOVE→`reference/` | See bug in §3. Content itself is fine, just needs a real home. |
| `telemetry.md` | Split | Policy/opt-out prose stays in Legal category; CLI command facts (`stencil telemetry on/off/status`) move to `reference/`. Sample telemetry JSON payload uses dead target names (`dist-lazy`) and a `"rollup"` version field — update to new target names and a `"rolldown"` field once confirmed. |

---

## 5. Net-new content (zero existing docs today)

Ranked roughly by how load-bearing they are for the stated vision:

1. **`getting-started/03-getting-started.md` rebuild** around the `stencil init` wizard (new-project + add-capabilities modes, third-party `stencil.wizard` plugin discovery for `@stencil/vitest`/`@stencil/playwright`/`@stencil/sass`/etc.).
2. **`upgrading-to-stencil-five.md`** — the biggest single writing task, mirroring the full v5.0.0 `BREAKING_CHANGES.md` section.
3. **`output-targets/ssr/` family** — `ssr.md` overview (reference), then one how-to page per `ssr-wasm` target language (PHP, Java, Go, Rust, Ruby, ...). Start with the overview + 1–2 languages; this is explicitly meant to grow over many future sessions per the vision.
4. **`components/signals.md`** (or `reactivity.md`) — opt-in signal-backed reactivity, `@stencil/core/signals` API surface.
5. **`components/reactive-controllers.md`** (or a section in `api.md`) — `ReactiveController`/`ReactiveControllerHost` via `Mixin()`.
6. **`output-targets/docs-agent-skill.md`** — the new Agent Skill doc-generation target.
7. **`output-targets/{collection,types,global-style,assets}.md`** — newly first-class targets with no current doc home.
7a. **`output-targets/types-output-target.md`** — `@stencil/types-output-target` (React/Vue/Solid/Svelte/Preact type generation), see §4.4 for verified config API. Note: this is a separate npm package from `@stencil/core`, not a built-in output target — confirm exact relationship/bundling story before writing final docs (is it always installed alongside core, or opt-in devDependency like today? README says explicit devDependency install, verify this hasn't changed for v5).
8. **`config/cli.md` additions** — `stencil migrate --dry-run` (referenced by nearly every breaking change, documented nowhere) and `stencil generate` (never documented anywhere in the current site).
9. **`concepts/rendering-strategies.md`** — the SPA/SSR/SSG/SSR-wasm decision-tree explanation, split out of `guides/server-side-rendering.md`.

---

## 6. Live/embedded code examples

Researched 2026-08-25 (WebSearch), not yet implemented:

- **Inline component-authoring examples** (the common case — small, editable, in-page): use [`playground-elements`](https://github.com/google/playground-elements) (Google/Lit team). Serverless — runs in a sandboxed iframe against unpkg, no backend, framework-agnostic, built specifically for "embed editable code examples in your documentation." Docusaurus's own `@docusaurus/theme-live-codeblock` is react-live-based and has documented, unresolved problems with custom elements/web components — not a good fit for a site whose whole subject is web components.
- **"Open a full working project" CTAs** (e.g., after the `stencil init` walkthrough, or a complete framework-integration recipe): [StackBlitz SDK embeds](https://developer.stackblitz.com/platform/api/javascript-sdk) — real Node WebContainer, real `npm install`/build. Heavier, but right for "fork and run this," not for a dozen small inline snippets.
- **`ssr-wasm` polyglot examples (PHP/Java/Go/Rust/...): do not attempt live-in-browser execution.** Neither tool above can run non-Node runtimes (StackBlitz WebContainers are Node-only; playground-elements runs JS/HTML/CSS in an iframe). Plan for verified, tested static code samples per language plus a linked minimal starter repo — that's the honest, deliverable version of "live examples" for this family.

---

## 7. Open items needing a decision or follow-up

- [ ] Confirm whether `main`'s already-shipped v4.44.1 needs a `v4.44` docs version cut before merging the `v5` branch in.
- [ ] Resolve the Node-floor conflict in `stenciljs/V5_PLANNING.md` ("Node 18+" vs. "Node floor: 22 LTS") before writing it into `reference/support-policy.md`.
- [ ] Confirm generic `copy` output-target tasks (`guides/assets.md`/`output-targets/copy-tasks.md`) are a distinct mechanism from the new `assets`/`global-style` targets, or should be merged/cross-linked.
- [ ] Confirm final status of `@stencil/playwright` ("experimental" framing in current docs) for the v5 launch.
- [ ] Confirm the `stencil-test` CLI binary name referenced throughout `testing/vitest/` is final.
- [ ] Decide the sunset point for `testing/vitest/07-migration.md` (the v4→v5 bridge doc).
- [ ] **Report to engineering:** `stencil --help`'s static text still advertises `stencil test --spec --e2e` (Jest/Puppeteer) even though the task is fully removed from `run.ts`'s dispatch (`stencil test` now errors "Invalid stencil command") — `task-help.ts` wasn't updated. Don't copy current `--help` output into docs; re-check once fixed.
- [ ] Re-check whether `stencil init`/`stencil add` have gained non-interactive/CI support before finalizing any CI-scripted setup docs (not supported as of `5.0.0-alpha.35-dev.1787665438.64571f0`, checked 2026-08-25).
- [ ] Confirm when/whether `create-stencil` publishes a `@5`/`@next`/`@alpha` dist-tag on npm — getting-started docs need the explicit version suffix (`npm init stencil@5`) until then, see §1.1.

---

## 8. Suggested phasing

Rough, not a hard commitment — adjust as sessions progress.

- **Phase 0 — Infra.** Versioning config (done, §1). Branch-merge decision items (§7).
- **Phase 1 — IA restructure. DONE (2026-08-26).** Moved/renamed files and folders per §2's mapping table (`introduction/`→`getting-started/`+`concepts/`+part of `reference/`; `core/`→`reference/`; `documentation-generation/`+`static-site-generation/`→nested under `output-targets/` as `documentation-generation/`+`ssr/`; `build-variables.md`→`reference/`), removed `framework-integration/ember.md` and `testing/stencil-testrunner/` entirely, fixed every cross-link the moves touched, fixed both §3 structural bugs, and fixed a bonus broken-link bug the restructure itself surfaced. Verified with a full production build (`onBrokenLinks`/`onBrokenAnchors: 'throw'`) and a served-site check of the rendered sidebar order + version dropdown. Committed as `a2a87d88`.
  - **Not done in Phase 1, deliberately deferred to Phase 2:** renaming `output-targets/dist.md`→`loader-bundle.md` and `custom-elements.md`→`standalone.md` (tightly coupled to their content rewrite, doing the rename alone would leave a misleadingly-named file full of stale `dist` prose); `guides/` internal subgrouping (§4.6); the `reference/faq.md` mode split; merging `output-targets/ssr/server-side-rendering-ssr.md` with `guides/hydrate-app.md`/`guides/server-side-rendering.md`; fine-grained sidebar `position` ordering within `output-targets/` (the two new nested categories currently sort after the flat files at placeholder positions 50/51 — revisit once the per-target files existing there get their Phase 2 rewrite/rename).
- **Phase 2 — Tier-1 rewrites. IN PROGRESS.** The files everyone hits early or that are actively wrong.
  - **Done (2026-08-26):** `getting-started/01-getting-started.md` rewritten around `stencil init`/`npm create stencil@5`/`stencil add`, grounded in the real `component-starter` template source (verified via `stenciljs` `packages/templates/templates/project/component-starter/` — confirmed `outputTargets: [{ type: 'loader-bundle' }, { type: 'types' }]`, `encapsulation: { type: 'shadow' }`, automatic JSX runtime with no `h` import, no test scaffolding by default). The full `encapsulation` sweep: `components/component.md` (new `### encapsulation` section replacing `formAssociated`/`scoped`/`shadow`), `styling.md`, `host-element.md`, `form-associated.md` (all `formAssociated: true` examples fixed to use `@AttachInternals()` alone), `attach-internals.md` (added the auto-`formAssociated` + closed-shadow-root notes), plus the same mechanical `shadow: true`/`scoped: true` fix swept into `properties.md`, `guides/forms.md`, `guides/tag-transformation.md`, and three files under `output-targets/documentation-generation/`. Also rewrote `component-lifecycle.md`'s `componentShouldUpdate()` section for the batched `changes` signature and fixed the same signature in `api.md`'s lifecycle list, and fixed `functional-components.md`'s `AddClass` example for the narrowed `FunctionalComponent` return type. Verified with a full production build after each logical chunk.
  - **Deliberately left for the same file's example in `guides/hydrate-app.md` and `framework-integration/react.md`:** both still say "shadow: true"/"scoped: true component" in prose describing SSR behavior — left alone because both files need a full rewrite anyway (SSR output-target rename, React output-target rename) and fixing this one phrase in isolation would leave the rest of the file's stale terminology untouched.
  - **Done (2026-08-26):** `config/extras.md`→`compat.md` renamed and rewritten against the real `ConfigCompat` interface (verified via `stenciljs/packages/core/src/declarations/stencil-public-compiler.ts`, not just `BREAKING_CHANGES.md` prose — which turned out to have the wrong `lightDomPatches` sub-field names: the real fields are `childNodes`/`cloneNode`/`domMutations`/`textContent`, not `slotChildNodes`/`slotCloneNode`/`slotDomMutations`/`slotTextContent`. Worth reporting upstream, similar to the `stencil --help` catch in §1.1). Also discovered and documented that `tagNameTransform` isn't renamed into `compat` at all — it's removed outright; tag transformation is unconditionally available at runtime now (confirmed no config-flag check in `add-tag-transform.ts`). Added the two genuinely undocumented-before fields (`suppressPublicNameWarnings`/`suppressEventNameWarnings`, `initializeNextTick`). Fixed the two inbound links (`config/01-overview.md`, `framework-integration/vue.md`) and `guides/tag-transformation.md`'s `extras.additionalTagTransformers` references.
  - **Done (2026-08-26):** `output-targets/dist.md`→content rewritten in place as the `loader-bundle` reference (filename kept for URL/slug stability — `slug: /distribution` unchanged), `output-targets/custom-elements.md`→rewritten in place as `standalone` (slug `/custom-elements` unchanged). Both grounded in the real `OutputTargetLoaderBundle`/`OutputTargetStandalone`/`OutputTargetCollection`/`OutputTargetTypes` interfaces (verified via `stenciljs/packages/core/src/declarations/stencil-public-compiler.ts`), which caught two more `BREAKING_CHANGES.md`-vs-reality gaps beyond the `lightDomPatches` one from the `compat` rewrite: (1) `validatePackageJson` isn't a real config option at all — `BREAKING_CHANGES.md` says `validatePrimaryPackageOutputTarget` was "renamed" to it, but package.json validation in v5 is fully automatic with no flag, opt-in or opt-out, anywhere in the source; (2) `standalone` gains a new `autoLoader` option (MutationObserver-based auto-registration, matching `V5_PLANNING.md`'s "`www` can now use standalone loader" note) that wasn't mentioned in the breaking-changes doc at all. Also verified `rolldownConfig`'s real shape directly from source before writing `config/01-overview.md`'s rewrite — it's flatter than the old `rollupConfig` (no more `inputOptions`/`outputOptions` nesting), and `rolldownPlugins.before`/`.after` keeps the old `rollupPlugins` shape exactly, just renamed.
    - Rewrote `output-targets/01-overview.md` (target list + the package.json validation section) and `config/plugins.md` (Rollup→Rolldown) in full, and fixed every downstream cross-reference this chunk touched: `output-targets/copy-tasks.md`, `guides/{csp-nonce,tag-transformation,assets,publishing}.md`, `testing/vitest/02-configuration.md`, `config/01-overview.md`, `components/{form-associated,api,styling}.md`, `reference/upgrading-to-stencil-four.md` (a historical v3→v4 doc — left its historical claims alone, just repointed the now-dead anchor it referenced).
    - **Left deliberately deferred:** `framework-integration/{angular,react,vue}.md` still say `dist`/`dist-custom-elements`/`dist-hydrate-script` throughout — each needs its own full rewrite anyway (per §4.4), so these weren't patched piecemeal. `guides/module-bundling.md` similarly untouched (full Rollup→Rolldown premise rewrite, separate task). The `ssr` output target itself (merging `output-targets/ssr/server-side-rendering-ssr.md` with `guides/hydrate-app.md`/`server-side-rendering.md`) is not done — `guides/hydrate-app.md`'s three `shadow: true` prose mentions and `framework-integration/react.md`'s `scoped: true` mention are still stale, intentionally, pending that merge.
  - **Not yet done:** the `ssr` output target rewrite/merge; `output-targets/{collection,types,global-style,assets,docs-agent-skill}.md` (net-new, §5); `framework-integration/*` rewrites; `guides/module-bundling.md`.
- **Phase 3 — Net-new content.** §5's list, roughly in the ranked order given there.
- **Phase 4 — Remaining rewrites & guides cleanup.** Everything else in §4, plus the `guides/` subgrouping and the hydrate-app/server-side-rendering merge.
- **Phase 5 — Polish.** `upgrading-to-stencil-five.md`, live-code-embed implementation (§6), final pass against `tech-writing.md`.

*Last updated: 2026-08-25.*
