import { describe, expect, it } from 'vitest';
import { normalizeApi } from './normalize.ts';
import { renderComponentPage } from './render-component.ts';
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

describe('renderComponentPage', () => {
  it('matches the snapshot for a component with a full surface', () => {
    expect(renderComponentPage(widgetComponent(), context(widgetComponent()))).toMatchSnapshot();
  });

  it('matches the snapshot for a component with no inherited API and no slots', () => {
    expect(renderComponentPage(thingComponent(), context(thingComponent()))).toMatchSnapshot();
  });

  it('leads with the tag name', () => {
    const md = renderComponentPage(widgetComponent(), context(widgetComponent()));
    expect(md.split('\n')[0]).toBe('# zd-widget');
  });

  it('escapes pipes inside union types so the table survives', () => {
    const md = renderComponentPage(widgetComponent(), context(widgetComponent()));
    expect(md).toContain("`'default' \\| 'small' \\| undefined`");
  });

  it('labels the default slot rather than emitting an empty cell', () => {
    const md = renderComponentPage(widgetComponent(), context(widgetComponent()));
    expect(md).toContain('| _(default)_ | Widget content. |');
  });

  it('carries the styling surface on the same page as the API', () => {
    const md = renderComponentPage(widgetComponent(), context(widgetComponent()));
    expect(md).toContain('## CSS Parts');
    expect(md).toContain('## CSS Custom Properties');
    expect(md).toContain('## CSS States');
    expect(md).toContain('`--zd-widget-gap`');
  });

  it('puts the callable surface before the CSS surface', () => {
    const md = renderComponentPage(widgetComponent(), context(widgetComponent()));
    expect(md.indexOf('## Methods')).toBeLessThan(md.indexOf('## CSS Parts'));
  });

  it('collects inherited API and inherited CSS under one Inherited heading', () => {
    const md = renderComponentPage(widgetComponent(), context(widgetComponent()));
    expect(md.match(/^## Inherited$/gm)).toHaveLength(1);
    expect(md.indexOf('## CSS Parts')).toBeLessThan(md.indexOf('## Inherited'));
    expect(md).toContain('### Attributes & Properties');
    expect(md).toContain('### CSS Parts');
    expect(md).toContain('`CoreWidget`');
  });

  it('omits sections that have no rows', () => {
    const md = renderComponentPage(thingComponent(), context(thingComponent()));
    expect(md).not.toContain('## Slots');
    expect(md).not.toContain('## Methods');
    expect(md).not.toContain('## CSS Parts');
    expect(md).not.toContain('## Inherited');
  });

  it('ends with exactly one trailing newline', () => {
    const md = renderComponentPage(thingComponent(), context(thingComponent()));
    expect(md.endsWith('\n')).toBe(true);
    expect(md.endsWith('\n\n')).toBe(false);
  });
});
