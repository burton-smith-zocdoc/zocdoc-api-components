/**
 * Markdown table primitives, shared by every section renderer. Kept in their own module so the
 * API and styling section builders can both use them without importing each other.
 */

/** A table cell: pipes escaped, newlines flattened, empty rendered as an em dash. */
export function cell(value?: string): string {
  if (!value) return '—';
  const flat = value
    .replace(/\s*\n+\s*/g, ' ')
    .replace(/\|/g, '\\|')
    .trim();
  return flat || '—';
}

/** A code-formatted table cell. */
export function code(value?: string): string {
  if (!value) return '—';
  return `\`${value.replace(/\|/g, '\\|')}\``;
}

export function table(headers: string[], rows: string[][]): string {
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n');
}
