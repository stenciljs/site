---
title: Versioning
sidebar_label: Versioning
description: Versioning
slug: /versioning
---

# Versioning

Stencil follows the <a href="https://semver.org/" target="_blank">Semantic Versioning (SemVer)</a> convention:
<code>major.minor.patch.</code> Incompatible API changes increment the <code>major</code> version, adding 
backwards-compatible functionality increments the <code>minor</code> version, and backwards-compatible bug fixes
increment the <code>patch</code> version.

## Release Schedule

### Major Release

A major release will be published when there is a breaking change introduced in the API. Release candidates will
be published prior to a major release in order to get feedback before the final release. An outline of what is
changing and why will be included with the release candidates.

### Minor Release

A minor release will be published when a new feature is added or API changes that are non-breaking are introduced.
We will heavily test any changes so that we are confident with the release, but with new code comes the potential for
new issues*. Minor releases are scheduled to occur at least **once a month**, although this cadence may vary according 
to team priorities.

\* This statement applies to the Stencil team upgrading its version of TypeScript as well. For more information, please
see the team's [support policy regarding TypeScript](./support-policy.md#typescript-support)

### Patch Release

A patch release will be published when bug fixes were included, but the API has not changed and no breaking changes were
introduced.  Patch releases are scheduled to occur at least **once a month**, although this cadence may vary according
to team priorities. There may be times where patch releases need to released more often than scheduled.

## Changelog

To see a list of all notable changes to Stencil, please refer to the [releases
page](https://github.com/ionic-team/stencil/releases). This contains an ordered
list of all bug fixes and new features under each release.
