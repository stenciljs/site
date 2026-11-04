// @ts-check

/**
 * Turns a `:::playground` container of titled code blocks into a live `<StencilPlayground>`:
 *
 *   :::playground{preview-height=120}
 *   ```tsx title="src/components/my-counter/my-counter.tsx"
 *   ...
 *   ```
 *   ```html title="index.html"
 *   <my-counter></my-counter>
 *   ```
 *   :::
 *
 * Each code block becomes one playground file, named by its `title`. A leading `src/` is dropped,
 * so the usual project paths work as-is and relative imports between them still resolve. Add
 * `hidden` to a block's meta (```ts title="src/count.ts" hidden) for a supporting file already
 * shown earlier on the page: it's still a tab in the playground, but not repeated as static code.
 *
 * Attributes (all optional):
 * - `layout`: `stacked` (default: preview under the editor, editor fitted to its code) or `auto`
 *   (side by side, stacking below 640px).
 * - `preview-height` / `editor-height`: pixel heights in the stacked layout.
 * - `height`: pixel minimum height of the side-by-side layout.
 *
 * The code blocks stay as the element's children: they render as plain code blocks until the
 * playground loads in the browser, and remain the content for SSR, no-JS readers and llms.txt.
 */

const DIRECTIVE_NAME = 'playground';
const TITLE_RE = /\btitle=(["'])(.*?)\1/;
const HIDDEN_RE = /(^|\s)hidden(\s|$)/;
const LAYOUTS = ['stacked', 'auto'];
// directive attribute -> <StencilPlayground> prop
const ATTRIBUTES = {
  layout: 'layout',
  height: 'height',
  'editor-height': 'editorHeight',
  'preview-height': 'previewHeight',
};

/** @param {any} node @param {{ path: string }} file */
const toPlayground = (node, file) => {
  const fail = (/** @type {string} */ message) => {
    const { line } = node.position?.start ?? {};
    throw new Error(`:::${DIRECTIVE_NAME} in ${file.path}${line ? `:${line}` : ''}: ${message}`);
  };

  const files = node.children.map((child) => {
    if (child.type !== 'code') {
      fail(`only fenced code blocks are allowed inside, found "${child.type}".`);
    }
    const title = TITLE_RE.exec(child.meta ?? '')?.[2];
    if (!title) {
      fail('every code block needs a title="..." with its file name, e.g. title="src/my-component.tsx".');
    }
    return { name: title.replace(/^(\.\/)?src\//, ''), content: child.value };
  });

  if (files.length === 0) {
    fail('add at least one titled code block.');
  }
  const names = files.map((f) => f.name);
  const duplicate = names.find((name, i) => names.indexOf(name) !== i);
  if (duplicate) {
    fail(`two code blocks share the file name "${duplicate}".`);
  }

  const attributes = [{ type: 'mdxJsxAttribute', name: 'files', value: JSON.stringify(files) }];
  for (const [name, value] of Object.entries(node.attributes ?? {})) {
    const prop = ATTRIBUTES[name];
    if (!prop) {
      fail(`unknown attribute "${name}"; use ${Object.keys(ATTRIBUTES).join(', ')}.`);
    }
    if (name === 'layout' ? !LAYOUTS.includes(value) : !/^\d+$/.test(value)) {
      fail(`${name} must be ${name === 'layout' ? LAYOUTS.join(' or ') : 'a number of pixels'}, got "${value}".`);
    }
    attributes.push({ type: 'mdxJsxAttribute', name: prop, value });
  }

  const shown = node.children.filter((child) => !HIDDEN_RE.test(child.meta ?? ''));
  if (shown.length === 0) {
    fail('at least one code block must not be hidden.');
  }

  return {
    type: 'mdxJsxFlowElement',
    name: 'StencilPlayground',
    attributes,
    children: shown,
    position: node.position,
  };
};

/** @param {any} parent @param {{ path: string }} file */
const transform = (parent, file) => {
  if (!parent.children) return;
  parent.children = parent.children.map((child) => {
    if (child.type === 'containerDirective' && child.name === DIRECTIVE_NAME) {
      return toPlayground(child, file);
    }
    transform(child, file);
    return child;
  });
};

module.exports = function playgroundPlugin() {
  return (/** @type {any} */ tree, /** @type {{ path: string }} */ file) => transform(tree, file);
};
