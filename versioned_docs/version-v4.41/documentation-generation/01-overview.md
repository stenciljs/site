---
title: Stencil Documentation Generation
sidebar_label: Overview
description: Stencil Documentation Generation
slug: /doc-generation
---

# Documentation Generation

- [`docs-readme`: Documentation readme files formatted in markdown](./docs-readme.md)
- [`docs-json`: Documentation data formatted in JSON](./docs-json.md)
- [`docs-custom`: Custom documentation generation](./docs-custom.md)
- [`docs-vscode`: Documentation generation for VS Code](./docs-vscode.md)
- [`stats`: Stats about the compiled files](./docs-stats.md)

## Docs Auto-Generation

As apps scale with more and more components, and team size and members continue to adjust over time, it's vital all components are well documented, and that the documentation itself is maintained. Maintaining documentation is right up there with some of the least interesting things developers must do, but that doesn't mean it can't be made easier.

Throughout the build process, the compiler is able to extract documentation from each component, to include JSDocs comments, types of each member on the component (thanks TypeScript!) and CSS Variables (CSS Custom Properties).


### Component Property Docs Example:

To add a description to a `@Prop`, simply add a comment on the previous line:

```tsx
/** (optional) The icon to display */
@Prop() iconType = "";
```

### CSS Example:

Stencil will also document CSS variables when you specify them via jsdoc-style comments inside your css or scss files:

```css
 :root {
   /**
    * @prop --primary: Primary header color.
    */
   --primary: blue;
 }
```
