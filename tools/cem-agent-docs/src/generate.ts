import { normalizeApi } from './normalize.ts';
import { renderComponentPage } from './render-component.ts';
import { renderIndex } from './render-index.ts';
import { resolveType } from './resolve-type.ts';
import type { AgentDocsConfig, Component, Package, RenderContext } from './types.ts';
import { nodeFileSystem, writeDocs, type FileSystem, type WriteReport } from './write.ts';

/**
 * A `tagName` is only ever used as a filename basename (`<tag>.md`), never
 * joined into a deeper path. A manifest that carries a slash, backslash, or a dot-segment in
 * `tagName` is malformed — `write.ts`'s outside-outDir guard would accept the resulting nested
 * path, so this must reject it before it ever reaches the file map.
 */
function isSafeBasename(name: string): boolean {
  return name !== '.' && name !== '..' && !/[/\\]/.test(name);
}

/**
 * Every custom element in the manifest, tag-sorted, after the filter hook.
 *
 * A declaration with no `tagName` is skipped silently — base classes and mixins are expected
 * in a manifest and are not an error.
 */
export function selectComponents(
  manifest: Package,
  filter?: (component: Component) => boolean
): Component[] {
  const components: Component[] = [];
  for (const module of manifest.modules ?? []) {
    for (const declaration of module.declarations ?? []) {
      if (!declaration.tagName) continue;
      if (filter && !filter(declaration)) continue;
      components.push(declaration);
    }
  }
  return components.sort((a, b) => (a.tagName ?? '').localeCompare(b.tagName ?? ''));
}

/**
 * Generate the markdown for one package and write it.
 *
 * Pure with respect to the analyzer: it takes a finished manifest and a filesystem port, so
 * an external consumer can point it at their own manifest without adopting our analyzer
 * config, and every test runs in memory.
 */
export function generateAgentDocs(
  manifest: Package,
  config: AgentDocsConfig,
  fs: FileSystem = nodeFileSystem
): WriteReport {
  const candidates = selectComponents(manifest, config.filter);
  const render = config.render ?? renderComponentPage;

  const files = new Map<string, string>();
  const rendered: Component[] = [];

  for (const component of candidates) {
    const tag = component.tagName as string;
    if (!isSafeBasename(tag)) {
      throw new Error(
        `agent-docs: invalid tagName "${tag}" for component ${component.name}: ` +
          `tag names must be a plain basename, not a path`
      );
    }

    const ctx: RenderContext = {
      config,
      api: normalizeApi(component),
      resolveType,
      siblings: candidates,
      manifest,
    };

    let page: string | null;
    try {
      page = render(component, ctx);
    } catch (cause) {
      // A silently missing page is worse than a broken build.
      throw new Error(
        `agent-docs: render failed for <${component.tagName}> (${component.name}): ` +
          `${cause instanceof Error ? cause.message : String(cause)}`,
        { cause }
      );
    }
    if (!page) continue;

    files.set(`${tag}.md`, page);
    rendered.push(component);
  }

  files.set('index.md', renderIndex(rendered, config));

  return writeDocs(config.outDir, files, fs);
}
