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

To catch a misspelled mode name at build time, list your modes in the [`modes`](../../config/01-overview.md#modes) config option.

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

In this playground, change a `mode` attribute in `index.html` to `web`, which has no stylesheet, and that button loses its styles:

:::playground{preview-height=80}
```html title="index.html"
<script type="module" src="./simple-button.js"></script>

<simple-button mode="ios">iOS</simple-button>
<simple-button>Material (the default)</simple-button>
```

```tsx title="src/simple-button.tsx"
import { Component } from '@stencil/core';

@Component({
  tag: 'simple-button',
  styleUrls: {
    md: './simple-button.md.css',
    ios: './simple-button.ios.css',
  },
  encapsulation: { type: 'shadow' },
})
export class SimpleButton {
  render() {
    return (
      <button>
        <slot />
      </button>
    );
  }
}
```

```css title="src/simple-button.md.css"
button {
  padding: 8px 16px;
  border: 0;
  border-radius: 4px;
  background: #6200ee;
  color: white;
  text-transform: uppercase;
}
```

```css title="src/simple-button.ios.css"
button {
  padding: 8px 16px;
  border: 1px solid #007aff;
  border-radius: 10px;
  background: white;
  color: #007aff;
}
```

```ts title="src/global.ts" hidden
import { setMode } from '@stencil/core';

export default () => {
  setMode((el) => el.getAttribute('mode') || 'md');
};
```
:::

## Reading the Mode

`getMode()` returns the mode a component was given:

```ts
import { getMode } from '@stencil/core';

const button = document.querySelector('simple-button');
console.log(getMode(button)); // 'ios'
```
