import { describe, expect, it } from 'vitest';
import { convertPage, parseFrontmatter, type ConvertOptions } from './convert.ts';

const options: ConvertOptions = {
  base: '/site',
  resolveLink: (path, hash) => ({
    href: `${path.replace(/^\/|\/$/g, '')}.md${hash ? `#${hash}` : ''}`,
  }),
};

const page = (body: string) => `---\ntitle: Testing\ndescription: 'How to test'\n---\n\n${body}`;

describe('parseFrontmatter', () => {
  it('reads title and description, unquoting either', () => {
    expect(parseFrontmatter(page('x')).frontmatter).toEqual({
      title: 'Testing',
      description: 'How to test',
    });
  });

  it('throws on a page with no title rather than shipping it untitled', () => {
    expect(() => parseFrontmatter('---\ndescription: x\n---\n')).toThrow(/title/);
  });
});

describe('convertPage', () => {
  it('heads the page with its title and description', () => {
    expect(convertPage(page('Body.'), options).markdown).toBe(
      '# Testing\n\nHow to test\n\nBody.\n'
    );
  });

  it('drops imports and site-only widgets', () => {
    const { markdown } = convertPage(
      page("import X from '@/x.astro';\n\n<PreviewRuntime />\n\nKept."),
      options
    );
    expect(markdown).not.toMatch(/import|PreviewRuntime/);
    expect(markdown).toContain('Kept.');
  });

  it('keeps a preview example as a plain fenced block', () => {
    const { markdown } = convertPage(
      page('```html preview\n<zd-button></zd-button>\n```'),
      options
    );
    expect(markdown).toContain('```html\n<zd-button></zd-button>\n```');
  });

  it('turns an Aside into a labelled blockquote', () => {
    const { markdown } = convertPage(
      page('<Aside type="danger" title="PHI">\n  Never log it.\n</Aside>'),
      options
    );
    expect(markdown).toContain('> **Danger: PHI**\n>\n> Never log it.');
  });

  it('turns a :::caution directive into the same blockquote', () => {
    const { markdown } = convertPage(
      page(':::caution[Register]\nImport the package.\n:::'),
      options
    );
    expect(markdown).toContain('> **Caution: Register**\n>\n> Import the package.');
  });

  it('flattens tabs into labelled sections, keeping every tab', () => {
    const { markdown } = convertPage(
      page(
        '<Tabs>\n  <TabItem label="npm">\n    `npm i`\n  </TabItem>\n  <TabItem label="pnpm">\n    `pnpm add`\n  </TabItem>\n</Tabs>'
      ),
      options
    );
    expect(markdown).toMatch(/\*\*npm\*\*\n\n`npm i`\n\n\*\*pnpm\*\*\n\n`pnpm add`/);
  });

  it('rewrites internal links through the resolver, keeping the hash', () => {
    const { markdown } = convertPage(
      page('See [mock](/site/guides/testing/#mock-transport).'),
      options
    );
    expect(markdown).toContain('[mock](guides/testing.md#mock-transport)');
  });

  it('leaves external links alone', () => {
    const { markdown } = convertPage(page('[docs](https://api-docs.zocdoc.com/x)'), options);
    expect(markdown).toContain('[docs](https://api-docs.zocdoc.com/x)');
  });

  it('replaces a link to another package with its text and where to look', () => {
    const { markdown } = convertPage(page('Use [layout](/site/primitive-components/flex/) tags.'), {
      ...options,
      resolveLink: () => ({ elsewhere: '@x/other/agent-docs/flex.md' }),
    });
    expect(markdown).toContain('Use layout (see `@x/other/agent-docs/flex.md`) tags.');
  });

  it('throws on a link the resolver cannot place, rather than shipping a dead link', () => {
    expect(() =>
      convertPage(page('[gone](/site/nowhere/)'), { ...options, resolveLink: () => null })
    ).toThrow(/no shipped target/);
  });

  it('throws on an unknown component, rather than silently dropping its content', () => {
    expect(() => convertPage(page('<Mystery>\n  content\n</Mystery>'), options)).toThrow(
      /<Mystery>/
    );
    expect(() => convertPage(page('Text <Mystery /> inline.'), options)).toThrow(/inline/);
  });
});
