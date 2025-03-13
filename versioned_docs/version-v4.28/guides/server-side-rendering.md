---
title: Server Side Rendering
sidebar_label: Server Side Rendering
description: Server Side Rendering
slug: /server-side-rendering
---

# Server-Side Rendering (SSR) with Stencil

Stencil provides server-side rendering (SSR) support for React and Vue output targets. If you're using frameworks like [Next.js](https://nextjs.org/) or [Nuxt](https://nuxt.com/), Stencil automatically enhances these frameworks to render components on the server using a [Declarative Shadow DOM](https://web.dev/articles/declarative-shadow-dom).

For detailed setup instructions, refer to the SSR documentation for [React](/docs/react) and [Vue](/docs/vue). All interfaces needed for rendering Stencil components into a string are exported through the [Stencil Hydrate Module](/docs/hydrate-app).

## Tips & Best Practices

When server-side rendering Stencil components, there are a few potential pitfalls you might encounter. To help you avoid these issues, here are some key tips and best practices.

### Avoid Non-Primitive Parameters

When building components, it's common to pass complex data structures like objects to components as props. For example, a footer menu could be structured as an object rather than as separate components for each menu item:

```tsx
const menu = {
    'Overview': ['Introduction', 'Getting Started', 'Component API', 'Guides', 'FAQ'],
    'Docs': ['Framework Integrations', 'Static Site Generation', 'Config', 'Output Targets', 'Testing', 'Core Compiler API'],
    'Community': ['Blog', 'GitHub', 'X', 'Discord']
}
return (
    <nav>
        <footer-navigation items={menu} />
    </nav>
)
```

While this approach works fine in the browser, it poses challenges for SSR. Stencil **does not support** the serialization of complex objects within parameters, so the footer items may not render on the server.

A better approach is to structure dynamic content as part of the component's light DOM rather than passing it as props. This ensures that the framework can fully render the component during SSR, avoiding hydration issues. Here’s an improved version of the example:

```tsx
const menu = {
    'Overview': ['Introduction', 'Getting Started', 'Component API', 'Guides', 'FAQ'],
    'Docs': ['Framework Integrations', 'Static Site Generation', 'Config', 'Output Targets', 'Testing', 'Core Compiler API'],
    'Community': ['Blog', 'GitHub', 'X', 'Discord']
}
return (
    <nav>
        <footer-navigation>
            {Object.entries(menu).map(([section, links]) => (
                <footer-navigation-section>
                    <h2>{section}</h2>
                    {links.map(link => (
                        <footer-navigation-entry href="#/">{link}</footer-navigation-entry>
                    ))}
                </footer-navigation-section>
            ))}
        </footer-navigation>
    </nav>
)
```

By rendering the menu directly in the light DOM, SSR can produce a complete, ready-to-render markup.

### Cross-Component State Handling

When propagating state between parent and child components, patterns like reducers or context providers (as in React) are often used. However, this can be problematic with SSR in frameworks like Next.js, where each component is rendered independently.

Consider the following structure:

```tsx
<ParentComponent>
    <ChildComponent />
</ParentComponent>
```

When `ParentComponent` is rendered on the server, Stencil will attempt to stringify its children (e.g., `ChildComponent`) for the light DOM. The intermediate markup may look like this:

```tsx
<ParentComponent>
    <template shadowrootmode="open">
        <style>...</style>
        ...
    </template>
    <ChildComponent />
</ParentComponent>
```

At this stage, `ParentComponent` can access and manipulate its children. However, when `ChildComponent` is rendered in isolation, it won’t have access to the parent’s state or context, potentially leading to inconsistencies.

To prevent this, ensure that components rendered on the server don’t depend on external state or context. If the component relies on data fetched at runtime, it’s better to display a loading placeholder during SSR.

### Optimizing Performance

When Stencil server-side renders a component, it converts it into [Declarative Shadow DOM](https://web.dev/articles/declarative-shadow-dom), which includes all structural information and styles. While this ensures accurate rendering, it can significantly increase document size if not managed carefully.

For example, consider a button component:

```tsx
import { Component, Fragment, h } from '@stencil/core'
@Component({
  tag: 'my-btn',
  styleUrl: './button.css'
})
export class MyBtn {
  render() {
    return (
      <>
        <button>...</button>
      </>
    );
  }
}
```

And this `button.css` which imports additional common styles:

```css
/* button.css */
@import "../css/base.css";
@import "../css/tokens.css";
@import "../css/animations.css";
@import "../css/utilities.css";

/* component-specific styles */
button {
    ...
}
```

When SSR is performed, the entire CSS (including imports) is bundled with the component’s declarative shadow DOM. Rendering multiple instances of this button in SSR can lead to repeated inclusion of styles, bloating the document size and delaying [First Contentful Paint (FCP)](https://web.dev/articles/fcp).

Here are some ways to mitigate this:

- **Use CSS Variables**: CSS variables can pierce the Shadow DOM, reducing the need for redundant styles.
- **Use the `::part` pseudo-element**: This allows you to style parts of the Shadow DOM from outside the component, minimizing the internal CSS.
- **Optimize Component-Specific CSS**: Only include the necessary styles for each component.
- **Limit SSR Scope**: In Next.js, apply `use client` to sections that don’t need SSR to reduce unnecessary rendering.

Stencil continues to enhance SSR capabilities and is committed to solving performance and rendering challenges. Your feedback is important — feel free to [file an issue](https://github.com/ionic-team/stencil/issues/new?assignees=&labels=&projects=&template=feature_request.yml&title=feat%3A+) and contribute your ideas!
