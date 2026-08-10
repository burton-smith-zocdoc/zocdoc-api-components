import { cell, code, table } from './markdown.ts';
import type { ApiGroups } from './types.ts';

/**
 * The CSS surface — parts, custom properties, and states — as sections appended to the
 * component's one page. Sections with no rows are omitted, so a component with nothing to
 * style contributes nothing.
 */
export function stylingSections(groups: ApiGroups, level: string, withOrigin: boolean): string[] {
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
