import { describe, expect, it } from 'vitest';
import { normalizeApi } from './normalize.ts';
import { renderComponentApi } from './render-component.ts';
import { resolveType } from './resolve-type.ts';
import { fixtureManifest, thingComponent, widgetComponent } from './test/fixtures.ts';
import type { Component, RenderContext } from './types.ts';

function context(component: Component): RenderContext {
  const manifest = fixtureManifest();
  return {
    config: { packageName: '@powered-by-zocdoc/primitives', outDir: 'out' },
    api: normalizeApi(component),
    resolveType,
    siblings: [widgetComponent(), thingComponent()],
    manifest,
  };
}

describe('renderComponentApi', () => {
  it('matches the snapshot for a component with a full surface', () => {
    expect(renderComponentApi(widgetComponent(), context(widgetComponent()))).toMatchSnapshot();
  });

  it('matches the snapshot for a component with no inherited API and no slots', () => {
    expect(renderComponentApi(thingComponent(), context(thingComponent()))).toMatchSnapshot();
  });

  it('leads with the tag name', () => {
    const md = renderComponentApi(widgetComponent(), context(widgetComponent()));
    expect(md.split('\n')[0]).toBe('# zd-widget');
  });

  it('escapes pipes inside union types so the table survives', () => {
    const md = renderComponentApi(widgetComponent(), context(widgetComponent()));
    expect(md).toContain("`'default' \\| 'small' \\| undefined`");
  });

  it('labels the default slot rather than emitting an empty cell', () => {
    const md = renderComponentApi(widgetComponent(), context(widgetComponent()));
    expect(md).toContain('| _(default)_ | Widget content. |');
  });

  it('puts inherited API after own API under its own heading', () => {
    const md = renderComponentApi(widgetComponent(), context(widgetComponent()));
    expect(md.indexOf('## Attributes & Properties')).toBeLessThan(md.indexOf('## Inherited'));
    expect(md).toContain('`CoreWidget`');
  });

  it('omits sections that have no rows', () => {
    const md = renderComponentApi(thingComponent(), context(thingComponent()));
    expect(md).not.toContain('## Slots');
    expect(md).not.toContain('## Methods');
    expect(md).not.toContain('## Inherited');
  });

  it('ends with exactly one trailing newline', () => {
    const md = renderComponentApi(thingComponent(), context(thingComponent()));
    expect(md.endsWith('\n')).toBe(true);
    expect(md.endsWith('\n\n')).toBe(false);
  });
});
