---
title: Extends & Mixins
sidebar_label: Extends & Mixins
description: Using extends and Mixin() to organize component logic with controllers
slug: /extends
---

# Extends & Mixins

As of v4.37.0, Stencil supports class inheritance (`extends`) and mixin composition (`Mixin()`). With the help of these features, you can move logic out of components into reusable controller classes.

## Why Controllers?

Instead of putting all your logic directly in components, you can extract it into separate controller classes. This makes your code:

- **Reusable** - Share controllers across multiple components
- **Testable** - Test controllers independently
- **Maintainable** - Centralize behavior changes

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

The `ReactiveControllerHost` base class automatically manages controller lifecycles:

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
| API Surface | All mixin methods exposed | Only what you expose |
| Setup | Simple, direct access | More boilerplate |
| Scalability | Gets complex with many mixins | Scales better |
| API Control | Less control | Full control |

## Which Should I Use?

- **Small project, same controllers everywhere?** → Use Mixins
- **Large project, different controller combos?** → Use Composition
- **Need strict API control?** → Use Composition
- **Want minimal boilerplate?** → Use Mixins

For more examples, see the [test cases in the Stencil repository](https://github.com/stenciljs/core/tree/main/test/wdio/ts-target).

