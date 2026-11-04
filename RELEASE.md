# Release Guide

## Automated Deployments

The Stencil documentation site is automatically deployed to Vercel when a pull request is merged into the `main` branch.
Changes to the doc site are therefore designed to automatically happen - with a few exceptions.
If you have merged code to `main` and it has not deployed to Vercel, please see the Vercel dashboard for additional debugging.

## Creating a New Version Section

This section describes how to generate a new section of the docs that coincides with releasing a new major/minor version of Stencil.

The Stencil team uses [Docusaurus' Versioning](https://docusaurus.io/docs/versioning) to create new documentation for new major and minor versions of Stencil core.
The creation of a new version requires some manual work.
Once a new version has been created, a pull request containing the new version can be created/merged.
Once that pull request is merged, the new version will be automatically deployed to Vercel.

Docusaurus creates a new version of the documentation based on the contents of the root level `docs/` directory in this project.
When generating a new version, it is assumed that all changes for the soon to be created new versions have already landed in the `main` branch.

To generate a new version:
1. Ensure there are no changes in your local repository
1. Ensure that you have the latest version of `main` - `git checkout main && git pull`
    1. This is important, as a rebase/merge with `main` later will not catch any changes in `docs/` that you don't have locally
1. Check out a new branch to host the changes
1. Generate a new release - `npm run docusaurus docs:version v[VERSION]`
    1. `VERSION` will be the value that is seen in the dropdown on the documentation site.
    e.g. `npm run docusaurus docs:version v4.1` will generate a 'v4.1' version
1. Commit your changes, push the branch, and create a pull request
1. Merging the Pull Request:
    1. Only one approval is need to merge the pull request
    1. Merging the pull request should coincide with the release of Stencil Core, as the doc site automatically deploys to Vercel

## Stencil v5 GA Checklist

`docs/` holds the v5 docs, shown as "v5 (Preview)" at `/v5/` while the site's default stays on v4.43 (see `lastVersion` in `docusaurus.config.js`). When v5 reaches GA:

1. `introduction/02-installation.md` ("Updating Stencil"): `@stencil/core@beta` → `@stencil/core@latest`, and drop the preview note.
1. Getting started: `npm init stencil@next` → `npm init stencil`, and drop the preview note. (`@5` can't resolve until a stable `create-stencil@5.0.0` exists.)
1. `reference/upgrading-to-stencil-five.md`: `@stencil/core@beta` → `@stencil/core@5`, drop the preview note, and point the `BREAKING_CHANGES.md` link at `main` instead of the `v5` branch.
1. `reference/support-policy.md`: fill in V5's release date, and V4's maintenance end date (six months after it).
1. `guides/tooling/storybook.md`: drop `@dev` and its note once `@stencil/storybook-plugin` 1.0 ships.
1. Once v5 is merged to `main` in `stenciljs/core`: repoint `docs-json.md`'s two links to `blob/main/src/declarations/stencil-public-docs.ts` at `packages/core/src/declarations/stencil-public-docs.ts`.
1. Cut the version (`npm run docusaurus docs:version v5.0`, see above), then set `lastVersion: 'v5.0'` and remove the `current` label/banner overrides in `docusaurus.config.js`.
1. Outside this repo: the stenciljs.com landing page still has a "Stencil 4 is here!" banner.
