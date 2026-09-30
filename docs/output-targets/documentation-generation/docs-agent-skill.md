---
title: Agent Skill Documentation
sidebar_label: Agent Skill (docs-agent-skill)
description: Generate an Agent Skill so AI coding agents can use your component library
slug: /docs-agent-skill
---

# Agent Skill Documentation

The `docs-agent-skill` output target generates an [Agent Skill](https://agentskills.io) for your component library: a `SKILL.md` file plus one reference file per component. AI coding agents that support skills load it to learn your components' API and usage, so they can write correct markup with your library instead of guessing.

It's built from the same component data as [`docs-readme`](./docs-readme.md) - JSDoc comments, props, events, methods, slots, CSS custom properties, parts, and usage examples.

## Setup

Add the output target to your `stencil.config.ts`:

```tsx title="stencil.config.ts"
import { Config } from '@stencil/core';

export const config: Config = {
  outputTargets: [
    {
      type: 'docs-agent-skill',
    },
  ],
};
```

Like the other documentation output targets, it's skipped during development builds unless you pass `--docs`.

## Output

```tree
dist/skill
├── SKILL.md
└── components
    ├── my-button.md
    └── my-card.md
```

`SKILL.md` contains:
- frontmatter with the skill's [`name`](#name) and [`description`](#description) - the description is what an agent reads to decide when to load the skill
- your project-level usage content, if you have any (see [Project-Level Usage](#project-level-usage))
- a list of every component, linking to its reference file, with the first sentence of its JSDoc description

Each `components/<tag>.md` file has the same sections as that component's generated [README](./docs-readme.md#readme-sections).

To ship the skill with your library, include its directory in your `package.json` `files` array.

## Project-Level Usage

Markdown files in `src/usage/` are added to `SKILL.md` as an introduction to the whole library - how to install it, load it, and anything else that applies across components. This works the same way as a component's own [usage examples](./docs-readme.md#usage-examples), one directory up:

```md title="src/usage/getting-started.md"
# Getting Started

Acme UI is a set of accessible form controls. Load it with a script tag.
```

If you don't set a [`description`](#description), the first sentence of the first project-level usage file is used.

## Config

### dir

*default: `dist/skill`*

Where the skill is written.

### name

*default: your project's [`namespace`](../../config/01-overview.md#namespace), lowercased*

The skill's name, in its `SKILL.md` frontmatter. Converted to lowercase letters, numbers, and hyphens.

### description

*default: generated*

The skill's description, in its `SKILL.md` frontmatter. If not set, Stencil uses the first sentence of your [project-level usage](#project-level-usage), or failing that, a sentence listing your component tags.

Write this yourself for the best results. Agents decide whether to load a skill based on its description alone, so say what the library is for and when to use it.
