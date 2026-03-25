---
title: API Reference
sidebar_label: API
description: Complete API reference for @stencil/vitest.
slug: /testing-vitest-api
---

# API Reference

Complete reference for the `@stencil/vitest` testing utilities.

## Render Function

### `render(VNode, options?)`

Renders a Stencil component for testing.

```tsx
import { render, h } from '@stencil/vitest';

const result = await render(<my-component name="World" />);
```

### Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `waitForReady` | `boolean` | `true` | Wait for component hydration before returning |
| `spyOn` | `SpyOnOptions` | - | Configure spies for methods, props, and lifecycle hooks |

#### `waitForReady`

By default, `render()` waits for components to be fully hydrated before returning. It detects when Stencil applies the hydrated flag (class or attribute) to your component, respecting your `stencil.config` settings.

```tsx
// Default behavior - waits for hydration
const { root } = await render(<my-component />);

// Skip hydration wait (useful for pre-ready states)
const { root } = await render(<my-component />, { waitForReady: false });
```

#### `spyOn`

Configure spies for component methods, props, and lifecycle hooks. See the [Mocking & Spying](./05-mocking.md) guide for comprehensive documentation.

```tsx
const { root, spies } = await render(<my-component />, {
  spyOn: {
    methods: ['handleClick'],
    props: ['variant'],
    lifecycle: ['componentDidLoad'],
  },
});

expect(spies?.methods.handleClick).toHaveBeenCalled();
```

### Return Values

| Property | Type | Description |
| -------- | ---- | ----------- |
| `root` | `HTMLElement` | The rendered component element |
| `waitForChanges` | `() => Promise<void>` | Wait for component re-renders |
| `setProps` | `(props: object) => Promise<void>` | Update props and wait for changes |
| `unmount` | `() => void` | Remove the component from the DOM |
| `spyOnEvent` | `(eventName: string) => EventSpy` | Create a spy for custom events |
| `spies` | `ComponentSpies \| undefined` | Spy objects when using `spyOn` option |

### Example

```tsx
import { render, h } from '@stencil/vitest';

const { root, waitForChanges, setProps, unmount, spyOnEvent } = await render(
  <my-component name="World" />
);

// Access the element
expect(root.textContent).toContain('World');

// Update props directly
root.name = 'Stencil';
await waitForChanges();

// Or update props via setProps
await setProps({ name: 'Vitest' });

// Spy on events
const eventSpy = spyOnEvent('myEvent');
root.click();
expect(eventSpy).toHaveReceivedEvent();

// Unmount component
unmount();
```

## Custom Matchers

### Class Matchers

#### `toHaveClass(className)`

Checks if an element has a specific CSS class:

```typescript
expect(element).toHaveClass('active');
expect(element).toHaveClass('btn-primary');
expect(element).not.toHaveClass('disabled');
```

#### `toHaveClasses(classNames)`

Checks if an element has all specified CSS classes (partial match):

```typescript
expect(element).toHaveClasses(['btn', 'btn-primary']);
expect(element).toHaveClasses(['active', 'visible']);
```

#### `toMatchClasses(classNames)`

Checks if an element has exactly the specified CSS classes (exact match):

```typescript
expect(element).toMatchClasses(['btn', 'btn-primary']);
// Fails if element has additional classes
```

### Attribute Matchers

#### `toHaveAttribute(name, value?)`

Checks if an element has a specific attribute, optionally with a specific value:

```typescript
expect(element).toHaveAttribute('aria-label', 'Close');
expect(element).toHaveAttribute('disabled');
expect(element).not.toHaveAttribute('hidden');
```

#### `toEqualAttribute(name, value)`

Checks if an element has an attribute with an exact value:

```typescript
expect(element).toEqualAttribute('type', 'button');
expect(element).toEqualAttribute('aria-label', 'Submit form');
```

#### `toEqualAttributes(attributes)`

Checks multiple attributes and their values at once:

```typescript
expect(element).toEqualAttributes({
  type: 'button',
  disabled: true,
  'aria-label': 'Submit',
});
```

### Property Matchers

#### `toHaveProperty(name, value)`

Checks if an element has a specific property value:

```typescript
expect(element).toHaveProperty('value', 'test');
expect(element).toHaveProperty('checked', true);
```

### Text Content Matchers

#### `toHaveTextContent(text)`

Checks if an element contains specific text (includes shadow DOM):

```typescript
expect(element).toHaveTextContent('Hello World');
```

#### `toHaveLightTextContent(text)`

Checks if an element contains specific text (light DOM only):

