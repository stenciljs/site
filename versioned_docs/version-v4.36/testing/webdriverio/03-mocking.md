---
title: Mocking
sidebar_label: Mocking
description: Mocking
label: Mocking
---

# Mocking

WebdriverIO has support for file based module mocking as well as mocking of entire dependencies of your project. The framework provides a set of primitives for mocking as documented in the project [documentation](https://webdriver.io/docs/component-testing/mocking):

```ts
import { mock, fn, unmock } from '@wdio/browser-runner'
```

To create a mock you can either create a file with the name of the module you would like to mock in the `__mocks__` directory, as described in [Manual Mocks](https://webdriver.io/docs/component-testing/mocking#manual-mocks), or mock the file directly as part of your test:

```ts
import { mock, fn } from '@wdio/browser-runner'
import { format } from './utils/utils.ts'

// mock files within the project
mock('./utils/utils.ts', () => ({
    format: fn().mockReturnValue(42)
}))
// mock whole modules and replace functionality with what is defined in `./__mocks__/leftpad.ts`
mock('leftpad')

console.log(format()) // returns `42`
```

Once a module is mocked, importing it either from your test or your component will give you the mocked version of the module and not the actual one.

Find more examples and documentation on mocking in the project [documentation](https://webdriver.io/docs/component-testing/mocking).