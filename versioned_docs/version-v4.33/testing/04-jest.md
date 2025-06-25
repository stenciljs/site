---
title: Jest
position: 6
---

# Overview

Stencil provides a Jest runner specifically designed for testing Stencil components with **Jest v30 and later**. This runner integrates Stencil's testing platform with Jest, allowing you to write unit tests for your Stencil components using familiar Jest syntax while leveraging Stencil's powerful testing capabilities.

:::note
**For Jest v29 and earlier**: If you're using Jest v29 or an earlier version, please continue to use the [Stencil Test Runner](./stencil-testrunner/01-overview.md) as it's specifically designed for those versions.
:::

## Features

- 🚀 **Jest v30+ Support** - Compatible with the latest Jest version
- 🎯 **Stencil Integration** - Uses Stencil's own testing platform and DOM mocking  
- 🔧 **TypeScript Support** - Full TypeScript support with proper type definitions
- 🎨 **Custom Matchers** - Additional Jest matchers for HTML and component testing
- 📱 **Component Testing** - Test Stencil components in isolation with `newSpecPage()`
- 📸 **Shadow DOM Testing** - Full support for testing and snapshotting Shadow DOM content

## Installation

Install the Jest runner as a development dependency:

```bash
npm install --save-dev jest-stencil-runner
```

## Configuration

Create a `jest.config.js` file in your project root:

```javascript
const { createJestStencilPreset } = require('jest-stencil-runner/preset');

module.exports = createJestStencilPreset({
  rootDir: __dirname,
  // Add any additional Jest configuration here
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ]
});
```

### TypeScript Configuration

Ensure your `tsconfig.json` includes the necessary types:

```json
{
  "compilerOptions": {
    "types": ["jest", "jest-stencil-runner"]
  }
}
```

## Basic Usage

### Testing Components

Test your Stencil components using the `newSpecPage()` utility:

```tsx
import { newSpecPage } from 'jest-stencil-runner';
import { MyButton } from './my-button';

describe('my-button', () => {
  it('renders with correct structure', async () => {
    const { root } = await newSpecPage({
      components: [MyButton],
      html: '<my-button variant="primary">Click me</my-button>',
    });

    // Test HTML structure with shadow DOM
    expect(root).toEqualHtml(`
      <my-button variant="primary">
        <template shadowrootmode="open">
          <button class="btn btn--primary">
            Click me
          </button>
        </template>
      </my-button>
    `);

    // Test specific elements and classes
    const button = root.shadowRoot.querySelector('button');
    expect(button).toHaveClasses(['btn', 'btn--primary']);
    expect(button).toEqualText('Click me');
  });
});
```

### Using JSX Templates

You can also use JSX templates instead of HTML strings:

```tsx
import { h } from '@stencil/core';
import { newSpecPage } from 'jest-stencil-runner';
import { MyComponent } from './my-component';

describe('my-component', () => {
  it('renders with JSX template', async () => {
    const { root } = await newSpecPage({
      components: [MyComponent],
      template: () => <my-component first="John" last="Doe"></my-component>,
    });

    expect(root).toEqualHtml(`
      <my-component>
        <template shadowrootmode="open">
          <div>
            Hello, World! I'm John Doe
          </div>
        </template>
      </my-component>
    `);
  });
});
```

## API Reference

### `newSpecPage(options)`

Creates a new spec page for unit testing Stencil components.

**Parameters:**
- `options.components` - Array of component classes to register
- `options.html` - Initial HTML content for the page
- `options.template` - Function that returns JSX template
- `options.includeAnnotations` - Whether to include Stencil annotations

**Returns:** `Promise<SpecPage>`

**SpecPage Properties:**
- `root` - The root element of the component
- `doc` - The document object
- `win` - The window object
- `body` - The document body

**SpecPage Methods:**
- `setContent(html: string)` - Set the page HTML content
- `waitForChanges()` - Wait for component re-renders

## Custom Jest Matchers

The runner includes comprehensive Jest matchers for component testing:

### HTML Matchers

#### `toEqualHtml(html)`

Compares HTML content, including shadow DOM, with normalized whitespace:

```typescript
expect(element).toEqualHtml(`
  <my-component>
    <template shadowrootmode="open">
      <div class="container">
        <span>Content</span>
      </div>
    </template>
  </my-component>
`);
```

#### `toEqualLightHtml(html)`

Compares only the light DOM (excluding shadow DOM):

```typescript
expect(element).toEqualLightHtml(`
  <my-component first="John" last="Doe"></my-component>
`);
```

### Text Matchers

#### `toEqualText(text)`

Compares the text content of an element:

```typescript
expect(element).toEqualText('Hello World');
expect(shadowElement).toEqualText('Button Label');
```

### Attribute Matchers

#### `toHaveAttribute(attributeName)`

Checks if an element has a specific attribute:

```typescript
expect(element).toHaveAttribute('disabled');
expect(element).toHaveAttribute('data-testid');
expect(element).not.toHaveAttribute('hidden');
```

#### `toEqualAttribute(attributeName, value)`

Checks if an element has a specific attribute with an exact value:

```typescript
expect(element).toEqualAttribute('role', 'button');
expect(element).toEqualAttribute('aria-label', 'Close dialog');
expect(element).toEqualAttribute('data-count', '5');
```

#### `toEqualAttributes(attributes)`

Checks multiple attributes and their values at once:

