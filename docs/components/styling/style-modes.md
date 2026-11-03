---
sidebar_position: 4
title: Style Modes
sidebar_label: Style Modes
description: Give one component several stylesheets and choose between them at runtime
slug: /style-modes
---

# Style Modes

Style modes give one component several stylesheets, and pick one for each instance at runtime. Ionic uses them to render the same components with iOS or Material Design styling.

Give `styleUrls` an object, with a stylesheet for each mode. The mode names are up to you:

```tsx
@Component({
  tag: 'simple-button',
  styleUrls: {
    md: './simple-button.md.css',
    ios: './simple-button.ios.css',
  },
})
export class SimpleButton {
  // ...
}
```

## Choosing a Mode

Call `setMode()` with a function that returns the mode for an element. Stencil calls it once for each component instance, before its first render. This example reads the element's `mode` attribute and falls back to `md`:

```ts title="src/global.ts"
import { setMode } from '@stencil/core';

export default () => {
  setMode((el) => el.getAttribute('mode') || 'md');
};
```

```html
<simple-button mode="ios"></simple-button>
```

`setMode()` has to run before any component renders, so call it from your [global script](../../config/01-overview.md#globalscript). Stencil uses `src/global.ts` as the global script automatically.

A component with style modes gets no styles at all if no mode is set, or if the mode it's given has no stylesheet. A component's mode is fixed once it has loaded; to change it, render a new element.

## Reading the Mode

`getMode()` returns the mode a component was given:

```ts
import { getMode } from '@stencil/core';

const button = document.querySelector('simple-button');
console.log(getMode(button)); // 'ios'
```
