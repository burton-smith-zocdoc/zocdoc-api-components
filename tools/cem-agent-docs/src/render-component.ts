import { cell, code, table } from './markdown.ts';
import { stylingSections } from './render-styling.ts';
import type { ApiGroups, Component, NormalizedApi, RenderContext } from './types.ts';

function slotName(name: string): string {
  return name ? code(name) : '_(default)_';
}

/**
 * Render the shared groups at a given heading level, with an origin column when these are
 * inherited. Sections with no rows are omitted entirely — an empty table is pure noise in a
 * file whose whole purpose is to stay small.
 */
function apiSections(groups: ApiGroups, level: string, withOrigin: boolean): string[] {
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
 * A component's API below its heading, with sections at `depth`: the meta line, the callable
 * surface, the CSS surface, then everything inherited under one `Inherited` heading, so the top
 * stays the part a reader came for. Shared by the generated reference pages and the docs site,
 * which expands it under a heading of its own.
 */
export function renderApiBody(
  component: Component,
  api: NormalizedApi,
  packageName: string,
  depth: number
): string[] {
  const level = '#'.repeat(depth);
  const meta = [`**Class** \`${component.name}\``];
  if (component.modulePath) meta.push(`**Module** \`${component.modulePath}\``);
  meta.push(`**Package** \`${packageName}\``);

  const out = [
    meta.join(' — '),
    ...apiSections(api.own, level, false),
    ...stylingSections(api.own, level, false),
  ];
  const inherited = [
    ...apiSections(api.inherited, `${level}#`, true),
    ...stylingSections(api.inherited, `${level}#`, true),
  ];
  if (inherited.length) out.push(`${level} Inherited`, ...inherited);
  return out;
}

/**
 * One page per component. A component is one thing to an agent — splitting its API from its
 * styling meant every "how do I use this" question cost either a wrong guess or a second file
 * read.
 */
export function renderComponentPage(component: Component, ctx: RenderContext): string {
  const tag = component.tagName ?? component.name;
  const out: string[] = [`# ${tag}`];

  if (component.description) out.push(component.description.trim());

  const [meta, ...sections] = renderApiBody(component, ctx.api, ctx.config.packageName, 2);
  out.push(meta, ['```html', `<${tag}></${tag}>`, '```'].join('\n'), ...sections);

  return `${out.join('\n\n')}\n`;
}