```typescript
expect(element).toHaveLightTextContent('Slotted content');
```

#### `toEqualText(text)`

Checks if an element's text content exactly matches (includes shadow DOM):

```typescript
expect(element).toEqualText('Exact text match');
```

#### `toEqualLightText(text)`

Checks if an element's text content exactly matches (light DOM only):

```typescript
expect(element).toEqualLightText('Exact slotted text');
```

### Shadow DOM Matchers

#### `toHaveShadowRoot()`

Checks if an element has a shadow root:

```typescript
expect(element).toHaveShadowRoot();
```

#### `toEqualHtml(html)`

Compares the element's HTML including shadow DOM:

```typescript
await expect(element).toEqualHtml(`
  <my-component>
    <mock:shadow-root>
      <div class="container">
        <slot></slot>
      </div>
    </mock:shadow-root>
    Slotted content
  </my-component>
`);
```

#### `toEqualLightHtml(html)`

Compares only the light DOM HTML:

```typescript
await expect(element).toEqualLightHtml(`
  <my-component first="John" last="Doe">
    <span>Child content</span>
  </my-component>
`);
```

### Event Matchers

These matchers work with EventSpy objects returned by `spyOnEvent`:

#### `toHaveReceivedEvent()`

Checks if an event has been received at least once:

```typescript
expect(eventSpy).toHaveReceivedEvent();
```

#### `toHaveReceivedEventTimes(count)`

Checks if an event has been received a specific number of times:

```typescript
expect(eventSpy).toHaveReceivedEventTimes(3);
expect(eventSpy).toHaveReceivedEventTimes(0); // No events
```

#### `toHaveReceivedEventDetail(detail)`

Checks if the last received event has the expected detail:

```typescript
expect(eventSpy).toHaveReceivedEventDetail({
  value: 'test',
  timestamp: expect.any(Number),
});
```

### Screenshot Matchers

#### `toMatchScreenshot()`

Compares the element's visual appearance (browser tests only):

```typescript
await expect(element).toMatchScreenshot();
```

## Utility Functions

### `serializeHtml(element, options?)`

Serializes an HTML element to a string, including shadow DOM content.

```tsx
import { serializeHtml } from '@stencil/vitest';

const html = serializeHtml(element, {
  serializeShadowRoot: true, // Include shadow DOM (default: true)
  pretty: true,              // Prettify output (default: true)
  excludeStyles: true,       // Exclude <style> tags (default: true)
});
```

**Options:**

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `serializeShadowRoot` | `boolean` | `true` | Include shadow DOM content |
| `pretty` | `boolean` | `true` | Format with indentation |
| `excludeStyles` | `boolean` | `true` | Remove `<style>` tags |

### `prettifyHtml(html)`

Formats an HTML string with indentation for readability.

```tsx
import { prettifyHtml } from '@stencil/vitest';

const formatted = prettifyHtml('<div><span>Hello</span></div>');
// Returns:
// <div>
//   <span>
//     Hello
//   </span>
// </div>
```

### `waitForStable(elementOrSelector, timeout?)`

Waits for an element to be rendered and visible in the DOM. **Browser tests only.**

```tsx
import { waitForStable } from '@stencil/vitest';

// Wait for an element
await waitForStable(element);

// Wait using a selector
await waitForStable('my-component .inner-element');

// Custom timeout (default: 5000ms)
await waitForStable('my-component', 10000);
```

:::note
In non-browser environments, `waitForStable` logs a warning and returns immediately.
:::

### `waitForExist(selector, timeout?)`

Waits for an element matching the selector to exist in the DOM. Works in all environments.

```tsx
import { waitForExist } from '@stencil/vitest';

// Wait for an element to appear
const element = await waitForExist('my-component .lazy-loaded');

// Custom timeout (default: 5000ms)
const element = await waitForExist('#dynamic-content', 10000);
```

**Returns:** The element if found, or `null` if timeout is reached.

## EventSpy API

The `spyOnEvent` function returns an EventSpy object:

```tsx
const spy = spyOnEvent('myEvent');
```

**Properties:**

| Property | Type | Description |
| -------- | ---- | ----------- |
| `events` | `CustomEvent[]` | Array of all received events |
| `firstEvent` | `CustomEvent \| undefined` | First received event |
| `lastEvent` | `CustomEvent \| undefined` | Most recent event |

## Re-exports

`@stencil/vitest` re-exports common Vitest utilities for convenience:

```tsx
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
  vi,
  h,  // Stencil's h function for JSX
} from '@stencil/vitest';
```
