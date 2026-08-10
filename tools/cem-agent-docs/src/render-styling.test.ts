import { describe, expect, it } from 'vitest';
import { normalizeApi } from './normalize.ts';
import { stylingSections } from './render-styling.ts';
import { thingComponent, widgetComponent } from './test/fixtures.ts';

const widget = normalizeApi(widgetComponent());
const thing = normalizeApi(thingComponent());

describe('stylingSections', () => {
  it('emits parts, custom properties, and states in that order', () => {
    const out = stylingSections(widget.own, '##', false);
    expect(out.filter((section) => section.startsWith('##'))).toEqual([
      '## CSS Parts',
      '## CSS Custom Properties',
      '## CSS States',
    ]);
  });

  it('renders the custom property row with syntax and default', () => {
    const out = stylingSections(widget.own, '##', false).join('\n');
    expect(out).toContain(
      '| `--zd-widget-gap` | `<length>` | `8px` | Gap between icon and label. |'
    );
  });

  it('returns nothing for a component with no styling surface', () => {
    expect(stylingSections(thing.own, '##', false)).toEqual([]);
    expect(stylingSections(thing.inherited, '###', true)).toEqual([]);
  });

  it('honours the heading level it is given', () => {
    expect(stylingSections(widget.own, '###', false)).toContain('### CSS Parts');
  });

  it('adds a From column naming the origin when rendering inherited members', () => {
    const out = stylingSections(widget.inherited, '###', true).join('\n');
    expect(out).toContain('### CSS Parts');
    expect(out).toContain('| Part | Description | From |');
    expect(out).toContain('| `icon` | The leading icon wrapper. | `CoreWidget` |');
  });

  it('omits the From column when rendering own members', () => {
    const out = stylingSections(widget.own, '##', false).join('\n');
    expect(out).toContain('| Part | Description |');
    expect(out).not.toContain('| From |');
  });
});
