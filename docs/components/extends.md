---
title: Extends & Mixins
sidebar_label: Extends & Mixins
description: Using extends and Mixin() to organize component logic with controllers
slug: /extends
---

# Extends & Mixins

As of v4.37.0, Stencil has support for class inheritance (`extends`) and mixin composition (`Mixin()`). Together, `extends` and `Mixin()` enable a powerful architectural pattern: **moving logic out of components into reusable helper classes, commonly called controllers**. Mixins allow for multiple inheritance, enabling components to inherit from multiple base classes simultaneously.

Controllers are separate classes that house behavior and can be shared across many components. They can be integrated into components using three primary approaches:

1. **Single Inheritance**: Using `extends` to inherit from a single controller base class (when you only need one controller)
2. **Multiple Inheritance (Mixins)**: Using Stencil's `Mixin()` function to compose multiple controller behaviors into a single base class via multiple inheritance (when you need multiple controllers)
3. **Composition**: Using controller instances within components that extend a stable base class like `ReactiveControllerHost`

This pattern provides several key benefits:
- **Separation of concerns**: Business logic lives in controllers, not components
- **Reusability**: Controllers can be shared across multiple components
- **Testability**: Controllers can be tested independently of components
- **Maintainability**: Changes to behavior are centralized in controller classes

This document compares inheritance-based and composition-based patterns at scale, examining how each approach performs when building a component library with many components and controllers.

## Overview

Both patterns achieve the same functional goal: providing validation and focus management to form components. More importantly, both patterns achieve the original goal of moving logic out of components into separate, reusable controller classes. However, they differ significantly in their architecture, API surface, and how they scale.

### Inheritance Pattern (via Mixin)

**Location**: `test/wdio/ts-target/extends-inheritance-scaling/`

**Architecture**:
```
CheckboxGroupCmp
  └─ extends FormFieldBase (optional convenience layer)
       └─ extends Mixin(ValidationControllerMixin, FocusControllerMixin)
            └─ ValidationControllerMixin (manages validation state)
            └─ FocusControllerMixin (manages focus state)
```

**Alternative (Direct Mixin Usage)**:
```
CheckboxGroupCmp
  └─ extends Mixin(ValidationControllerMixin, FocusControllerMixin)
       └─ (bypasses FormFieldBase entirely)
```

**Key Characteristics**:
- Uses Stencil's `Mixin()` function for multiple inheritance
- Controllers are implemented as mixin factories that return classes
- All public/protected methods from mixins are accessible
- Lifecycle methods are automatically merged from all mixins
- `FormFieldBase` is optional - components can use mixins directly

### Composition Pattern

**Location**: `test/wdio/ts-target/extends-composition-scaling/`

**Architecture**:
```
CheckboxGroupCmp
  └─ extends ReactiveControllerHost
       └─ composes ValidationController (as instance)
       └─ composes FocusController (as instance)
```

**Key Characteristics**:
- Components extend `ReactiveControllerHost` - a stable base class that doesn't change over time
- The inheritance chain is always just one level (component → ReactiveControllerHost), it never grows
- All functionality is added through composition (adding controller instances), not inheritance
- Only explicitly exposed methods are accessible
- Lifecycle methods are automatically called via ReactiveControllerHost
- Controllers are loosely coupled through composition

**ReactiveControllerHost Implementation**:

The `ReactiveControllerHost` base class provides automatic lifecycle management for controllers:

```typescript
import { ComponentInterface } from "@stencil/core";

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

  removeController(controller: ReactiveController) {
    this.controllers.delete(controller);
  }

  connectedCallback() {
    this.controllers.forEach((controller) => controller.hostConnected?.());
  }

  disconnectedCallback() {
    this.controllers.forEach((controller) => controller.hostDisconnected?.());
  }

  componentWillLoad() {
    this.controllers.forEach((controller) => controller.hostWillLoad?.());
  }

  componentDidLoad() {
    this.controllers.forEach((controller) => controller.hostDidLoad?.());
  }

  componentWillRender() {
    this.controllers.forEach((controller) => controller.hostWillRender?.());
  }

  componentDidRender() {
    this.controllers.forEach((controller) => controller.hostDidRender?.());
  }

  componentWillUpdate() {
    this.controllers.forEach((controller) => controller.hostWillUpdate?.());
  }

  componentDidUpdate() {
    this.controllers.forEach((controller) => controller.hostDidUpdate?.());
  }
}
```

