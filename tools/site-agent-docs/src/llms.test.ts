import { describe, expect, it } from 'vitest';
import { renderLlmsFull, renderLlmsIndex, type LlmsSite } from './llms.ts';

const site: LlmsSite = {
  title: 'Docs',
  summary: 'Web components.',
  notes: ['Documents version 1.0.0.'],
  sections: [
    {
      heading: 'Guides',
      pages: [
        {
          url: 'https://x.test/guides/testing.md',
          title: 'Testing',
          description: 'How to test',
          markdown: '# Testing\n\nBody.\n',
        },
        { url: 'https://x.test/guides/theming.md', title: 'Theming', markdown: '# Theming\n' },
      ],
    },
  ],
};

describe('renderLlmsIndex', () => {
  it('follows the llms.txt layout: title, summary, notes, then linked sections', () => {
    expect(renderLlmsIndex(site)).toBe(
      [
        '# Docs',
        '> Web components.',
        'Documents version 1.0.0.',
        '## Guides',
        '- [Testing](https://x.test/guides/testing.md): How to test\n' +
          '- [Theming](https://x.test/guides/theming.md)',
      ].join('\n\n') + '\n'
    );
  });
});

describe('renderLlmsFull', () => {
  it('inlines every page after the header, each with its source URL', () => {
    const full = renderLlmsFull(site);
    expect(full.startsWith('# Docs\n\n> Web components.\n\nDocuments version 1.0.0.')).toBe(true);
    expect(full).toContain('# Testing\n\nBody.\n\nSource: https://x.test/guides/testing.md');
    expect(full).toContain('---\n\n# Theming\n\nSource: https://x.test/guides/theming.md\n');
  });
});
