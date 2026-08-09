import { describe, expect, it } from 'vitest';
import { normalizeApi } from './normalize.ts';
import { defaultRender } from './render.ts';
import { renderComponentStyling } from './render-styling.ts';
import { resolveType } from './resolve-type.ts';
import { fixtureManifest, thingComponent, widgetComponent } from './test/fixtures.ts';
import type { Component, RenderContext } from './types.ts';

function context(component: Component): RenderContext {
  return {
    config: { packageName: '@powered-by-zocdoc/primitives', outDir: 'out' },
    api: normalizeApi(component),
    resolveType,
    siblings: [widgetComponent(), thingComponent()],
    manifest: fixtureManifest(),
  };
}

describe('renderComponentStyling', () => {
  it('matches the snapshot for a component with a styling surface', () => {
    expect(
      renderComponentStyling(widgetComponent(), context(widgetComponent()))
    ).toMatchSnapshot();
  });

  it('returns null when there is no styling surface at all', () => {
    expect(renderComponentStyling(thingComponent(), context(thingComponent()))).toBeNull();
  });

  it('covers parts, custom properties, and states', () => {
    const md = renderComponentStyling(widgetComponent(), context(widgetComponent())) ?? '';
    expect(md).toContain('## CSS Parts');
    expect(md).toContain('## CSS Custom Properties');
    expect(md).toContain('## CSS States');
    expect(md).toContain('`--zd-widget-gap`');
  });

  it('points back at the API page', () => {
    const md = renderComponentStyling(widgetComponent(), context(widgetComponent())) ?? '';
    expect(md).toContain('[zd-widget.md](zd-widget.md)');
  });
});

describe('defaultRender', () => {
  it('produces both files when the component has a styling surface', () => {
    const result = defaultRender(widgetComponent(), context(widgetComponent()));
    expect(result.api).toContain('# zd-widget');
    expect(result.styling).toContain('# zd-widget — Styling');
  });

  it('omits styling when there is none', () => {
    const result = defaultRender(thingComponent(), context(thingComponent()));
    expect(result.api).toContain('# zd-thing');
    expect(result.styling).toBeUndefined();
  });
});