## Key Differences

### 1. Method Visibility and API Surface

#### Inheritance Pattern (via Mixin)

**Characteristic**: All methods from all mixins are accessible in the component.

```typescript
// In ValidationControllerMixin (public methods)
setValidationCallback()
validate()
getValidationState()
getValidationMessageData()
resetValidation()

// In FocusControllerMixin (public methods)
handleFocus()
handleBlur()
getFocusState()
resetFocusTracking()

// In FormFieldBase (optional convenience methods)
handleFocusEvent()  // Wrapper for handleFocus()
handleBlurEvent()   // Wrapper that calls handleBlur() + validate()

// All accessible in CheckboxGroupCmp!
```

**Impact**: 
- ✅ Easy access to all functionality
- ✅ Clean multiple inheritance via `Mixin()`
- ❌ Large API surface that grows with mixin changes
- ❌ Potential for accidental coupling
- ❌ Harder to control what's exposed

#### Composition Pattern

**Solution**: Only explicitly exposed methods are accessible.

```typescript
// Controllers are private instances
private validationController: ValidationController;
private focusController: FocusController;

// Controllers use forceUpdate() directly
// In ValidationController:
forceUpdate(this.host);

// Only methods you explicitly expose are public
getValidationState() {
  return this.validationController.getValidationState();
}
```

**Impact**:
- ✅ Controlled API surface
- ✅ Explicit interface design
- ✅ Base class changes don't automatically leak
- ❌ More boilerplate to expose methods

### 2. Inheritance Chain Depth

#### Inheritance Pattern (via Mixin)

**Characteristic**: When multiple mixins are combined via `Mixin()`, they all share the same API on the component.

```typescript
CheckboxGroupCmp
  └─ extends FormFieldBase
       └─ extends Mixin(ValidationControllerMixin, FocusControllerMixin)
            └─ ValidationControllerMixin (all methods leak to component)
            └─ FocusControllerMixin (all methods leak to component)
```

**Impact**:
- ❌ When you combine multiple mixins, all their methods become part of the component's API
- ❌ If using a shared base class that combines many mixins, all components extending that base inherit all mixin methods (even if not needed)
- ❌ You can use mixins directly per component, but this adds complexity to component definitions
- ❌ Method resolution becomes more complex when multiple mixins are combined
- ❌ Harder to reason about which methods come from which mixin

#### Composition Pattern

**Characteristic**: Inheritance chain stays flat - always just one level.

```typescript
CheckboxGroupCmp
  └─ extends ReactiveControllerHost (stable, never changes)
       └─ composes ValidationController (instance)
       └─ composes FocusController (instance)
```

**Impact**:
- ✅ Inheritance chain is always one level (component → ReactiveControllerHost)
- ✅ `ReactiveControllerHost` is a stable base API that doesn't change over time
- ✅ All functionality is added through composition (adding controller instances)
- ✅ No inheritance chain depth concerns regardless of how many controllers you add
- ✅ Method resolution is always straightforward

### 3. Lifecycle Management

#### Inheritance Pattern (via Mixin)

```typescript
// Each mixin defines its own lifecycle methods
// Stencil's Mixin() automatically merges them

// In ValidationControllerMixin:
componentDidLoad() {
  super.componentDidLoad?.(); // Calls previous mixin/base
  this.setupValidation();
}

// In FocusControllerMixin:
componentDidLoad() {
  super.componentDidLoad?.(); // Calls ValidationControllerMixin's componentDidLoad
  this.setupFocusTracking();
}

// Components can optionally override (but must call super() if they do)
componentDidLoad() {
  super.componentDidLoad(); // Required! Calls all mixin lifecycle methods
  // Component-specific logic here
}
```

**Characteristics**:
- Automatic lifecycle merging via `Mixin()`
- Each mixin's lifecycle methods are called in mixin order
- **Components must call `super()` if they override lifecycle methods** - this is standard JavaScript inheritance pattern
- Same `super()` requirement as composition approach - both patterns follow normal class inheritance rules
- No need to manually chain controller lifecycle methods

#### Composition Pattern

```typescript
// ReactiveControllerHost automatically calls lifecycle methods
// Components must call super() to trigger controller lifecycle hooks

// In ReactiveControllerHost:
componentDidLoad() {
  this.controllers.forEach(controller => {
    if (controller.hostDidLoad) {
      controller.hostDidLoad();
    }
  });
}

// In component (must call super):
componentDidLoad() {
  super.componentDidLoad(); // Required! Triggers controller lifecycle hooks
  // Component-specific logic here
}
```

