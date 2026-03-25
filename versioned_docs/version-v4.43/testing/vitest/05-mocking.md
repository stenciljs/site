---
title: Mocking & Spying
sidebar_label: Mocking & Spying
description: Spy on and mock component methods, props, and lifecycle hooks with @stencil/vitest.
slug: /testing-vitest-mocking
---

# Mocking & Spying

`@stencil/vitest` provides a powerful spy system that lets you observe and control component behavior during tests. You can spy on methods, props, and lifecycle hooks to verify behavior without modifying your component code.

## Setup Requirement

The spy system patches `customElements.define`, so components must be registered after the test framework initializes. Load your components in a `beforeAll` block:

```diff
// vitest-setup.ts
- await import('./dist/test-components/test-components.esm.js');

+ import { beforeAll } from 'vitest';
+ beforeAll(async () => {
+   await import('./dist/test-components/test-components.esm.js');
+ });
```

## Method Spying

Spy on methods while still calling the original implementation:

```tsx
import { render, h, describe, it, expect } from '@stencil/vitest';

describe('my-button', () => {
  it('calls handleClick when clicked', async () => {
    const { root, spies } = await render(<my-button>Click me</my-button>, {
      spyOn: {
        methods: ['handleClick'],
      },
    });

    // Trigger the method
    root.shadowRoot?.querySelector('button')?.click();

    // Assert the method was called
    expect(spies?.methods.handleClick).toHaveBeenCalledTimes(1);
    expect(spies?.methods.handleClick).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'click' })
    );

    // Reset call history
    spies?.methods.handleClick.mockClear();
  });
});
```

## Method Mocking

Replace methods with pre-configured mocks to control return values or simulate different scenarios:

```tsx
import { render, h, vi, describe, it, expect } from '@stencil/vitest';

describe('user-profile', () => {
  it('displays fetched user data', async () => {
    // Create mock with desired return value *before* render
    const fetchUserMock = vi.fn().mockResolvedValue({
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
    });

    // Mock is applied before component initialization
    const { root, spies, waitForChanges } = await render(
      <user-profile userId="123" />,
      {
        spyOn: {
          mocks: { fetchUserData: fetchUserMock },
        },
      }
    );
    await waitForChanges();

    expect(fetchUserMock).toHaveBeenCalledWith('123');
    expect(root.shadowRoot?.querySelector('.name')?.textContent).toBe('Test User');
  });
});
```

### Accessing the Original Implementation

You can wrap the original method to augment rather than fully replace it:

```tsx
const fetchMock = vi.fn();
const { spies } = await render(<my-component />, {
  spyOn: { mocks: { fetchData: fetchMock } },
});

// Wrap the original to add logging or modify behavior
fetchMock.mockImplementation(async (...args) => {
  console.log('Fetching data with args:', args);
  const result = await spies?.mocks.fetchData.original?.(...args);
  console.log('Got result:', result);
  return result;
});
```

## Prop Spying

Track when props are changed:

```tsx
describe('my-button', () => {
  it('tracks prop changes', async () => {
    const { spies, setProps, waitForChanges } = await render(
      <my-button variant="primary">Click me</my-button>,
      {
        spyOn: {
          props: ['variant', 'disabled'],
        },
      }
    );

    await setProps({ variant: 'danger' });
    await waitForChanges();

    expect(spies?.props.variant).toHaveBeenCalledWith('danger');
    expect(spies?.props.variant).toHaveBeenCalledTimes(1);
  });
});
```

## Lifecycle Spying

Spy on lifecycle methods. Methods that don't exist on the component are auto-stubbed:

```tsx
describe('my-button', () => {
  it('calls lifecycle methods', async () => {
    const { spies, setProps, waitForChanges } = await render(
      <my-button>Click me</my-button>,
      {
        spyOn: {
          lifecycle: [
            'componentWillLoad',
            'componentDidLoad',
            'componentWillRender',
            'componentDidRender',
          ],
        },
      }
    );

    // Lifecycle methods are called during initial render
    expect(spies?.lifecycle.componentWillLoad).toHaveBeenCalledTimes(1);
    expect(spies?.lifecycle.componentDidRender).toHaveBeenCalledTimes(1);

    // Trigger a re-render
    await setProps({ variant: 'danger' });
    await waitForChanges();

    // Re-render lifecycle methods called again
    expect(spies?.lifecycle.componentWillRender).toHaveBeenCalledTimes(2);
    expect(spies?.lifecycle.componentDidRender).toHaveBeenCalledTimes(2);
  });
});
```

