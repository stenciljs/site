---
title: Form-Associated Components
sidebar_label: Form-Associated Components
description: Build components that take part in HTML forms like native controls
slug: /form-associated
---

# Form-Associated Components

A form-associated component takes part in an HTML `<form>` like a native control: its value is submitted with the form, it can be required or invalid, and it responds when the form is reset or disabled.

To make a component form-associated, add the [`@AttachInternals()`](./attach-internals.md) decorator. It gives the component an [`ElementInternals`](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) object, which is how it talks to its form.

:::note
You usually need this only for components with [shadow DOM](./styling/01-overview.md#choosing-an-encapsulation-strategy). A `scoped` or `none` component renders its `<input>` into the light DOM, where it's already part of the surrounding form: pass the component's `name` on to it, and the form submits, validates, and disables it with no extra code. Make one of these components form-associated only when the host element itself should act as the control, for example to match `:invalid` or be the target of a `<label>`. In that case, leave `name` off the inner `<input>`, or its value is submitted twice.
:::

## Example

This text input submits its value, and reports itself as invalid when it's `required` and empty:

```tsx title="src/components/my-input/my-input.tsx"
import { AttachInternals, Component, Prop, State } from '@stencil/core';

@Component({
  tag: 'my-input',
  encapsulation: { type: 'shadow' },
})
export class MyInput {
  @AttachInternals() internals: ElementInternals;

  /** Whether the field must have a value. */
  @Prop() required = false;

  @State() value = '';

  private input?: HTMLInputElement;

  componentDidLoad() {
    this.setValue('');
  }

  private setValue(value: string) {
    this.value = value;
    this.internals.setFormValue(value);

    if (this.required && !value) {
      this.internals.setValidity({ valueMissing: true }, 'Please fill in this field.', this.input);
    } else {
      this.internals.setValidity({});
    }
  }

  render() {
    return (
      <input
        ref={(el) => (this.input = el)}
        value={this.value}
        onInput={(ev) => this.setValue((ev.target as HTMLInputElement).value)}
      />
    );
  }
}
```

Use it in a form like any other input:

```html
<form>
  <my-input name="email" required></my-input>
  <button>Submit</button>
</form>
```

- [`setFormValue()`](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/setFormValue) sets the value the form submits, under the element's `name` (`email` here).
- [`setValidity()`](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/setValidity) marks the element valid or invalid. While it's invalid, the element matches `:invalid` in CSS and the form won't submit. On a submit attempt, the browser shows the message at the inner `<input>`, which is passed as the last argument.

`ElementInternals` has more to offer, such as reading the element's `form`, `labels`, and `validity`. See the [MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) for the full API.

## Lifecycle Callbacks

The browser calls these methods on a form-associated component when something happens to it or its form. Define any of them on the component class:

| Callback | Called when |
|---|---|
| `formAssociatedCallback(form)` | The element is added to a form, or removed from one (`form` is then `null`). |
| `formDisabledCallback(disabled)` | The element is disabled or enabled, directly or by a disabled `<fieldset>` around it. |
| `formResetCallback()` | The form is reset. |
| `formStateRestoreCallback(state, mode)` | The browser restores or autofills the element's value. See [below](#restoring-state). |

Adding two of them to the example lets it disable its inner `<input>` along with itself, and clear its value on reset:

```tsx title="src/components/my-input/my-input.tsx"
@State() disabled = false;

formDisabledCallback(disabled: boolean) {
  this.disabled = disabled;
}

formResetCallback() {
  this.setValue('');
}

render() {
  return (
    <input
      ref={(el) => (this.input = el)}
      value={this.value}
      disabled={this.disabled}
      onInput={(ev) => this.setValue((ev.target as HTMLInputElement).value)}
    />
  );
}
```

A disabled element's value isn't submitted, and the element matches `:disabled` in CSS.

### Restoring State

The browser calls `formStateRestoreCallback()` when it fills in the element itself: when restoring a page after navigation, or when autofilling a form. Its `mode` argument is `"restore"` or `"autocomplete"`.

The callback receives the value you passed to `setFormValue()`, unless you also passed a second argument. That second argument, the state, is kept by the browser for restoring but never submitted. Use it for anything the component needs to look right again, such as a date picker's current view:

```tsx title="src/components/my-date-picker/my-date-picker.tsx"
@State() view: 'week' | 'month' = 'week';

private setValue(date: string) {
  // submit the date, and keep the view for restoring
  this.internals.setFormValue(date, `${date}#${this.view}`);
}

formStateRestoreCallback(state: string) {
  const [date, view] = state.split('#');
  this.view = view as 'week' | 'month';
  this.setValue(date);
}
```

## Resources

- [WHATWG specification for form-associated custom elements](https://html.spec.whatwg.org/dev/custom-elements.html#form-associated-custom-elements)
- [ElementInternals and Form-Associated Custom Elements](https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/) from the WebKit blog
- [More capable form controls](https://web.dev/articles/more-capable-form-controls) on web.dev, including lifecycle callbacks and restoring form state
