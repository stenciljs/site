---
title: Writing Tests
sidebar_label: Writing Tests
description: Learn how to write tests for Stencil components with @stencil/vitest.
slug: /testing-vitest-writing-tests
---

# Writing Tests

`@stencil/vitest` provides a simple and intuitive API for testing Stencil components.

## Rendering Components

### Basic Rendering

Use the `render` function to render a component for testing:

```tsx
import { render, h, describe, it, expect } from '@stencil/vitest';

describe('my-component', () => {
  it('renders', async () => {
    const { root } = await render(<my-component name="World" />);
    expect(root.textContent).toContain('World');
  });
});
```

### Render Return Values

The `render` function returns an object with utilities for interacting with the rendered component:

```tsx
const { root, waitForChanges, setProps, unmount, spyOnEvent } = await render(<my-component />);
```

| Property | Description |
| -------- | ----------- |
| `root` | The rendered component element |
| `waitForChanges` | Wait for component re-renders after state/prop changes |
| `setProps` | Update component props and wait for changes |
| `unmount` | Remove the component from the DOM |
| `spyOnEvent` | Create a spy for custom events |

### Updating Props

There are two ways to update component props:

```tsx
const { root, waitForChanges, setProps } = await render(<my-component name="World" />);

// Option 1: Direct property assignment
root.name = 'Stencil';
await waitForChanges();

// Option 2: Using setProps
await setProps({ name: 'Stencil' });
```

### Unmounting

Clean up by unmounting the component:

```tsx
const { unmount } = await render(<my-component />);
// ... run tests
unmount();
```

## Event Testing

Test custom events emitted by your components using `spyOnEvent`:

```tsx
import { render, h, describe, it, expect } from '@stencil/vitest';

describe('my-button', () => {
  it('emits buttonClick event', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(<my-button />);

    // Create a spy for the event
    const clickSpy = spyOnEvent('buttonClick');

    // Trigger the event
    root.click();
    await waitForChanges();

    // Assert the event was emitted
    expect(clickSpy).toHaveReceivedEvent();
    expect(clickSpy).toHaveReceivedEventTimes(1);
    expect(clickSpy).toHaveReceivedEventDetail({ buttonId: 'my-button' });
  });
});
```

### Accessing Event Data

The event spy provides access to all captured events:

```tsx
const clickSpy = spyOnEvent('buttonClick');

// Trigger multiple events
root.click();
root.click();
await waitForChanges();

// Access event data
expect(clickSpy.events).toHaveLength(2);
expect(clickSpy.firstEvent?.detail).toEqual({ buttonId: 'my-button' });
expect(clickSpy.lastEvent?.detail).toEqual({ buttonId: 'my-button' });
```

## Snapshot Testing

The package includes a custom snapshot serializer that properly handles shadow DOM:

```tsx
import { render, h, describe, it, expect } from '@stencil/vitest';

describe('my-component', () => {
  it('matches snapshot', async () => {
    const { root } = await render(<my-component />);
    expect(root).toMatchSnapshot();
  });
});
```

**Snapshot output example:**

```html
<my-component>
  <mock:shadow-root>
    <button class="primary">
      <slot />
    </button>
  </mock:shadow-root>
  Click me
</my-component>
```

## Screenshot Testing

Browser tests can include screenshot comparisons:

```tsx
import { render, h, describe, it, expect } from '@stencil/vitest';

describe('my-button', () => {
  it('matches screenshot', async () => {
    const { root } = await render(<my-button variant="primary">Primary Button</my-button>);
    await expect(root).toMatchScreenshot();
  });
});
```

:::note
Screenshot testing requires browser mode. See [Vitest's screenshot testing documentation](https://vitest.dev/guide/snapshot.html#visual-snapshots) for more details.
:::

## Testing Shadow DOM

Access shadow DOM content using `shadowRoot`:

```tsx
const { root } = await render(<my-component />);

// Query shadow DOM elements
const button = root.shadowRoot?.querySelector('button');
expect(button).toHaveClass('primary');

// Assert on shadow DOM HTML
await expect(root).toEqualHtml(`
  <my-component>
    <mock:shadow-root>
      <button class="primary">Click me</button>
    </mock:shadow-root>
  </my-component>
`);
```

## Testing Slots

Test slotted content using light DOM assertions:

```tsx
const { root } = await render(
  <my-card>
    <h2 slot="header">Card Title</h2>
    <p>Card content</p>
  </my-card>
);

// Assert on light DOM only
await expect(root).toEqualLightHtml(`
  <my-card>
    <h2 slot="header">Card Title</h2>
    <p>Card content</p>
  </my-card>
`);

// Or use light text assertions
expect(root).toHaveLightTextContent('Card Title');
```

## Waiting for Async Operations

### waitForChanges

Always call `waitForChanges` after modifying component state or props:

```tsx
const { root, waitForChanges } = await render(<my-counter />);

root.increment();
await waitForChanges();

expect(root.value).toBe(1);
```

### waitForExist

Wait for an element to appear in the DOM (works in all environments):

```tsx
import { render, waitForExist, h } from '@stencil/vitest';

const { root } = await render(<my-component />);

// Wait for a dynamically created element
const element = await waitForExist('my-component .lazy-loaded');
expect(element).not.toBeNull();
```

### waitForStable

Wait for an element to be rendered and visible (browser tests only):

```tsx
import { render, waitForStable, h } from '@stencil/vitest';

const { root } = await render(<my-component />);
await waitForStable(root);

// Or wait using a selector
await waitForStable('my-component .inner-element');
```

## Common Patterns

### Testing Form Components

```tsx
describe('my-input', () => {
  it('emits valueChange on input', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(<my-input />);
    const changeSpy = spyOnEvent('valueChange');

    const input = root.shadowRoot?.querySelector('input');
    input.value = 'test';
    input.dispatchEvent(new Event('input'));
    await waitForChanges();

    expect(changeSpy).toHaveReceivedEventDetail({ value: 'test' });
  });
});
```

### Testing Conditional Rendering

```tsx
describe('my-component', () => {
  it('shows loading state', async () => {
    const { root, setProps } = await render(<my-component loading={true} />);

    expect(root.shadowRoot?.querySelector('.loading')).not.toBeNull();

    await setProps({ loading: false });

    expect(root.shadowRoot?.querySelector('.loading')).toBeNull();
    expect(root.shadowRoot?.querySelector('.content')).not.toBeNull();
  });
});
```

### Testing Lifecycle Methods

```tsx
describe('my-component', () => {
  it('calls connectedCallback', async () => {
    const { root, unmount } = await render(<my-component />);

    // Component is connected
    expect(root.isConnected).toBe(true);

    unmount();

    // Component is disconnected
    expect(root.isConnected).toBe(false);
  });
});
```
