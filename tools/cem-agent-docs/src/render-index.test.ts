import { describe, expect, it } from 'vitest';
import { firstSentence, renderIndex } from './render-index.ts';
import { thingComponent, widgetComponent } from './test/fixtures.ts';
import type { AgentDocsConfig } from './types.ts';

const config: AgentDocsConfig = {
  packageName: '@powered-by-zocdoc/primitives',
  outDir: 'out',
};

describe('firstSentence', () => {
  it('stops at the first sentence boundary', () => {
    expect(firstSentence('A widget. Renders a labelled control.')).toBe('A widget.');
  });

  it('returns the whole text when there is no boundary', () => {
    expect(firstSentence('Fetches and renders a thing')).toBe('Fetches and renders a thing');
  });

  it('truncates an over-long sentence', () => {
    expect(firstSentence('x'.repeat(200), 20)).toBe(`${'x'.repeat(20)}…`);
  });

  it('flattens newlines', () => {
    expect(firstSentence('A widget\nwith a wrapped description')).toBe(
      'A widget with a wrapped description'
    );
  });

  it('returns an empty string for missing input', () => {
    expect(firstSentence(undefined)).toBe('');
  });
});

describe('renderIndex', () => {
  it('matches the snapshot', () => {
    expect(renderIndex([thingComponent(), widgetComponent()], config)).toMatchSnapshot();
  });

  it('sorts by tag name regardless of input order', () => {
    const md = renderIndex([widgetComponent(), thingComponent()], config);
    expect(md.indexOf('zd-thing')).toBeLessThan(md.indexOf('zd-widget'));
  });

  it('links each component to its page', () => {
    const md = renderIndex([widgetComponent()], config);
    expect(md).toContain('- [`zd-widget`](zd-widget.md) — A widget.');
  });

  it('notes the styling page only when one exists', () => {
    const md = renderIndex([widgetComponent(), thingComponent()], config);
    expect(md).toContain('[styling](zd-widget.styling.md)');
    expect(md).not.toContain('zd-thing.styling.md');
  });

  it('states the count and the package', () => {
    const md = renderIndex([widgetComponent(), thingComponent()], config);
    expect(md).toContain('`@powered-by-zocdoc/primitives`');
    expect(md).toContain('2 components');
  });

  it('handles an empty component list without emitting a broken list', () => {
    const md = renderIndex([], config);
    expect(md).toContain('0 components');
    expect(md).not.toContain('- [');
  });
});
