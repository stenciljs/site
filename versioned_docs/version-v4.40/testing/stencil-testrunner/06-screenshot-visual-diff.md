---
title: Screenshot Visual Diff
sidebar_label: Visual Screenshot Diff
description: Screenshot Visual Diff
slug: /screenshot-visual-diff
---

# Screenshot Visual Diff

`EXPERIMENTAL`: screenshot visual diff testing is currently under heavy development and has not reached a stable status. However, any assistance testing would be appreciated.

## Visual Regression Testing Commands

```bash
stencil test --e2e --screenshot
```

## Quick Example

[Puppeteer](https://github.com/GoogleChrome/puppeteer) is used to compare screenshots. In order to make one, you have to set up an e2e test, e.g.:
```javascript
  it('render something', async () => {
    const page: E2EPage = await newE2EPage();
    await page.setContent('<my-cmp></my-cmp>');
    await page.compareScreenshot('My Component (...is beautiful. Look at it!)', {fullPage: false});
  });

```

## Advanced Example

```javascript
describe('stencil-avatar', () => {
  it('renders and responds to the size property', async () => {
    const page = await newE2EPage();

    // In order to test against any global styles you may have, don't forget to set the link to the global css. You don't have to do this if your stencil.config.ts file doesn't build a global css file with globalStyle.
    await page.setContent('<link href="http://localhost:3333/build/stellar-core.css" rel="stylesheet" /><stencil-avatar size="small"></stencil-avatar>');
    
    const element = await page.find('stencil-avatar');
    expect(element).toHaveClass('hydrated');

    // To start comparing the visual result, you first must run page.compareScreenshot; This will capture a screenshot, and save the file to "/screenshot/images". You'll be able to check that into your repo to provide those results to your team. You can only have one of these commands per test. 
    const results = await page.compareScreenshot();

    // Finally, we can test against the previous screenshots. 
    // Test against hard pixels
    expect(results).toMatchScreenshot({ allowableMismatchedPixels: 100 })
    
    // Test against the percentage of changes. if 'allowableMismatchedRatio' is above 20% changed, 
    expect(results).toMatchScreenshot({ allowableMismatchedRatio: 0.2 })

  });  
});
```

After you've run your tests, you can open the `/screenshot/compare.html` page in your project to see the changes and their differences. 

## Current issues: 
- Only screenshot the inner width of the items in the body itself. Currently the screenshot is taken at 600x600 pixels, so it makes "allowableMismatchedRatio" not a very valuable option. Something like a `await page.readjustSize()` that would clip the puppeteer page to the width of the rendered content would help make allowableMismatchedRatio more usable. 
- Needs more testing! 

