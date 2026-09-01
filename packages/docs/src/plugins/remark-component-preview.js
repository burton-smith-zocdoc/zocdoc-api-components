import { visit } from 'unist-util-visit';

/**
 * Remark plugin that transforms fenced code blocks with `preview` meta
 * into ComponentPreview elements with the code rendered inside.
 *
 * Usage in MDX:
 *   ```html preview
 *   <zd-provider-card></zd-provider-card>
 *   ```
 */
export function remarkComponentPreview() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (!node.meta?.includes('preview')) return;

      const code = node.value;
      const lang = node.lang || 'html';

      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'ComponentPreview',
        attributes: [
          { type: 'mdxJsxAttribute', name: 'code', value: code },
          { type: 'mdxJsxAttribute', name: 'lang', value: lang },
        ],
        children: [
          {
            type: 'html',
            value: code,
          },
        ],
      };
    });
  };
}

export default remarkComponentPreview;
