import { cell, code, table } from './render-component.ts';
import type { ApiGroups, Component, RenderContext } from './types.ts';

function isEmpty(groups: ApiGroups): boolean {
  return (
    groups.cssParts.length === 0 &&
    groups.cssStates.length === 0 &&
    groups.cssProperties.length === 0
  );
}

function stylingSections(groups: ApiGroups, level: string, withOrigin: boolean): string[] {
  const out: string[] = [];
  const extend = (headers: string[]) => (withOrigin ? [...headers, 'From'] : headers);
  const origin = (value?: string) => (withOrigin ? [code(value)] : []);

  if (groups.cssParts.length) {
    out.push(`${level} CSS Parts`);
    out.push(
      table(
        extend(['Part', 'Description']),
        groups.cssParts.map((part) => [
          code(part.name),
          cell(part.description),
          ...origin(part.inheritedFrom),
        ])
      )
    );
  }

  if (groups.cssProperties.length) {
    out.push(`${level} CSS Custom Properties`);
    out.push(
      table(
        extend(['Property', 'Syntax', 'Default', 'Description']),
        groups.cssProperties.map((property) => [
          code(property.name),
          code(property.syntax),
          code(property.default),
          cell(property.description),
          ...origin(property.inheritedFrom),
        ])
      )
    );
  }

  if (groups.cssStates.length) {
    out.push(`${level} CSS States`);
    out.push(
      table(
        extend(['State', 'Description']),
        groups.cssStates.map((state) => [
          code(state.name),
          cell(state.description),
          ...origin(state.inheritedFrom),
        ])
      )
    );
  }

  return out;
}

/**
 * The CSS surface, kept out of the API page because the two are consulted in different tasks
 * and governed by different rules (STYLE-001 and the token files, which the hand-written
 * SKILL.md already explains). Returns null when the component exposes nothing to style, so
 * no empty file is written.
 */
export function renderComponentStyling(component: Component, ctx: RenderContext): string | null {
  const { own, inherited } = ctx.api;
  if (isEmpty(own) && isEmpty(inherited)) return null;

  const tag = component.tagName ?? component.name;
  const out: string[] = [`# ${tag} — Styling`, `API reference: [${tag}.md](${tag}.md)`];

  out.push(...stylingSections(own, '##', false));

  const inheritedSections = stylingSections(inherited, '###', true);
  if (inheritedSections.length) {
    out.push('## Inherited');
    out.push(...inheritedSections);
  }

  return `${out.join('\n\n')}\n`;
}
