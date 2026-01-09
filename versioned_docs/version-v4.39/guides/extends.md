---
title: Extends & Mixins
sidebar_label: Extends & Mixins
description: Using extends and Mixin() to organize component logic with controllers
slug: /extends
---

# Extends & Mixins

As of v4.37.0, Stencil supports class inheritance (`extends`) and mixin composition (`Mixin()`). These features let you move logic out of components into reusable controller classes.

Instead of putting all your logic directly in components, you can extract it into separate controller classes. This makes your code reusable, testable, and easier to maintain.

## Two Approaches

### Inheritance (Mixins)

Use `Mixin()` to compose multiple controllers into your component:

```typescript
@Component({ tag: 'my-component' })
export class MyComponent extends Mixin(
  ValidationControllerMixin, 
  FocusControllerMixin
) {
  componentDidLoad() {
    super.componentDidLoad(); // Required!
    // Your logic here
  }
  
  // All mixin methods are directly available
  private onBlur = () => {
    this.handleBlur();
    this.validate(this.values);
  };
}
```

:::note
With mixins, watch out for API collisions. Methods or properties with the same name can exist at different levels of the inheritance hierarchy, which can cause unexpected behavior.
:::

### Composition

Extend `ReactiveControllerHost` and add controller instances:

```typescript
@Component({ tag: 'my-component' })
export class MyComponent extends ReactiveControllerHost {
  private validationController = new ValidationController(this);
  private focusController = new FocusController(this);
  
  constructor() {
    super();
    this.addController(this.validationController);
    this.addController(this.focusController);
  }
  
  componentDidLoad() {
    super.componentDidLoad(); // Required!
    // Your logic here
  }
  
  // Only expose what you need
  getValidationState() {
    return this.validationController.getValidationState();
  }
}
```

## ReactiveControllerHost

When using the composition pattern, components extend `ReactiveControllerHost`, which automatically manages the lifecycle methods. Here's what it looks like:

```typescript
export interface ReactiveController {
  hostConnected?(): void;
  hostDisconnected?(): void;
  hostWillLoad?(): Promise<void> | void;
  hostDidLoad?(): void;
  hostWillRender?(): Promise<void> | void;
  hostDidRender?(): void;
  hostWillUpdate?(): Promise<void> | void;
  hostDidUpdate?(): void;
}

export class ReactiveControllerHost implements ComponentInterface {
  controllers = new Set<ReactiveController>();

  addController(controller: ReactiveController) {
    this.controllers.add(controller);
  }

  componentDidLoad() {
    this.controllers.forEach((controller) => controller.hostDidLoad?.());
  }
  // ... other lifecycle methods
}
```

## Quick Comparison

| Aspect | Mixins | Composition |
|--------|--------|-------------|
| API Surface | More prone to collisions | Controlled, explicit |
| Method Discovery | Harder to find where methods come from | Clear, explicit delegation |
| Setup | Simple, direct access | More boilerplate |
| Testing | Harder to test in isolation | Controllers are independent and testable |
| Maintenance | Gets complex with many mixins | Easier to maintain and extend |

For more examples, see the [test cases in the Stencil repository](https://github.com/stenciljs/core/tree/main/test/wdio/ts-target).

