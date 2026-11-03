---
title: Migrating E2E Tests to Playwright
sidebar_label: Migration
description: Move end-to-end tests from Stencil v4's newE2EPage() to @stencil/playwright.
slug: /testing-playwright-migration
---

# Migrating E2E Tests to Playwright

Stencil v5 removes the integrated test runner, including `stencil test --e2e` and `newE2EPage()`. There are two places to move e2e tests:

- **Playwright**, covered here, for tests of whole pages, in Chromium, Firefox, and WebKit.
- **Vitest browser mode**, for tests of individual components. See [E2E Tests](../vitest/07-migration.md#e2e-tests) in the Vitest migration guide.

## Set Up

Add Playwright to your project with `stencil add @stencil/playwright`, or by hand. See [Set Up](./01-overview.md#set-up). Then replace the test script:

```json title="package.json"
{
  "scripts": {
    "test.e2e": "playwright test"
  }
}
```

The old script ran `stencil test --e2e`. Any e2e settings in the `testing` section of `stencil.config.ts` move to `playwright.config.ts`; remove that section, since v5 no longer reads it.

## Before and After

**Before:**

```ts title="my-toggle.e2e.ts"
import { newE2EPage } from '@stencil/core/testing';

it('toggles', async () => {
  const page = await newE2EPage();
  await page.setContent('<my-toggle class="pretty-toggle"></my-toggle>');

  const myChange = await page.spyOnEvent('myChange');
  const toggle = await page.find('my-toggle');
  expect(toggle).toHaveClass('pretty-toggle');

  toggle.setProperty('checked', true);
  await page.waitForChanges();

  expect(toggle).toHaveClass('toggle-checked');
  expect(myChange).toHaveReceivedEventDetail({ checked: true });

  const button = await page.find('my-toggle >>> button');
  expect(button).toEqualText('On');
});
```

**After:**

```ts title="my-toggle.e2e.ts"
import { expect } from '@playwright/test';
import { test } from '@stencil/playwright';

test('toggles', async ({ page }) => {
  await page.setContent('<my-toggle class="pretty-toggle"></my-toggle>');

  const myChange = await page.spyOnEvent('myChange');
  const toggle = page.locator('my-toggle');
  await expect(toggle).toHaveClass(/pretty-toggle/);

  await toggle.evaluate((el: HTMLMyToggleElement) => (el.checked = true));
  await page.waitForChanges();

  await expect(toggle).toHaveClass(/toggle-checked/);
  expect(myChange).toHaveReceivedEventDetail({ checked: true });

  await expect(page.locator('my-toggle button')).toHaveText('On');
});
```

## API Mapping

| Stencil v4 | `@stencil/playwright` |
|---|---|
| `const page = await newE2EPage()` | The `page` fixture: `test('…', async ({ page }) => …)` |
| `page.setContent(html)` or `newE2EPage({ html })` | `page.setContent(html)` |
| `newE2EPage({ url })` | `page.goto(url)` |
| `page.find('my-cmp')` | `page.locator('my-cmp')` |
| `page.find('my-cmp >>> .inner')` | `page.locator('my-cmp .inner')` |
| `element.setProperty('name', value)` | `locator.evaluate((el) => (el.name = value))` |
| `element.callMethod('name')` | `locator.evaluate((el) => el.name())` |
| `element.getProperty('name')` | `locator.evaluate((el) => el.name)` |
| `page.waitForChanges()` | `page.waitForChanges()` |
| `page.spyOnEvent('name')` | `page.spyOnEvent('name')` |
| `element.spyOnEvent('name')` | `locator.spyOnEvent('name')` |
| `toHaveReceivedEvent()`, `toHaveReceivedEventDetail()`, `toHaveReceivedEventTimes()` | The same matchers, from `@stencil/playwright` |
| `toHaveClass('name')` | `await expect(locator).toHaveClass(/name/)` |
| `toEqualText('text')` | `await expect(locator).toHaveText('text')` |
| `toEqualHtml(html)` | No direct equivalent. Assert on text, attributes, or classes, or compare a screenshot. |
| `page.setViewport({ width, height })` | `page.setViewportSize({ width, height })` |
| `page.waitForSelector('.hydrated')` | Not needed: `setContent()` and `goto()` wait for components to load. |
| `page.compareScreenshot()` + `toMatchScreenshot()` | `await expect(page).toHaveScreenshot()` |

## Key Differences

**Import `test` from `@stencil/playwright`** and `expect` from `@playwright/test`. The adapter's `test` sets up the `page` fixture with Stencil's methods; Playwright's own `test` doesn't have them. The event matchers need `expect.extend(matchers)` in `playwright.config.ts`, which the setup includes.

**Locators are lazy.** `page.locator()` doesn't search the page until you use the result, and `await expect(locator)` retries until the assertion passes or times out. There's no need to check that an element exists before using it.

**Shadow DOM is pierced by default**, so the `>>>` selector isn't needed.

**Props and methods go through `evaluate()`**, which runs a function in the browser with the element. Type the element with its generated `HTML<Tag>Element` interface to get typed props and methods.

**Screenshots** use Playwright's [visual comparisons](https://playwright.dev/docs/test-snapshots). Reference images are stored next to the test file, and `playwright test --update-snapshots` updates them.