**Characteristics**:
- Automatic lifecycle management for controllers
- **Components must call `super()` in lifecycle methods** - this is standard JavaScript inheritance pattern
- Same `super()` requirement as mixin approach - both patterns follow normal class inheritance rules
- No need to manually call individual controller lifecycle methods
- Adding new controllers automatically gets lifecycle hooks (as long as `super()` is called)

### 4. Adding New Controllers

#### Inheritance Pattern (via Mixin)

**Adding a third controller (e.g., `AccessibilityControllerMixin`)**:

**Option 1: Update FormFieldBase (all components get it)**
1. Create `AccessibilityControllerMixin` factory
2. Update `FormFieldBase`:
   ```typescript
   export class FormFieldBase extends Mixin(
     ValidationControllerMixin, 
     FocusControllerMixin,
     AccessibilityControllerMixin  // Add here
   ) { ... }
   ```
3. All components extending `FormFieldBase` automatically get it

**Option 2: Use mixins directly (component-specific)**
1. Create `AccessibilityControllerMixin` factory
2. Component uses mixins directly:
   ```typescript
   export class MyComponent extends Mixin(
     ValidationControllerMixin,
     AccessibilityControllerMixin  // Only this component gets it
   ) { ... }
   ```

**Scaling Characteristics**:
- ✅ Clean multiple inheritance via `Mixin()`
- ✅ Can mix and match controllers per component (if using mixins directly)
- ❌ If using `FormFieldBase`, all components get all controllers
- ✅ Lifecycle methods automatically merged - no manual chaining needed

#### Composition Pattern

**Adding a third controller (e.g., `AccessibilityController`)**:

1. Create `AccessibilityController` class
2. Add it to the component that needs it:
   ```typescript
   private accessibilityController = new AccessibilityController(this);
   ```
3. Register it in constructor:
   ```typescript
   this.addController(this.accessibilityController);
   ```
4. Done! Lifecycle is automatic.

**Scaling Benefits**:
- Each component only includes controllers it needs
- Easy to mix and match controllers
- No base class modifications needed
- Controllers are independent and composable


## Scaling Comparison

The number of controllers typically scales with the number of components. You don't start needing many controllers until you have many components. Here's how each pattern performs at different scales:

### Small Component Library (5-10 components, 2-3 controllers)

Both patterns work well at this scale. The differences are subtle but important:
- **Inheritance**: Simpler setup, all methods directly accessible. Base classes with 2-3 mixins are manageable, or you can use mixins directly.
- **Composition**: More explicit, better encapsulation. Slightly more boilerplate but still reasonable.

**Recommendation**: Either pattern works. Choose based on team preference and future growth plans.

### Mid-Size Component Library (30 components, 4-6 controllers)

**Inheritance Pattern (via Mixin) Challenges**:
- Base classes with 4-6 mixins become harder to manage
- Components extending a base class inherit all mixins from that base (even if unused)
- Using mixins directly provides flexibility but adds complexity to component definitions
- Mixin merging makes debugging harder (methods from multiple sources)
- Harder to test individual mixins in isolation
- API surface grows significantly with each mixin

**Composition Pattern Advantages**:
- Each component only includes needed controllers
- Controllers remain independent and testable
- Easy to create component-specific controller combinations
- No base class bloat
- **Stable inheritance chain** - always just `extends ReactiveControllerHost`, never grows
- Controlled API surface regardless of controller count

**Recommendation**: Composition pattern starts to show clear advantages at this scale.

### Large Component Library (50+ components, 8+ controllers)

**Inheritance Pattern (via Mixin) Challenges**:
- Base classes with 8+ mixins become unwieldy (you can create multiple base classes, but this fragments the inheritance structure)
- Deep inheritance chains make method resolution harder to reason about
- Components inheriting from a base class get all mixins from that base, creating unnecessary bloat
- Debugging becomes significantly more complex
- Testing mixins in isolation is very difficult
- API surface explosion - every mixin method leaks onto every component

**Composition Pattern Advantages**:
- Scales gracefully - no inheritance chain depth concerns
- **Inheritance chain stays flat** - always `extends ReactiveControllerHost` (stable base API)
- Each component only includes controllers it actually needs
- Controllers remain independent and easily testable
- Clear separation makes debugging straightforward
- Easy to add/remove controllers without affecting others
- Controlled API surface prevents accidental coupling

