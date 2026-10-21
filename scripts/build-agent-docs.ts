import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateAgentDocs, type Package } from '../tools/cem-agent-docs/src/index.ts';
import { buildCatalog, type Catalog } from '../tools/api-reference/src/index.ts';
import { convertPage, type LinkTarget } from '../tools/site-agent-docs/src/convert.ts';

/**
 * Builds `agent-docs/` inside each published package: the docs site's pages as plain markdown,
 * plus the manifest-generated API reference. It ships in the tarball so an agent in a consumer
 * project reads the docs for the version it has installed, not whatever the site says today.
 *
 * Gitignored build output — the site MDX and `custom-elements.json` are the sources.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const siteDir = join(root, 'packages/docs/src/content/docs');
const SITE_BASE = '/zocdoc-api-components';

interface Target {
  /** npm name, also what a cross-package link tells the reader to look in. */
  name: string;
  dir: string;
  /** Site sections that ship in this package, mapped to their `agent-docs/` subdirectory. */
  sections: Record<string, string>;
  /** Index headings, in sidebar order. Slugs are relative to the site root. */
  index: { heading: string; slugs: string[] | 'all'; section: string }[];
}

const TARGETS: Target[] = [
  {
    name: '@zocdoc/api-components',
    dir: join(root, 'packages/api-components'),
    sections: {
      'getting-started': 'guides/getting-started',
      guides: 'guides',
      client: 'guides/client',
      components: 'components',
    },
    index: [
      {
        heading: 'Getting started',
        section: 'getting-started',
        slugs: ['installation', 'using-with-ai', 'quick-start', 'authentication'],
      },
      {
        heading: 'Guides',
        section: 'guides',
        slugs: [
          'zocdoc-api',
          'architecture',
          'composed-vs-single',
          'frameworks',
          'theming',
          'testing',
        ],
      },
      { heading: 'Client API', section: 'client', slugs: ['configuration', 'endpoints', 'errors'] },
      { heading: 'Components', section: 'components', slugs: 'all' },
    ],
  },
  {
    name: '@zocdoc/api-primitive-components',
    dir: join(root, 'packages/primitives'),
    sections: { 'primitive-components': 'components' },
    index: [{ heading: 'Components', section: 'primitive-components', slugs: 'all' }],
  },
];

/** Which package ships a site section, and where inside its `agent-docs/`. */
function locate(section: string): { target: Target; dir: string } | null {
  for (const target of TARGETS) {
    const dir = target.sections[section];
    if (dir) return { target, dir };
  }
  return null;
}

function linkResolver(from: Target, pageDir: string) {
  return (path: string, hash: string): LinkTarget | null => {
    const [section, slug] = path.split('/').filter(Boolean);
    const found = section && slug ? locate(section) : null;
    if (!found) return null;
    const file = `${found.dir}/${slug}.md`;
    const anchor = hash ? `#${hash}` : '';
    if (found.target === from) return { href: `${posix.relative(pageDir, file) || '.'}${anchor}` };
    return { elsewhere: `${found.target.name}/agent-docs/${file}` };
  };
}

interface Page {
  slug: string;
  title: string;
  description?: string;
}

async function buildTarget(target: Target, catalog: Catalog): Promise<void> {
  const out = join(target.dir, 'agent-docs');
  await rm(out, { recursive: true, force: true });

  // Sections and pages are independent, so they're read, converted, and written concurrently.
  const sections = await Promise.all(
    Object.entries(target.sections).map(async ([section, dir]): Promise<[string, Page[]]> => {
      const files = (await readdir(join(siteDir, section)))
        .filter((f) => f.endsWith('.mdx'))
        .sort(); // oxlint-disable-line unicorn/no-array-sort -- readdir returns a fresh array; toSorted needs ES2023
      await mkdir(join(out, dir), { recursive: true });
      const converted = await Promise.all(
        files.map(async (file): Promise<Page> => {
          const slug = file.replace(/\.mdx$/, '');
          const source = await readFile(join(siteDir, section, file), 'utf-8');
          const { frontmatter, markdown } = convertPage(source, {
            base: SITE_BASE,
            catalog,
            resolveLink: linkResolver(target, dir),
          });
          await writeFile(join(out, dir, `${slug}.md`), markdown);
          return { slug, title: frontmatter.title, description: frontmatter.description };
        })
      );
      return [section, converted];
    })
  );
  const pages = new Map(sections);

  generateAgentDocs(manifests.get(target)!, {
    packageName: target.name,
    outDir: join(out, 'reference'),
  });

  const { version } = JSON.parse(await readFile(join(target.dir, 'package.json'), 'utf-8')) as {
    version: string;
  };
  await writeFile(join(out, 'index.md'), renderIndex(target, version, pages));
}

function renderIndex(target: Target, version: string, pages: Map<string, Page[]>): string {
  const lines = [
    `# \`${target.name}\` ${version} — agent docs`,
    'Generated from the docs site and the Custom Elements Manifest at build time, so it matches ' +
      'this installed version. Read this file first, then open only the page you need.',
    '- `guides/` and `components/` — usage, examples, event payloads, and gotchas.\n' +
      '- `reference/<tag>.md` — the full generated API for every tag: attributes, properties, ' +
      'events, slots, methods, CSS parts, and custom properties. ' +
      '[`reference/index.md`](reference/index.md) lists every tag.',
  ];
  for (const group of target.index) {
    const all = pages.get(group.section) ?? [];
    const chosen =
      group.slugs === 'all'
        ? all
        : group.slugs.map((slug) => {
            const page = all.find((p) => p.slug === slug);
            if (!page)
              throw new Error(`agent-docs: index lists missing page ${group.section}/${slug}`);
            return page;
          });
    const dir = target.sections[group.section];
    lines.push(
      `## ${group.heading}`,
      chosen
        .map(
          (p) => `- [${p.title}](${dir}/${p.slug}.md)${p.description ? ` — ${p.description}` : ''}`
        )
        .join('\n')
    );
  }
  return `${lines.join('\n\n')}\n`;
}

const manifests = new Map(
  await Promise.all(
    TARGETS.map(async (target): Promise<[Target, Package]> => [
      target,
      JSON.parse(await readFile(join(target.dir, 'custom-elements.json'), 'utf-8')) as Package,
    ])
  )
);
// Every package's tags, since a page can show the API of a primitive it composes.
const catalog = buildCatalog(
  TARGETS.map((target) => ({ packageName: target.name, manifest: manifests.get(target)! }))
);

await Promise.all(
  TARGETS.map(async (target) => {
    await buildTarget(target, catalog);
    console.log(`agent-docs: wrote ${posix.relative(root, join(target.dir, 'agent-docs'))}`);
  })
);
