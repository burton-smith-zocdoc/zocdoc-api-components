import type { Code, Root, RootContent } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import {
  normalizeApi,
  renderApiBody,
  type Component,
  type Package,
} from '../../cem-agent-docs/src/index.ts';

/** Every documented tag, with the package a reader installs to get it. */
export type Catalog = Map<string, { component: Component; packageName: string }>;

export function buildCatalog(packages: { packageName: string; manifest: Package }[]): Catalog {
  const catalog: Catalog = new Map();
  for (const { packageName, manifest } of packages) {
    for (const module of manifest.modules) {
      for (const component of module.declarations ?? []) {
        if (component.tagName) catalog.set(component.tagName, { component, packageName });
      }
    }
  }
  return catalog;
}

/**
 * A description as a page reader needs it. JSDoc here is written for maintainers: the first
 * paragraph says what a thing does, and what follows argues why it was built that way. Rule IDs
 * and `{@link}` targets point into the source, which a page reader doesn't have.
 */
export function readerDescription(text: string | undefined): string | undefined {
  if (!text) return text;
  return text
    .split(/\n\s*\n/)[0]
    .replace(/\{@link\s+([^}\s]+)\s*\}/g, '`$1`')
    .replace(/\s*\((?:[A-Z0-9]+-\d{3})(?:,\s*[A-Z0-9]+-\d{3})*\)/g, '')
    .trim();
}

function forReaders(component: Component): Component {
  const trim = <T extends { description?: string }>(items: T[] | undefined): T[] | undefined =>
    items?.map((item) => ({ ...item, description: readerDescription(item.description) }));
  return {
    ...component,
    attributes: trim(component.attributes),
    members: trim(component.members),
    events: trim(component.events),
    slots: trim(component.slots),
    cssParts: trim(component.cssParts),
    cssStates: trim(component.cssStates),
    cssProperties: trim(component.cssProperties),
  };
}

const parser = unified().use(remarkParse).use(remarkGfm);

/** The generated API for one tag, as nodes whose headings start at `depth`. */
export function apiReferenceNodes(tag: string, catalog: Catalog, depth: number): RootContent[] {
  const entry = catalog.get(tag);
  if (!entry) throw new Error(`api-reference: no component <${tag}> in the manifests`);
  const component = forReaders(entry.component);
  const markdown = renderApiBody(component, normalizeApi(component), entry.packageName, depth);
  return parser.parse(markdown.join('\n\n')).children;
}

/**
 * Replaces each ` ```api-reference ` fence with the generated API of the tag it names, so a
 * page's tables come from the manifest and can't drift from the source. Sections nest one level
 * below the heading the fence sits under.
 *
 * Mutates `tree`. Shared by the docs site's remark plugin and the agent-docs build, so both
 * render the same tables.
 */
export function expandApiReferences(tree: Root, catalog: Catalog): void {
  let depth = 1;
  tree.children = tree.children.flatMap((node) => {
    if (node.type === 'heading') depth = node.depth;
    if (node.type !== 'code' || (node as Code).lang !== 'api-reference') return [node];
    return apiReferenceNodes((node as Code).value.trim(), catalog, Math.min(depth + 1, 6));
  });
}
