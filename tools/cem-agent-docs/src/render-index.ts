import type { AgentDocsConfig, Component } from './types.ts';

/**
 * The first sentence of a class JSDoc, flattened and capped. The index is the file an agent
 * reads to decide where to look next, so a line that runs long defeats the point.
 */
export function firstSentence(text: string | undefined, maxLength = 120): string {
  if (!text) return '';
  const flat = text.replace(/\s*\n+\s*/g, ' ').trim();
  const match = /^(.*?[.!?])(\s|$)/.exec(flat);
  const sentence = (match ? match[1] : flat).trim();
  return sentence.length > maxLength ? `${sentence.slice(0, maxLength)}…` : sentence;
}

/**
 * A flat, tag-sorted catalog. Deliberately not grouped by category: nothing in the manifest
 * carries one, and a taxonomy the generator invents would be wrong the first time a component
 * is added.
 *
 * `components` is what the render hook actually produced a page for, not every candidate, so
 * every link here resolves to a file on disk.
 */
export function renderIndex(components: Component[], config: AgentDocsConfig): string {
  const sorted = [...components].sort((a, b) =>
    (a.tagName ?? a.name).localeCompare(b.tagName ?? b.name)
  );

  const out: string[] = [
    `# \`${config.packageName}\` — Component Index`,
    'Generated from the Custom Elements Manifest. Do not edit by hand.',
    `${sorted.length} components. Read this file first, then open the one page you need.`,
  ];

  if (sorted.length) {
    out.push(
      sorted
        .map((component) => {
          const tag = component.tagName ?? component.name;
          const summary = firstSentence(component.summary ?? component.description);
          return `- [\`${tag}\`](${tag}.md) — ${summary || 'No description.'}`;
        })
        .join('\n')
    );
  }

  return `${out.join('\n\n')}\n`;
}
