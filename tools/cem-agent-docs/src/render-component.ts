import type { ApiGroups, Component, RenderContext } from './types.ts';

/** A table cell: pipes escaped, newlines flattened, empty rendered as an em dash. */
export function cell(value?: string): string {
  if (!value) return '—';
  const flat = value.replace(/\s*\n+\s*/g, ' ').replace(/\|/g, '\\|').trim();
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

function slotName(name: string): string {
  return name ? code(name) : '_(default)_';
}

/**
 * Render the shared groups at a given heading level, with an origin column when these are
 * inherited. Sections with no rows are omitted entirely — an empty table is pure noise in a
 * file whose whole purpose is to stay small.
 */
function sections(groups: ApiGroups, level: string, withOrigin: boolean): string[] {
  const out: string[] = [];
  const extend = (headers: string[]) => (withOrigin ? [...headers, 'From'] : headers);
  const origin = (value?: string) => (withOrigin ? [code(value)] : []);

  if (groups.props.length) {
    out.push(`${level} Attributes & Properties`);
    out.push(
      table(
        extend(['Attribute', 'Property', 'Type', 'Default', 'Description']),
        groups.props.map((prop) => [
          code(prop.attribute),
          code(prop.property),
          code(prop.type),
          code(prop.default),
          cell(prop.readonly ? `${prop.description ?? ''} (readonly)`.trim() : prop.description),
          ...origin(prop.inheritedFrom),
        ])
      )
    );
  }

  if (groups.events.length) {
    out.push(`${level} Events`);
    out.push(
      table(
        extend(['Event', 'Type', 'Description']),
        groups.events.map((event) => [
          code(event.name),
          code(event.type),
          cell(event.description),
          ...origin(event.inheritedFrom),
        ])
      )
    );
  }

  if (groups.slots.length) {
    out.push(`${level} Slots`);
    out.push(
      table(
        extend(['Slot', 'Description']),
        groups.slots.map((slot) => [
          slotName(slot.name),
          cell(slot.description),
          ...origin(slot.inheritedFrom),
        ])
      )
    );
  }

  if (groups.methods.length) {
    out.push(`${level} Methods`);
    out.push(
      table(
        extend(['Method', 'Description']),
        groups.methods.map((method) => [
          code(method.signature),
          cell(method.description),
          ...origin(method.inheritedFrom),
        ])
      )
    );
  }

  return out;
}

/**
 * The callable surface: what an agent needs to answer "what props does this take". Styling
 * lives in a sibling file so the common question never pays for the CSS surface.
 */
export function renderComponentApi(component: Component, ctx: RenderContext): string {
  const tag = component.tagName ?? component.name;
  const out: string[] = [`# ${tag}`];

  if (component.description) out.push(component.description.trim());

  const meta = [`**Class** \`${component.name}\``];
  if (component.modulePath) meta.push(`**Module** \`${component.modulePath}\``);
  meta.push(`**Package** \`${ctx.config.packageName}\``);
  out.push(meta.join(' — '));

  out.push(['```html', `<${tag}></${tag}>`, '```'].join('\n'));

  out.push(...sections(ctx.api.own, '##', false));

  const inherited = sections(ctx.api.inherited, '###', true);
  if (inherited.length) {
    out.push('## Inherited');
    out.push(...inherited);
  }

  return `${out.join('\n\n')}\n`;
}