```typescript
expect(element).toEqualAttributes({
  'role': 'button',
  'aria-label': 'Submit form',
  'data-testid': 'submit-btn',
  'disabled': ''
});
```

### Class Matchers

#### `toHaveClass(className)`

Checks if an element has a specific CSS class:

```typescript
expect(element).toHaveClass('active');
expect(element).toHaveClass('btn-primary');
expect(element).not.toHaveClass('disabled');
```

#### `toHaveClasses(classNames)`

Checks if an element has all specified CSS classes:

```typescript
expect(element).toHaveClasses(['btn', 'btn-primary', 'btn-large']);
expect(element).toHaveClasses(['container', 'container--focused']);
```

#### `toMatchClasses(classNames)`

Checks if an element has exactly the specified CSS classes:

```typescript
expect(element).toMatchClasses(['btn', 'btn-primary']);
// This would fail if element also had additional classes
```

### Event Matchers

These matchers work with EventSpy objects for testing custom events:

#### `toHaveReceivedEvent()`

Checks if an event has been received at least once:

```typescript
expect(eventSpy).toHaveReceivedEvent();
```

#### `toHaveReceivedEventTimes(count)`

Checks if an event has been received a specific number of times:

```typescript
expect(eventSpy).toHaveReceivedEventTimes(3);
expect(eventSpy).toHaveReceivedEventTimes(0); // No events received
```

#### `toHaveReceivedEventDetail(detail)`

Checks if the last received event has the expected detail data:

```typescript
expect(eventSpy).toHaveReceivedEventDetail({
  value: 'test',
  timestamp: expect.any(Number)
});
```

## Advanced Examples

### Testing Component Properties

```tsx
describe('my-button properties', () => {
  it('renders with different variants', async () => {
    const { root } = await newSpecPage({
      components: [MyButton],
      html: '<my-button variant="danger" size="large">Delete</my-button>',
    });
    
    expect(root).toHaveAttribute('variant');
    expect(root).toEqualAttribute('variant', 'danger');
    
    const button = root.shadowRoot.querySelector('button');
    expect(button).toHaveClasses(['btn', 'btn--danger', 'btn--large']);
  });
});
```

### Testing Events

```tsx
describe('my-button events', () => {
  it('emits click event with correct details', async () => {
    const { root, waitForChanges } = await newSpecPage({
      components: [MyButton],
      html: '<my-button>Click me</my-button>',
    });
    
    const events = [];
    root.addEventListener('buttonClick', (e) => {
      events.push(e);
    });
    
    // Trigger click
    const button = root.shadowRoot.querySelector('button');
    button.click();
    await waitForChanges();
    
    expect(events).toHaveLength(1);
    expect(events[0].detail).toEqual({
      clicked: true,
      timestamp: expect.any(Number)
    });
  });
});
```

### Testing Dynamic Changes

```tsx
describe('my-component dynamic behavior', () => {
  it('updates when properties change', async () => {
    const { root, waitForChanges } = await newSpecPage({
      components: [MyComponent],
      html: '<my-component first="John"></my-component>',
    });
    
    // Initial state
    expect(root).toEqualText('Hello, World! I\'m John');
    
    // Update property
    root.first = 'Jane';
    await waitForChanges();
    
    // Verify update
    expect(root).toEqualText('Hello, World! I\'m Jane');
  });
});
```

### Snapshot Testing

```tsx
describe('my-component snapshots', () => {
  it('matches snapshot', async () => {
    const { root } = await newSpecPage({
      components: [MyComponent],
      html: '<my-component first="Test" last="User"></my-component>',
    });
    
    expect(root).toMatchSnapshot();
  });
  
  it('matches inline snapshot', async () => {
    const { root } = await newSpecPage({
      components: [MyComponent],
      html: '<my-component first="Inline" last="Test"></my-component>',
    });
    
    expect(root).toMatchInlineSnapshot(`
      <my-component first="Inline" last="Test">
        <template shadowrootmode="open">
          <div>
            Hello, World! I'm Inline Test
          </div>
        </template>
      </my-component>
    `);
  });
});
```

## Running Tests

Add test scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

Run tests with:

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Configuration Options

### Advanced Jest Configuration

```javascript
const { createJestStencilPreset } = require('jest-stencil-runner/preset');

module.exports = createJestStencilPreset({
  rootDir: __dirname,
  
  // Coverage options
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Test matching
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  
  // Module configuration
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Additional Jest options
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts']
});
```

## Troubleshooting

### Common Issues

1. **Module resolution errors**: Ensure your `tsconfig.json` has proper module resolution settings
2. **Component not rendering**: Make sure components are properly registered in the `components` array
3. **Async issues**: Always use `await page.waitForChanges()` after making changes
4. **Shadow DOM access**: Use `root.shadowRoot.querySelector()` to access shadow DOM elements

### Debug Mode

Enable debug logging by setting the `DEBUG` environment variable:

```bash
DEBUG=jest-stencil-runner npm test
```

## Migration from Stencil Test Runner

If migrating from the Stencil Test Runner to Jest Runner, the main differences are:

1. **Configuration**: Use `createJestStencilPreset()` instead of Stencil's built-in Jest configuration
2. **Import**: Import `newSpecPage` from `jest-stencil-runner` instead of `@stencil/core/testing`
3. **Matchers**: Access to additional custom matchers for more comprehensive testing
4. **Jest Version**: Requires Jest v30+ (use Stencil Test Runner for Jest v29 and earlier)

The API for `newSpecPage()` remains largely the same, making migration straightforward.

