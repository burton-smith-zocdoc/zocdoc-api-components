/**
 * Renders the docs site as `llms.txt` (https://llmstxt.org): an index of every page's markdown
 * URL, plus `llms-full.txt` with every page inline. For agents that have no `node_modules` to
 * read `agent-docs/` from, such as a chat assistant writing an HTML artifact.
 *
 * Pure: pages in, text out. The docs site loads and converts the pages.
 */

export interface LlmsPage {
  /** Absolute URL of the page's markdown, so the index works wherever it's fetched from. */
  url: string;
  title: string;
  description?: string;
  /** The converted page, headed by its title. */
  markdown: string;
}

export interface LlmsSection {
  heading: string;
  pages: LlmsPage[];
}

export interface LlmsSite {
  title: string;
  summary: string;
  /** Prose between the summary and the sections: what version this is and how to use it. */
  notes: string[];
  sections: LlmsSection[];
}

export function renderLlmsIndex(site: LlmsSite): string {
  const lines = [`# ${site.title}`, `> ${site.summary}`, ...site.notes];
  for (const section of site.sections) {
    lines.push(
      `## ${section.heading}`,
      section.pages
        .map((p) => `- [${p.title}](${p.url})${p.description ? `: ${p.description}` : ''}`)
        .join('\n')
    );
  }
  return `${lines.join('\n\n')}\n`;
}

export function renderLlmsFull(site: LlmsSite): string {
  const head = [`# ${site.title}`, `> ${site.summary}`, ...site.notes].join('\n\n');
  // Each page keeps its own `# Title`, so a source line is what tells one page from the next.
  const pages = site.sections.flatMap((section) =>
    section.pages.map((p) => `${p.markdown.trim()}\n\nSource: ${p.url}`)
  );
  return `${[head, ...pages].join('\n\n---\n\n')}\n`;
}
