import type { BlockContent, Code, Link, Parent, Root, RootContent } from 'mdast';
import type { MdxJsxAttribute, MdxJsxFlowElement } from 'mdast-util-mdx-jsx';
import type { ContainerDirective } from 'mdast-util-directive';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { SKIP, visit } from 'unist-util-visit';
import { expandApiReferences, type Catalog } from '../../api-reference/src/index.ts';

export interface Frontmatter {
  title: string;
  description?: string;
}

/**
 * Where a site link points, once resolved. `null` from a resolver means the target isn't
 * shipped anywhere, which is a build error rather than a dead link.
 */
export type LinkTarget = { href: string } | { elsewhere: string };

export interface ConvertOptions {
  /** Rewrites an internal site path (`/guides/testing/#mock-transport`, base stripped). */
  resolveLink: (path: string, hash: string) => LinkTarget | null;
  /** The site's `base`, stripped from internal links before they reach `resolveLink`. */
  base: string;
  /** Tags an `api-reference` fence can name. Without it, a page with one fails to convert. */
  catalog?: Catalog;
}

export interface Converted {
  frontmatter: Frontmatter;
  markdown: string;
}

/**
 * Site-only widgets that render nothing an agent can use: live previews, the icon gallery,
 * and the hierarchy diagram (whose content the surrounding prose already states).
 */
const DROPPED = new Set([
  'PreviewRuntime',
  'ComponentPreview',
  'ComponentHierarchy',
  'IconGallery',
]);

/** Starlight wrappers whose children are the content; the wrapper itself is layout. */
const UNWRAPPED = new Set(['Steps', 'CardGrid']);

const ASIDE_LABELS: Record<string, string> = {
  note: 'Note',
  tip: 'Tip',
  caution: 'Caution',
  danger: 'Danger',
};

/**
 * Only the two keys the pages actually carry. Starlight frontmatter is flat `key: value` YAML,
 * so a YAML dependency would be weight for no benefit — and a page whose title isn't found
 * fails loudly below rather than shipping untitled.
 */