**Recommendation**: Composition pattern is strongly recommended for large component libraries.

## When to Use Each Pattern

### Use Inheritance (Mixin) When:

**Project Characteristics:**
- ✅ You have a small, fixed set of controllers (2-4 controllers)
- ✅ All or most components need the same controllers
- ✅ You want the simplest possible API with direct method access
- ✅ You're building a cohesive component family with shared functionality
- ✅ You prioritize developer convenience over API control

**Technical Requirements:**
- ✅ You want minimal boilerplate in components
- ✅ Direct method access (`this.validate()`) is preferred over delegation
- ✅ You're comfortable with mixin methods being part of component's public API
- ✅ You want automatic lifecycle merging without manual setup
- ✅ You need TypeScript-friendly multiple inheritance

**Avoid Inheritance When:**
- ❌ You need strict API control and encapsulation
- ❌ Components need significantly different controller combinations
- ❌ You have many controllers (5+) that would bloat the base class
- ❌ You need to test controllers in isolation frequently
- ❌ You want to hide internal implementation details

### Use Composition When:

**Project Characteristics:**
- ✅ You have many controllers (4+ controllers)
- ✅ Components need different controller combinations
- ✅ You want explicit API control and encapsulation
- ✅ You're building a flexible component library
- ✅ You prioritize maintainability and testability

**Technical Requirements:**
- ✅ You need strict control over component's public API
- ✅ You want to hide internal controller implementation details
- ✅ You need to easily test controllers in isolation
- ✅ You want loose coupling between controllers
- ✅ You need per-component controller selection

**Avoid Composition When:**
- ❌ You have a very small, fixed set of controllers (1-2 controllers)
- ❌ All components need exactly the same controllers
- ❌ You want the absolute minimum boilerplate
- ❌ Direct method access is more important than encapsulation
- ❌ The additional abstraction layer provides no benefit

## Code Examples

### Inheritance Pattern (via Mixin) - Component

**Using FormFieldBase (convenience layer)**:
```typescript
@Component({ tag: 'inheritance-checkbox-group' })
export class CheckboxGroupCmp extends FormFieldBase {
  // All mixin methods available via FormFieldBase
  // Lifecycle methods automatically merged from mixins
  
  // If overriding lifecycle methods, must call super()
  componentDidLoad() {
    super.componentDidLoad(); // Required! Calls all mixin lifecycle methods
    // Component-specific logic here
  }
  
  private onFocus = () => {
    this.handleFocusEvent(); // Convenience method from FormFieldBase
  };
  
  private onBlur = () => {
    this.handleBlurEvent(this.values); // Convenience method from FormFieldBase
  };
}
```

**Using Mixins Directly**:
```typescript
@Component({ tag: 'inheritance-checkbox-group' })
export class CheckboxGroupCmp extends Mixin(
  ValidationControllerMixin, 
  FocusControllerMixin
) {
  // All mixin methods directly available
  
  // If overriding lifecycle methods, must call super()
  componentDidLoad() {
    super.componentDidLoad(); // Required! Calls all mixin lifecycle methods
    // Component-specific logic here
  }
  
  private onFocus = () => {
    this.handleFocus(); // Direct from FocusControllerMixin
  };
  
  private onBlur = () => {
    this.handleBlur(); // Direct from FocusControllerMixin
    this.validate(this.values); // Direct from ValidationControllerMixin
  };
}
```

### Composition Pattern - Component

```typescript
@Component({ tag: 'composition-checkbox-group' })
export class CheckboxGroupCmp extends ReactiveControllerHost {
  private validationController = new ValidationController(this);
  private focusController = new FocusController(this);
  
  constructor() {
    super(); // Required! Standard JavaScript inheritance pattern
    this.addController(this.validationController);
    this.addController(this.focusController);
  }
  
  // If overriding lifecycle methods, must call super()
  componentDidLoad() {
    super.componentDidLoad(); // Required! Triggers controller lifecycle hooks
    // Component-specific logic here
  }
  
  // Only explicitly exposed methods are public
  private onFocus = () => {
    this.focusController.handleFocus();
  };
  
  private onBlur = () => {
    this.focusController.handleBlur();
    this.validationController.handleBlur(this.values);
  };
}
```

For more detailed examples of both inheritance and composition patterns, see the test cases in the [Stencil Core Repository](https://github.com/stenciljs/core/tree/main/test/wdio/ts-target).

