import type { Root } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';
import type { Package } from '../../cem-agent-docs/src/index.ts';
import { buildCatalog, expandApiReferences, readerDescription } from './index.ts';

const manifest: Package = {
  schemaVersion: '2.1.0',
  modules: [
    {
      kind: 'javascript-module',
      path: 'thing.js',
      declarations: [
        {
          kind: 'class',
          name: 'ZdThing',
          tagName: 'zd-thing',
          customElement: true,
          attributes: [
            {
              name: 'open',
              fieldName: 'open',
              type: { text: 'boolean' },
              default: 'false',
              description: 'Opens it (COMP-004).\n\nBecause a closed thing is calmer.',
            },
          ],
          events: [{ name: 'thing-done', type: { text: 'CustomEvent<DoneDetail>' } }],
          cssParts: [{ name: 'base', description: 'The wrapper.' }],
        },
      ],
    },
  ],
};

const catalog = buildCatalog([{ packageName: '@zocdoc/things', manifest }]);
const processor = unified().use(remarkParse).use(remarkGfm).use(remarkStringify);

function expand(markdown: string): string {
  const tree = processor.parse(markdown) as Root;
  expandApiReferences(tree, catalog);
  return processor.stringify(tree);
}

describe('expandApiReferences', () => {
  it('replaces the fence with the tag API, nested under the heading it sits in', () => {
    const out = expand('## API Reference\n\n```api-reference\nzd-thing\n```\n\nAfter.\n');
    expect(out).toContain('**Class** `ZdThing` — **Package** `@zocdoc/things`');
    expect(out).toContain('### Attributes & Properties');
    expect(out).toContain('### Events');
    expect(out).toContain('### CSS Parts');
    expect(out).toContain('`CustomEvent<DoneDetail>`');
    expect(out).not.toContain('api-reference');
    expect(out.trimEnd().endsWith('After.')).toBe(true);
  });

  it('nests deeper under a per-tag subheading', () => {
    expect(expand('## API\n\n### `zd-thing`\n\n```api-reference\nzd-thing\n```\n')).toContain(
      '#### Events'
    );
  });

  it('leaves other code blocks alone', () => {
    expect(expand('```html\n<zd-thing></zd-thing>\n```\n')).toContain('```html');
  });

  it('throws on a tag no manifest documents', () => {
    expect(() => expand('```api-reference\nzd-missing\n```\n')).toThrow(/<zd-missing>/);
  });
});

describe('readerDescription', () => {
  it('keeps the first paragraph and drops rule ids', () => {
    expect(readerDescription('Opens it (COMP-004).\n\nBecause.')).toBe('Opens it.');
  });

  it('turns a link tag into code', () => {
    expect(readerDescription('See {@link effectiveVisitReasonId}.')).toBe(
      'See `effectiveVisitReasonId`.'
    );
  });
});
