---
title: Testing Config
sidebar_label: Config
description: Testing Config
slug: /testing-config
---

# Testing Config

The `testing` config setting in `stencil.config.ts` specifies an object that corresponds to the jest configuration that should be used in your tests. Stencil provides a default configuration, which you likely won't need to edit, however it can be extended with the same configuration options as Jest. See the [Configuring Jest Guide](https://jestjs.io/docs/en/configuration.html) for configuration details.

:::note
Keep in mind that the usual way of configuring Jest (`package.json` and `jest.config.js`) is not used with the `stencil testing` command. Jest can still be used, but configuring the presets, transpilation and setting up the correct commands must be done by the project.
:::

Some additional Stencil specific options may be set here as well for configuring the e2e tests.

```tsx reference title=""
https://github.com/ionic-team/stencil/blob/32811591777de726f0374649a4f5e250a0a8e355/src/declarations/stencil-public-compiler.ts#L1968-L2119
```
