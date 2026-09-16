import useBrokenLinks from '@docusaurus/useBrokenLinks';

// Registers `id` with Docusaurus's anchor checker, the same way its own <Details id="..."> does -
// the checker only tracks anchors via this hook, not raw HTML `id` attributes, so a `<tr id="...">`
// alone passes at runtime but fails the build's broken-anchor check. Render this next to the real
// id-bearing element to satisfy both.
export default function TableAnchor({ id }: { id: string }) {
  useBrokenLinks().collectAnchor(id);
  return null;
}
