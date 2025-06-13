---
title: Stencil Test Runner Overview
sidebar_label: Overview
---

# Overview

Stencil has a built-in test runner that uses [Jest](https://jestjs.io/) and [Puppeteer](https://pptr.dev/) as its testing libraries, and allows developers to install both libraries using their preferred package manager.

If you created a project using `npm init stencil`, these libraries were installed for you. Depending on when your project was created, you may or may not have the latest supported version installed.

To view current version support for both Jest and Puppeteer, please see the  [Stencil support policy for testing libraries](../../reference/support-policy.md#testing-libraries).

## Testing Commands

Stencil tests are run using the command `stencil test`, followed by one or more optional flags:
- `--spec` to run unit tests
- `--e2e` to run end-to-end tests
- `--watchAll` to watch the file system for changes, and rerun tests when changes are detected

When the `--spec` and/or `--e2e` flags are provided, Stencil will automatically run the tests associated with each flag.

Below a series of example `npm` scripts which can be added to the project's `package.json` file to run Stencil tests:

```json
{
    "scripts": {
      "test": "stencil test --spec",
      "test.watch": "stencil test --spec --watchAll",
      "test.end-to-end": "stencil test --e2e"
    }
}
```

Each command above begins with `stencil test`, which tells Stencil to run tests. Note that each `stencil test` command 
in the example above is followed by one or more of the optional flags. Looking at each script, one at a time:
- the `test` script runs unit tests for our Stencil project.
- the `test.watch` script runs unit tests for our Stencil project. It watches the filesystem for changes, and reruns
tests when changes are detected.
- the `test.end-to-end` script runs the end-to-end tests for our Stencil project.

If you created a project using `npm init stencil`, these scripts are provided to you automatically.

Stencil does not prescribe any specific naming convention for the names of your scripts. The `test.watch` script could as easily be named `test-watch`, `test.incremental`, etc. As long as the script itself uses the `stencil test` command, your tests should be run.

### Testing Configuration

Stencil will apply defaults from data it has already gathered. For example, Stencil already knows what directories to look through, and what files are spec and e2e files. Jest can still be configured using the same config names, but now using the stencil config `testing` property. Please see the [Testing Config docs](./02-config.md) for more info.

```tsx
import { Config } from '@stencil/core';

export const config: Config = {
  testing: {
    testPathIgnorePatterns: [...]
  }
};
```

### Command Line Arguments

While the Stencil CLI offers a certain set of command line flags to specify e.g. which types of tests to run, you also have access to all Jest options through the CLI. For example to specify a single test, you can pass in a positional argument to Jest by adding a `--`, e.g.:

```sh
# run a single unit test
npx stencil test --spec -- src/components/my-component/my-component.spec.ts
# run a single e2e test
npx stencil test --e2e -- src/components/my-component/my-component.e2e.ts
```

Next to positional arguments, Stencil also passes along [certain](https://github.com/ionic-team/stencil/blob/54d4ee252768e1d225baababee0093fdb0562b83/src/cli/config-flags.ts#L38-L85) Jest specific flags, e.g.:

```sh
# enable code coverage
npx stencil test --spec --coverage
```

You can find more information about [Jest CLI options](https://jestjs.io/docs/cli) in the project documentation.

## Running and Debugging Tests in VS Code

Adding the following configurations to `.vscode/launch.json` will allow you to use the VS Code Debugger to run the Stencil test runner for the currently active file in your editor.

To use the below configuration:
1. Ensure the test file you want to run is open and in the current active window in VS Code.
2. Select the debug configuration to run:
   1. 'E2E Test Current File' will run the end-to-end tests in the active test file
   2. 'Spec Test Current File' will run the spec tests in the active test file
3. Hit the play button to start the test.

```json title=".vscode/launch.json"
{
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "E2E Test Current File",
      "cwd": "${workspaceFolder}",
      "program": "${workspaceFolder}/node_modules/.bin/stencil",
      "args": ["test", "--e2e", "--", "--maxWorkers=0", "${fileBasename}"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Spec Test Current File",
      "cwd": "${workspaceFolder}",
      "program": "${workspaceFolder}/node_modules/.bin/stencil",
      "args": ["test", "--spec", "--", "${fileBasename}"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

:::tip
Windows users: The `program` value should be set to `"${workspaceFolder}/node_modules/bin/stencil"`.
If that value does not work, please try`"${workspaceFolder}/node_modules/@stencil/core/bin/stencil"`.
:::

The configuration above makes use of special VS Code variables, such as `${workspaceFolder}`. These variables are substituted with actual values upon starting the tests. For more information regarding the values these variables resolve to, please see VS Code's [Variables Reference documentation](https://code.visualstudio.com/docs/editor/variables-reference).

## Other Resources

- [The Basics of Unit Testing in StencilJS](https://eliteionic.com/tutorials/the-basics-of-unit-testing-in-stencil-js/)
