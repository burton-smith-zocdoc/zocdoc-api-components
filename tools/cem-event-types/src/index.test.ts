import { describe, expect, it } from 'vitest';
import { type FileContext, type Plugin } from '@wc-toolkit/cem-generator';
import ts from 'typescript';
import { eventTypesPlugin } from './index.ts';

type CemPackage = Parameters<NonNullable<Plugin['afterGenerate']>>[0];

const SHARED = `export interface ErrorDetail { error: unknown }
export interface TypedEmit<M> { (name: keyof M): void }`;

/** A real checker over an in-memory program, so the plugin reads source the way the generator does. */
function fileContext(source: string): FileContext {
  const files: Record<string, string> = { '/c.ts': source, '/events.ts': SHARED };
  const options: ts.CompilerOptions = { target: ts.ScriptTarget.ES2022, noLib: true };
  const host = ts.createCompilerHost(options);
  host.getSourceFile = (name, version) =>
    name in files ? ts.createSourceFile(name, files[name], version, true) : undefined;
  host.fileExists = (name) => name in files;
  host.readFile = (name) => files[name];
  const program = ts.createProgram(['/c.ts'], options, host);
  const sourceFile = program.getSourceFile('/c.ts');
  if (!sourceFile) throw new Error('fixture did not compile');
  return {
    filePath: '/c.ts',
    sourceText: source,
    sourceFile,
    checker: program.getTypeChecker(),
    typeParsing: 'public',
  };
}

const COMPONENT = `import type { ErrorDetail, TypedEmit } from './events';
export type { ErrorDetail } from './events';
export interface DoneDetail { id: string }
export interface ZdThingEventMap {
  'thing-done': CustomEvent<DoneDetail>;
  'thing-error': CustomEvent<ErrorDetail>;
  'thing-more': CustomEvent<Record<string, never>>;
}
export class ZdThing { declare protected emit: TypedEmit<ZdThingEventMap>; }`;

const manifest = (events: string[]): CemPackage =>
  ({
    schemaVersion: '2.1.0',
    modules: [
      {
        kind: 'javascript-module',
        path: 'c.js',
        declarations: [
          {
            kind: 'class',
            name: 'ZdThing',
            tagName: 'zd-thing',
            customElement: true,
            events: events.map((name) => ({ name, type: { text: 'Event' } })),
            members: [
              { kind: 'field', name: 'addEventListener' },
              { kind: 'field', name: 'removeEventListener' },
              { kind: 'field', name: 'open' },
            ],
          },
        ],
      },
    ],
  }) as unknown as CemPackage;

function run(source: string, events: string[]): Record<string, string | undefined> {
  const plugin = eventTypesPlugin();
  plugin.onFile?.(fileContext(source));
  const m = manifest(events);
  plugin.afterGenerate?.(m);
  const declaration = m.modules[0].declarations?.[0] as {
    events: { name: string; type?: { text: string } }[];
  };
  return Object.fromEntries(declaration.events.map((e) => [e.name, e.type?.text]));
}

describe('eventTypesPlugin', () => {
  it('types each documented event from the event map emit is narrowed to', () => {
    expect(run(COMPONENT, ['thing-done', 'thing-error', 'thing-more', 'ready'])).toEqual({
      'thing-done': 'CustomEvent<DoneDetail>',
      'thing-error': 'CustomEvent<ErrorDetail>',
      'thing-more': 'CustomEvent<Record<string, never>>',
      // Inherited, and absent from the map: left as the analyzer found it.
      ready: 'Event',
    });
  });

  it('drops the typed listener overrides, which are typing rather than properties', () => {
    const plugin = eventTypesPlugin();
    plugin.onFile?.(fileContext(COMPONENT));
    const m = manifest(['thing-done', 'thing-error', 'thing-more']);
    plugin.afterGenerate?.(m);
    const declaration = m.modules[0].declarations?.[0] as { members: { name: string }[] };
    expect(declaration.members.map((member) => member.name)).toEqual(['open']);
  });

  it('throws when a detail type is not exported from the component module', () => {
    const source = COMPONENT.replace("export type { ErrorDetail } from './events';\n", '');
    expect(() => run(source, ['thing-done', 'thing-error', 'thing-more'])).toThrow(
      /'thing-error' carries ErrorDetail, which \/c\.ts does not export/
    );
  });

  it('throws when the map names an event with no @event tag', () => {
    expect(() => run(COMPONENT, ['thing-done', 'thing-error'])).toThrow(
      /emits 'thing-more' but has no @event tag/
    );
  });

  it('leaves a class without a typed emit alone', () => {
    expect(run('export class ZdThing {}', ['thing-done'])).toEqual({ 'thing-done': 'Event' });
  });
});
