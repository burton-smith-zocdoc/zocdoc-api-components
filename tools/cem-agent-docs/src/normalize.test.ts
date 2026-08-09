import { describe, expect, it } from 'vitest';
import { normalizeApi } from './normalize.ts';
import { thingComponent, widgetComponent } from './test/fixtures.ts';

describe('normalizeApi', () => {
  it('collapses an attribute and its backing property into one row', () => {
    const { own } = normalizeApi(widgetComponent());
    const size = own.props.find((prop) => prop.attribute === 'size');
    expect(size).toEqual({
      attribute: 'size',
      property: 'size',
      type: "'default' | 'small' | undefined",
      default: "'default'",
      description: 'Control size.',
      readonly: false,
    });
    expect(own.props.filter((prop) => prop.property === 'size')).toHaveLength(1);
  });

  it('keeps both names when attribute and property differ', () => {
    const { own } = normalizeApi(widgetComponent());
    const row = own.props.find((prop) => prop.property === 'patientType');
    expect(row?.attribute).toBe('patient-type');
  });

  it('includes a property that has no attribute', () => {
    const { own } = normalizeApi(widgetComponent());
    const form = own.props.find((prop) => prop.property === 'form');
    expect(form?.attribute).toBeUndefined();
    expect(form?.readonly).toBe(true);
  });

  it('drops private, underscore-prefixed, and static members', () => {
    const { own } = normalizeApi(widgetComponent());
    const names = own.props.map((prop) => prop.property);
    expect(names).not.toContain('_internal');
    expect(names).not.toContain('hidden');
    expect(names).not.toContain('baseName');
    expect(own.methods.map((method) => method.name)).not.toContain('_sync');
  });

  it('drops protected members and produces attribute-only props', () => {
    const { own } = normalizeApi(widgetComponent());
    // Protected member should be absent.
    expect(own.props.map((prop) => prop.property)).not.toContain('internalState');
    // Attribute with no backing field produces a row with property undefined.
    const ariaLabel = own.props.find((prop) => prop.attribute === 'aria-label');
    expect(ariaLabel).toEqual({
      attribute: 'aria-label',
      type: 'string',
      description: 'Accessibility label.',
      readonly: false,
    });
  });

  it('partitions inherited members out of own', () => {
    const { own, inherited } = normalizeApi(widgetComponent());
    expect(own.props.map((prop) => prop.property)).not.toContain('disabled');
    expect(inherited.props.map((prop) => prop.property)).toContain('disabled');
    expect(inherited.props.find((prop) => prop.property === 'disabled')?.inheritedFrom).toBe(
      'CoreWidget'
    );
    expect(inherited.slots.map((slot) => slot.name)).toEqual(['icon']);
  });

  it('applies the literal-union rule to props and events', () => {
    const { own, inherited } = normalizeApi(widgetComponent());
    // `boolean` must not become `false | true`.
    expect(inherited.props.find((prop) => prop.attribute === 'disabled')?.type).toBe('boolean');
    // An event whose parsedType is an object keeps the event class name.
    expect(own.events[0]).toEqual({
      name: 'zd-widget-change',
      type: 'ZdWidgetChangeEvent',
      description: 'Fired when the value changes.',
    });
  });

  it('rejects the collapsed index signature on a property', () => {
    const { own } = normalizeApi(thingComponent());
    expect(own.props.find((prop) => prop.property === 'values')?.type).toBe(
      'Record<string, string>'
    );
  });

  it('renders a method signature with optional parameters and a return type', () => {
    const { own } = normalizeApi(widgetComponent());
    expect(own.methods).toEqual([
      {
        name: 'focus',
        signature: 'focus(options?: FocusOptions): void',
        description: 'Moves focus to the control.',
      },
    ]);
  });

  it('carries the styling surface through', () => {
    const { own } = normalizeApi(widgetComponent());
    expect(own.cssParts.map((part) => part.name)).toEqual(['base']);
    expect(own.cssStates.map((state) => state.name)).toEqual(['invalid']);
    expect(own.cssProperties[0]).toEqual({
      name: '--zd-widget-gap',
      syntax: '<length>',
      default: '8px',
      description: 'Gap between icon and label.',
    });
  });

  it('produces empty groups for a component with no styling surface', () => {
    const { own } = normalizeApi(thingComponent());
    expect(own.cssParts).toEqual([]);
    expect(own.cssProperties).toEqual([]);
    expect(own.cssStates).toEqual([]);
  });
});