export function parseFrontmatter(source: string): { frontmatter: Frontmatter; body: string } {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(source);
  if (!match) throw new Error('site-agent-docs: page has no frontmatter');
  const fields = new Map<string, string>();
  for (const line of match[1].split('\n')) {
    const field = /^(\w+):\s*(.*)$/.exec(line);
    if (field) fields.set(field[1], field[2].replace(/^(['"])(.*)\1$/, '$2'));
  }
  const title = fields.get('title');
  if (!title) throw new Error('site-agent-docs: frontmatter has no title');
  return {
    frontmatter: { title, description: fields.get('description') },
    body: source.slice(match[0].length),
  };
}

function attr(node: MdxJsxFlowElement, name: string): string | undefined {
  const found = node.attributes.find(
    (a): a is MdxJsxAttribute => a.type === 'mdxJsxAttribute' && a.name === name
  );
  return typeof found?.value === 'string' ? found.value : undefined;
}

function strongParagraph(label: string): BlockContent {
  return {
    type: 'paragraph',
    children: [{ type: 'strong', children: [{ type: 'text', value: label }] }],
  };
}

function callout(label: string, title: string | undefined, children: RootContent[]): BlockContent {
  const heading = title ? `${label}: ${title}` : label;
  return {
    type: 'blockquote',
    children: [strongParagraph(heading), ...(children as BlockContent[])],
  };
}

/** The markdown a JSX flow element becomes, or a throw for one this converter doesn't know. */
function replaceJsx(node: MdxJsxFlowElement): RootContent[] {
  const name = node.name ?? '';
  if (DROPPED.has(name)) return [];
  if (UNWRAPPED.has(name)) return node.children;

  switch (name) {
    case 'Aside': {
      const type = attr(node, 'type') ?? 'note';
      return [callout(ASIDE_LABELS[type] ?? 'Note', attr(node, 'title'), node.children)];
    }
    case 'Tabs':
      return node.children;
    case 'TabItem':
      return [strongParagraph(attr(node, 'label') ?? 'Option'), ...node.children];
    case 'Card':
      return [strongParagraph(attr(node, 'title') ?? ''), ...node.children];
    case 'LinkCard': {
      const title = attr(node, 'title') ?? '';
      const href = attr(node, 'href') ?? '';
      const description = attr(node, 'description');
      return [
        {
          type: 'paragraph',
          children: [
            { type: 'link', url: href, children: [{ type: 'text', value: title }] },
            ...(description ? [{ type: 'text' as const, value: ` — ${description}` }] : []),
          ],
        },
      ];
    }
    default:
      // A silently missing section is worse than a broken build.
      throw new Error(`site-agent-docs: no conversion for <${name}>`);
  }
}

/**
 * Replace every JSX element bottom-up, so a `TabItem` inside `Tabs` is converted before its
 * parent splices it in.
 */
function convertJsx(tree: Parent): void {
  for (const child of tree.children) {
    if ('children' in child) convertJsx(child as Parent);
  }
  tree.children = tree.children.flatMap((child) => {
    if (child.type === 'mdxjsEsm') return [];
    if (child.type === 'mdxJsxTextElement' || child.type === 'mdxTextExpression') {
      // No page uses inline JSX today; one that starts to needs a deliberate conversion.
      throw new Error(`site-agent-docs: no conversion for inline ${child.type}`);
    }
    if (child.type === 'mdxJsxFlowElement') return replaceJsx(child);
    if (child.type === 'containerDirective') {
      const directive = child as ContainerDirective;
      // `:::caution[Title]` puts the title in a first paragraph flagged `directiveLabel`.
      const [first, ...rest] = directive.children;
      const labelled = first?.type === 'paragraph' && first.data?.directiveLabel;
      const title = labelled
        ? first.children.map((c) => ('value' in c ? c.value : '')).join('')
        : undefined;
      return [
        callout(
          ASIDE_LABELS[directive.name] ?? 'Note',
          title,
          labelled ? rest : directive.children
        ),
      ];
    }
    return [child];
  }) as typeof tree.children;
}

function rewriteLinks(tree: Root, options: ConvertOptions): void {
  const prefix = options.base.replace(/\/$/, '');
  visit(tree, 'link', (node: Link, index, parent) => {
    if (!node.url.startsWith(`${prefix}/`) || !parent || index === undefined) return;
    const [path, hash = ''] = node.url.slice(prefix.length).split('#');
    const target = options.resolveLink(path, hash);
    if (!target) throw new Error(`site-agent-docs: link to "${node.url}" has no shipped target`);
    if ('href' in target) {
      node.url = target.href;
      return;
    }
    // A target outside this package: keep the words, name the file it lives in.
    parent.children.splice(
      index,
      1,
      ...node.children,
      { type: 'text', value: ' (see ' },
      { type: 'inlineCode', value: target.elsewhere },
      { type: 'text', value: ')' }
    );
    return [SKIP, index + node.children.length + 3];
  });
}

function stripPreviewMeta(tree: Root): void {
  // The example stays; only the site's "render this live" flag goes.
  visit(tree, 'code', (node: Code) => {
    if (node.meta?.split(/\s+/).includes('preview')) {
      const rest = node.meta.split(/\s+/).filter((m) => m !== 'preview');
      node.meta = rest.length ? rest.join(' ') : null;
    }
  });
}

/**
 * Convert one docs-site MDX page to plain markdown an agent can read from `node_modules`.
 *
 * Pure: a string in, a string out, with link resolution delegated to the caller, which is
 * the only part that knows which pages ship in which package.
 */
export function convertPage(source: string, options: ConvertOptions): Converted {
  const { frontmatter, body } = parseFrontmatter(source);

  const processor = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkStringify, { bullet: '-', emphasis: '_', fences: true, rule: '-' });

  const tree = processor.parse(body) as Root;
  expandApiReferences(tree, options.catalog ?? new Map());
  convertJsx(tree);
  rewriteLinks(tree, options);
  stripPreviewMeta(tree);

  const rendered = processor.stringify(tree).trim();
  const header = [`# ${frontmatter.title}`, frontmatter.description].filter(Boolean).join('\n\n');
  return { frontmatter, markdown: `${header}\n\n${rendered}\n` };
}
