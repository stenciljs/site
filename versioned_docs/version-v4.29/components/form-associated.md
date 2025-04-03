---
title: Form-Associated Components
sidebar_label: Form-Associated Components
description: Form-Associated Stencil Components
slug: /form-associated
---

# Building Form-Associated Components in Stencil

As of v4.5.0, Stencil has support for form-associated custom elements. This
allows Stencil components to participate in a rich way in HTML forms,
integrating with native browser features for validation and accessibility while
maintaining encapsulation and control over their styling and presentation.

:::caution
Browser support for the APIs that this feature depends on is still not
universal[^1] and the Stencil team has no plans at present to support or
incorporate any polyfills for the browser functionality. Before you ship
form-associated Stencil components make sure that the browsers you need to
support have shipped the necessary APIs.
:::

## Creating a Form-Associated Component

A form-associated Stencil component is one which sets the new [`formAssociated`](./component.md#formassociated)
option in the argument to the `@Component`
decorator to `true`, like so:

```tsx
import { Component } from '@stencil/core';

@Component({
  tag: 'my-face',
  formAssociated: true,
})
export class MyFACE {
}
```

This element will now be marked as a form-associated custom element via the
[`formAssociated`](https://html.spec.whatwg.org/#custom-elements-face-example)
static property, but by itself this is not terribly useful.

In order to meaningfully interact with a `<form>` element that is an ancestor
of our custom element we'll need to get access to an
[`ElementInternals`](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals)
object corresponding to our element instance. Stencil provides a decorator,
`@AttachInternals`, which does just this, allowing you to decorate a property on
your component and bind an `ElementInternals` object to that property which you
can then use to interact with the surrounding form.

:::info
Under the hood the `AttachInternals` decorator makes use of the very similarly
named
[`attachInternals`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/attachInternals)
method on `HTMLElement` to associate your Stencil component with an ancestor
`<form>` element. During compilation, Stencil will generate code that calls
this method at an appropriate point in the component lifecycle for both
[lazy](../output-targets/dist.md) and [custom elements](../output-targets/custom-elements.md) builds.
:::

A Stencil component using this API to implement a custom text input could look
like this:

```tsx title="src/components/custom-text-input.tsx"
import { Component, h, AttachInternals, State } from '@stencil/core';

@Component({
  tag: 'custom-text-input',
  shadow: true,
  formAssociated: true
})
export class CustomTextInput {
  @State() value: string;

  @AttachInternals() internals: ElementInternals;

  handleChange(event) {
    this.value = event.target.value;
    this.internals.setFormValue(event.target.value);
  }

  componentWillLoad() {
    this.internals.setFormValue("a default value");
  }

  render() {
    return (
      <input
        type="text"
        value={this.value}
        onInput={(event) => this.handleChange(event)}
      />
    )
  }
}
```

If this component is rendered within a `<form>` element like so:


```html
<form>
  <custom-text-input name="my-custom-input"></custom-text-input>
</form>
```

then it will automatically be linked up to the surrounding form. The
`ElementInternals` object found at `this.internals` will have a bunch of
methods on it for interacting with that form and getting key information out of
it.

In our `<custom-text-input>` example above we use the
[`setFormValue`](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/setFormValue)
method to set a value in the surrounding form. This will read the `name`
attribute off of the element and use it when setting the value, so the value
typed by a user into the `input` will added to the form under the
`"my-custom-input"` name.

This example just scratches the surface, and a great deal more is possible with
the `ElementInternals` API, including [setting the element's
validity](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/setValidity),
reading the validity state of the form, reading other form values, and more.

## Lifecycle Callbacks

Stencil allows developers building form-associated custom elements to define a
[standard series of lifecycle
callbacks](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-reactions)
which enable their components to react dynamically to events in their
lifecycle. These could allow fetching data when a form loads, changing styles
when a form's `disabled` state is toggled, resetting form data cleanly, and more.

### `formAssociatedCallback`

This callback is called when the browser both associates the element with and
disassociates the element from a form element. The function is called with the
form element as an argument. This could be used to set an `ariaLabel` when the
form is ready to use, like so:

```tsx title='src/components/form-associated-cb.tsx'
import { Component, h, AttachInternals } from '@stencil/core';

@Component({
  tag: 'form-associated',
  formAssociated: true,
})
export class FormAssociatedCmp {
  @AttachInternals()
  internals: ElementInternals;

  formAssociatedCallback(form) {
    form.ariaLabel = 'formAssociated called';
  }

  render() {
    return <input type="text" />;
  }
}
```

### `formDisabledCallback`

This is called whenever the `disabled` state on the element _changes_. This
could be used to keep a CSS class in sync with the disabled state, like so:

```tsx title='src/components/form-disabled-cb.tsx'
import { Component, h, State } from '@stencil/core';

@Component({
  tag: 'form-disabled-cb',
  formAssociated: true,
})
export class MyComponent {
  @State() cssClass: string = "";

  formDisabledCallback(disabled: boolean) {
    if (disabled) {
      this.cssClass = "background-mode";
    } else {
      this.cssClass = "";
    }
  }

  render() {
    return <input type="text" class={this.cssClass}></input>
  }
}
```

### `formResetCallback`

This is called when the form is reset, and should be used to reset the
form-associated component's internal state and validation. For example, you
could do something like the following:

```tsx title="src/components/form-reset-cb.tsx"
import { Component, h, AttachInternals } from '@stencil/core';

@Component({
  tag: 'form-reset-cb',
  formAssociated: true,
})
export class MyComponent {
  @AttachInternals()
  internals: ElementInternals;

  formResetCallback() {
    this.internals.setValidity({});
    this.internals.setFormValue("");
  }

  render() {
    return <input type="text"></input>
  }
}
```

### `formStateRestoreCallback`

This method will be called in the event that the browser automatically fills
out your form element, an event that could take place in two different
scenarios. The first is that the browser can restore the state of an element
after navigating or restarting, and the second is that an input was made using a
form auto-filling feature. 

In either case, in order to correctly reset itself your form-associated component
will need the previously selected value, but other state may also be necessary.
For instance, the form value to be submitted for a date picker component would
be a specific date, but in order to correctly restore the component's visual
state it might also be necessary to know whether the picker should display a
week or month view.

The
[`setFormValue`](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/setFormValue)
method on `ElementInternals`  provides some support for this use-case, allowing
you to submit both a _value_ and a _state_, where the _state_ is not added to
the form data sent to the server but could be used for storing some
client-specific state. For instance, a pseudocode sketch of a date picker
component that correctly restores whether the 'week' or 'month' view is active
could look like:

```tsx title="src/components/fa-date-picker.tsx"
import { Component, h, State, AttachInternals } from '@stencil/core';

@Component({
  tag: 'fa-date-picker',
  formAssociated: true,
})
export class MyDatePicker {
  @State() value: string = "";
  @State() view: "weeks" | "months" = "weeks";

  @AttachInternals()
  internals: ElementInternals;

  onInputChange(e) {
    e.preventDefault();
    const date = e.target.value;
    this.setValue(date);
  }

  setValue(date: string) {
    // second 'state' parameter is used to store both
    // the input value (`date`) _and_ the current view
    this.internals.setFormValue(date, `${date}#${this.view}`);
  }

  formStateRestoreCallback(state, _mode) {
    const [date, view] = state.split("#");
    this.view = view;
    this.setValue(date);
  }

  render() {
    return <div>
      Mock Date Picker, mode: {this.view}
      <input class="date-picker" onChange={e => this.onInputChange(e)}></input>
    </div>
  }
}
```

Note that the `formStateRestoreCallback` also receives a second argument,
`mode`, which can be either `"restore"` or `"autocomplete"`, indicating the
reason for the form restoration.

For more on form restoration, including a complete example, check out [this
great blog post on the
subject](https://web.dev/articles/more-capable-form-controls#restoring-form-state).

## Resources

- [WHATWG specification for form-associated custom elements](https://html.spec.whatwg.org/dev/custom-elements.html#form-associated-custom-elements)
- [ElementInternals and Form-Associated Custom Elements](https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/) from the WebKit blog
- [Web.dev post detailing how form-associated lifecycle callbacks work](https://web.dev/articles/more-capable-form-controls#lifecycle_callbacks)

[^1]: See https://caniuse.com/?search=attachInternals for up-to-date adoption estimates.
