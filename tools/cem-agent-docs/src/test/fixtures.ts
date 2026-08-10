import type { Component, Package } from '../types.ts';

/**
 * A primitive-shaped component: reflected props, a private backing field, an inherited
 * attribute, a styling surface, and a method.
 */
export function widgetComponent(): Component {
  return {
    kind: 'class',
    name: 'ZdWidget',
    tagName: 'zd-widget',
    customElement: true,
    modulePath: 'src/components/widget/widget.ts',
    description: 'A widget. Renders a labelled control.',
    superclass: { name: 'CoreWidget', package: '@charm-ux/core' },
    attributes: [
      {
        name: 'size',
        fieldName: 'size',
        type: { text: 'ZdControlSize | undefined' },
        parsedType: { text: "'default' | 'small' | undefined" },
        default: "'default'",
        description: 'Control size.',
      },
      {
        name: 'patient-type',
        fieldName: 'patientType',
        type: { text: "'new' | 'existing'" },
        description: 'Which booking path to show.',
      },
      {
        name: 'disabled',
        fieldName: 'disabled',
        type: { text: 'boolean' },
        parsedType: { text: 'false | true' },
        default: 'false',
        description: 'Disables the control.',
        inheritedFrom: { name: 'CoreWidget', package: '@charm-ux/core' },
      },
      {
        name: 'aria-label',
        type: { text: 'string' },
        description: 'Accessibility label.',
      },
    ],
    members: [
      {
        kind: 'field',
        name: 'size',
        type: { text: 'ZdControlSize | undefined' },
        privacy: 'public',
      },
      {
        kind: 'field',
        name: 'patientType',
        type: { text: "'new' | 'existing'" },
        privacy: 'public',
      },
      {
        kind: 'field',
        name: 'disabled',
        type: { text: 'boolean' },
        privacy: 'public',
        inheritedFrom: { name: 'CoreWidget', package: '@charm-ux/core' },
      },
      { kind: 'field', name: '_internal', type: { text: 'string' }, privacy: 'public' },
      { kind: 'field', name: 'hidden', type: { text: 'boolean' }, privacy: 'private' },
      {
        kind: 'field',
        name: 'baseName',
        type: { text: 'string' },
        privacy: 'public',
        static: true,
      },
      {
        kind: 'field',
        name: 'form',
        type: { text: 'HTMLFormElement | null' },
        privacy: 'public',
        readonly: true,
        description: 'The associated form.',
      },
      {
        kind: 'field',
        name: 'internalState',
        type: { text: 'string' },
        privacy: 'protected',
        description: 'Internal state (should be dropped).',
      },
      {
        kind: 'method',
        name: 'focus',
        privacy: 'public',
        description: 'Moves focus to the control.',
        parameters: [{ name: 'options', type: { text: 'FocusOptions' }, optional: true }],
        return: { type: { text: 'void' } },
      },
      { kind: 'method', name: '_sync', privacy: 'public' },
    ],
    events: [
      {
        name: 'zd-widget-change',
        type: { text: 'ZdWidgetChangeEvent' },
        parsedType: { text: '{ value: string }' },
        description: 'Fired when the value changes.',
      },
    ],
    slots: [
      { name: '', description: 'Widget content.' },
      { name: 'icon', description: 'Leading icon.', inheritedFrom: { name: 'CoreWidget' } },
    ],
    cssParts: [
      { name: 'base', description: 'The outer wrapper.' },
      {
        name: 'icon',
        description: 'The leading icon wrapper.',
        inheritedFrom: { name: 'CoreWidget' },
      },
    ],
    cssStates: [{ name: 'invalid', description: 'Applied when validation fails.' }],
    cssProperties: [
      {
        name: '--zd-widget-gap',
        syntax: '<length>',
        default: '8px',
        description: 'Gap between icon and label.',
      },
    ],
  };
}

/** An API-component-shaped component: object-typed props, no styling surface. */
export function thingComponent(): Component {
  return {
    kind: 'class',
    name: 'ZdThing',
    tagName: 'zd-thing',
    customElement: true,
    modulePath: 'src/components/thing/thing.ts',
    description: 'Fetches and renders a thing.',
    attributes: [],
    members: [
      {
        kind: 'field',
        name: 'values',
        type: { text: 'Record<string, string>' },
        parsedType: { text: '{ }' },
        privacy: 'public',
        description: 'Current field values.',
      },
      {
        kind: 'field',
        name: 'state',
        type: { text: "'idle' | 'loading' | 'success' | 'empty' | 'error'" },
        privacy: 'public',
        default: "'idle'",
      },
    ],
    events: [{ name: 'zd-thing-error', type: { text: 'ZocdocErrorEvent' } }],
  };
}

/** A declaration with no tagName — a base class the generator must skip silently. */
function baseClass(): Component {
  return { kind: 'class', name: 'ThingBase', description: 'Not a custom element.' };
}

export function fixtureManifest(): Package {
  return {
    schemaVersion: '2.1.0',
    modules: [
      {
        kind: 'javascript-module',
        path: 'src/components/widget/widget.ts',
        declarations: [widgetComponent()],
      },
      {
        kind: 'javascript-module',
        path: 'src/components/thing/thing.ts',
        declarations: [thingComponent(), baseClass()],
      },
    ],
  };
}
