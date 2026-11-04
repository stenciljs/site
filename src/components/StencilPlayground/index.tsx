import React, { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import { editorTheme } from './editorTheme';
import styles from './styles.module.css';

// Pinned on purpose: a new @stencil/playground release can change compiler behavior under every
// example on the site, so bump this deliberately and spot-check the pages that use `:::playground`.
const PLAYGROUND_VERSION = '5.0.0-beta.32';
const LOADER_URL = `https://cdn.jsdelivr.net/npm/@stencil/playground@${PLAYGROUND_VERSION}/dist/loader-bundle/stencil-playground/stencil-playground.js`;

interface PlaygroundFile {
  name: string;
  content: string;
}

type PlaygroundElement = HTMLElement & { files: PlaygroundFile[]; editorTheme: typeof editorTheme };

// A plain script tag, not `import()`, so webpack never tries to bundle or resolve the CDN URL.
let loader: Promise<unknown> | undefined;
const loadPlayground = () =>
  (loader ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = LOADER_URL;
    script.onload = () => resolve(customElements.whenDefined('stencil-playground'));
    script.onerror = () => {
      script.remove();
      loader = undefined; // let the next playground on the page retry
      reject(new Error(`Failed to load ${LOADER_URL}`));
    };
    document.head.appendChild(script);
  }));

interface Props {
  /** JSON-encoded `PlaygroundFile[]`, written by `src/remark/playground.js`. */
  files: string;
  /** `stacked` puts the preview under the editor and fits the editor to its code; `auto` puts them side by side. */
  layout?: 'stacked' | 'auto';
  /** Pixel minimum height of the side-by-side layout. */
  height?: string;
  /** Pixel editor height in the stacked layout (default: fits the code). */
  editorHeight?: string;
  /** Pixel preview height in the stacked layout. */
  previewHeight?: string;
  /** The original code blocks, shown until the playground loads (and if it can't). */
  children: ReactNode;
}

/** Live Stencil editor + preview. Authored in Markdown as `:::playground` - see `src/remark/playground.js`. */
export default function StencilPlayground({
  files,
  layout = 'stacked',
  height,
  editorHeight,
  previewHeight,
  children,
}: Props) {
  const [ready, setReady] = useState(false);
  const ref = useRef<PlaygroundElement>(null);

  useEffect(() => {
    let cancelled = false;
    loadPlayground().then(
      () => !cancelled && setReady(true),
      (err) => console.warn('Could not load the Stencil playground, showing static code instead.', err),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  // A layout effect, so `files` is set before the element first compiles (it waits until it's
  // scrolled into view) and it never compiles its built-in default component.
  useLayoutEffect(() => {
    if (ready && ref.current) {
      ref.current.editorTheme = editorTheme;
      ref.current.files = JSON.parse(files);
    }
  }, [ready, files]);

  if (!ready) {
    return <>{children}</>;
  }
  const px = (value?: string) => (value ? `${value}px` : undefined);
  return React.createElement('stencil-playground', {
    ref,
    class: styles.playground,
    layout,
    style: {
      '--stencil-playground-height': px(height),
      '--stencil-playground-editor-height': px(editorHeight),
      '--stencil-playground-preview-height': px(previewHeight),
    },
  });
}