## Resetting Spies

Reset all spies at once using `resetAll()`. This clears call histories AND resets mock implementations:

```tsx
const fetchMock = vi.fn().mockReturnValue('mocked');
const { root, spies, setProps, waitForChanges } = await render(
  <my-button variant="primary">Click me</my-button>,
  {
    spyOn: {
      methods: ['handleClick'],
      mocks: { fetchData: fetchMock },
      props: ['variant'],
    },
  }
);

// Trigger some calls
root.shadowRoot?.querySelector('button')?.click();
await setProps({ variant: 'danger' });

// Reset everything
spies?.resetAll();

// Call histories cleared
expect(spies?.methods.handleClick).toHaveBeenCalledTimes(0);
expect(spies?.props.variant).toHaveBeenCalledTimes(0);

// Mock implementations reset to default (returns undefined)
expect(fetchMock()).toBeUndefined();
```

## Nested Components

When the root element is not a custom element, or when you have multiple custom elements, use `getComponentSpies()` to retrieve spies for specific elements:

```tsx
import { render, getComponentSpies, h, describe, it, expect } from '@stencil/vitest';

describe('nested components', () => {
  it('spies on nested elements', async () => {
    // Root is a div, not a custom element
    const { root } = await render(
      <div>
        <my-button>Click me</my-button>
      </div>,
      {
        spyOn: { methods: ['handleClick'] },
      }
    );

    // Query the nested custom element
    const button = root.querySelector('my-button') as HTMLElement;

    // Get spies for the nested element
    const buttonSpies = getComponentSpies(button);
    expect(buttonSpies?.methods.handleClick).toBeDefined();
  });

  it('has independent spies for multiple instances', async () => {
    const { root } = await render(
      <div>
        <my-button class="a">A</my-button>
        <my-button class="b">B</my-button>
      </div>,
      { spyOn: { methods: ['handleClick'] } }
    );

    const spiesA = getComponentSpies(root.querySelector('.a') as HTMLElement);
    const spiesB = getComponentSpies(root.querySelector('.b') as HTMLElement);

    // Each has its own spy instance
    root.querySelector('.a')?.shadowRoot?.querySelector('button')?.click();
    expect(spiesA?.methods.handleClick).toHaveBeenCalledTimes(1);
    expect(spiesB?.methods.handleClick).toHaveBeenCalledTimes(0);
  });
});
```

## Per-Component Configurations

When rendering multiple component types, use the `components` property for tag-specific spy configs:

```tsx
import { render, getComponentSpies, h, describe, it, expect } from '@stencil/vitest';

describe('my-card with my-button', () => {
  it('applies different spy configs per component', async () => {
    const { root } = await render(
      <my-card cardTitle="Test">
        <my-button slot="footer">Click me</my-button>
      </my-card>,
      {
        spyOn: {
          lifecycle: ['componentDidLoad'], // base - applies to all
          components: {
            'my-card': { props: ['cardTitle'] },
            'my-button': { methods: ['handleClick'] },
          },
        },
      }
    );

    const cardSpies = getComponentSpies(root);
    const buttonSpies = getComponentSpies(
      root.querySelector('my-button') as HTMLElement
    );

    // Both get base lifecycle spy + their specific config
    expect(cardSpies?.lifecycle.componentDidLoad).toHaveBeenCalled();
    expect(cardSpies?.props.cardTitle).toBeDefined();

    expect(buttonSpies?.lifecycle.componentDidLoad).toHaveBeenCalled();
    expect(buttonSpies?.methods.handleClick).toBeDefined();
  });
});
```

## SpyOn Options Reference

| Option | Type | Description |
| ------ | ---- | ----------- |
| `methods` | `string[]` | Array of method names to spy on (calls original) |
| `mocks` | `Record<string, Mock>` | Object mapping method names to mock functions |
| `props` | `string[]` | Array of prop names to spy on changes |
| `lifecycle` | `string[]` | Array of lifecycle method names to spy on |
| `components` | `Record<string, SpyOnOptions>` | Per-tag spy configurations |

## Spies Return Object

| Property | Type | Description |
| -------- | ---- | ----------- |
| `methods` | `Record<string, Mock>` | Spies for methods |
| `mocks` | `Record<string, Mock & { original?: Function }>` | Mocks with access to originals |
| `props` | `Record<string, Mock>` | Spies for prop setters |
| `lifecycle` | `Record<string, Mock>` | Spies for lifecycle methods |
| `resetAll` | `() => void` | Reset all spies and mocks |
