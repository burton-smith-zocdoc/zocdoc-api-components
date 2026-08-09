import type { AgentDocsConfig, Component } from './types.ts';

/** True when the component exposes anything a styling page would document. */
function hasStyling(component: Component): boolean {
  return Boolean(
    component.cssParts?.length || component.cssStates?.length || component.cssProperties?.length
  );
}

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
          const styling = hasStyling(component) ? ` · [styling](${tag}.styling.md)` : '';
          return `- [\`${tag}\`](${tag}.md) — ${summary || 'No description.'}${styling}`;
        })
        .join('\n')
    );
  }

  return `${out.join('\n\n')}\n`;
}
