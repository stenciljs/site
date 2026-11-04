import MDXComponents from '@theme-original/MDXComponents';
import StencilPlayground from '@site/src/components/StencilPlayground';

// Lets the `:::playground` remark plugin (src/remark/playground.js) emit <StencilPlayground>
// without an import in every page.
export default {
  ...MDXComponents,
  StencilPlayground,
};
