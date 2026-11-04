// The site's code block colours (Prism's `vsDark` on `#0a1220`, see `codeTheme` in
// docusaurus.config.js) as a Monaco theme, so a playground's editor matches the static code
// around it. Monaco tokenizes differently from Prism, so the match is close, not exact.
export const editorTheme = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: '', foreground: '9CDCFE' },
    { token: 'identifier', foreground: '9CDCFE' },
    { token: 'keyword', foreground: '569CD6' },
    { token: 'type.identifier', foreground: '4EC9B0' },
    { token: 'comment', foreground: '6A9955' },
    { token: 'string', foreground: 'CE9178' },
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'regexp', foreground: 'D16969' },
    { token: 'delimiter', foreground: 'D4D4D4' },
    // Monaco's TypeScript grammar has no decorator token, so `@` comes through as `invalid`;
    // Prism colours decorators like functions
    { token: 'invalid', foreground: 'DCDCAA' },
    { token: 'tag.html', foreground: '569CD6' },
    { token: 'delimiter.html', foreground: '808080' },
    { token: 'attribute.name.html', foreground: '9CDCFE' },
    { token: 'attribute.value.html', foreground: 'CE9178' },
    { token: 'tag.css', foreground: 'D7BA7D' },
    { token: 'attribute.name.css', foreground: '9CDCFE' },
    { token: 'attribute.value.css', foreground: 'CE9178' },
    { token: 'attribute.value.number.css', foreground: 'B5CEA8' },
    { token: 'attribute.value.unit.css', foreground: 'B5CEA8' },
  ],
  colors: {
    'editor.background': '#0a1220',
    'editor.foreground': '#9CDCFE',
    'editorGutter.background': '#0a1220',
    'editorLineNumber.foreground': '#3d4b61',
    'editorLineNumber.activeForeground': '#7f8ea3',
    'editor.lineHighlightBackground': '#ffffff08',
    'editor.lineHighlightBorder': '#00000000',
    'editorOverviewRuler.border': '#00000000',
    'editorIndentGuide.background1': '#ffffff10',
    'editorIndentGuide.activeBackground1': '#ffffff26',
    // Prism doesn't colour brackets by depth
    'editorBracketHighlight.foreground1': '#D4D4D4',
    'editorBracketHighlight.foreground2': '#D4D4D4',
    'editorBracketHighlight.foreground3': '#D4D4D4',
    'editorBracketHighlight.foreground4': '#D4D4D4',
    'editorBracketHighlight.foreground5': '#D4D4D4',
    'editorBracketHighlight.foreground6': '#D4D4D4',
  },
} as const;
