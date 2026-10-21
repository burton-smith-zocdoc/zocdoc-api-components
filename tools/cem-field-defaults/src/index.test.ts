import { describe, expect, it } from 'vitest';
import { type FileContext, type Plugin } from '@wc-toolkit/cem-generator';
import ts from 'typescript';
import { fieldDefaultsPlugin } from './index.ts';

type CemPackage = Parameters<NonNullable<Plugin['afterGenerate']>>[0];

const SOURCE = `const PAGE_SIZE = 10;
let mutable = 3;
export class ZdThing {
  modal = false;
  patientType: 'new' | 'existing' = 'new';
  pageSize = PAGE_SIZE;
  page = 0;
  label = \`Search\`;
  later = mutable;
  items = [];
  stamped = new Date();
  documented = true;
}`;

function fileContext(source: string): FileContext {
  const options: ts.CompilerOptions = { target: ts.ScriptTarget.ES2022, noLib: true };
  const host = ts.createCompilerHost(options);
  host.getSourceFile = (name, version) =>
    name === '/c.ts' ? ts.createSourceFile(name, source, version, true) : undefined;
  host.fileExists = (name) => name === '/c.ts';
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

const FIELDS = [
  'modal',
  'patientType',
  'pageSize',
  'page',
  'label',
  'later',
  'items',
  'stamped',
  'documented',
];

function run(): { members: Record<string, unknown>; attribute: unknown } {
  const m = {
    schemaVersion: '2.1.0',
    modules: [
      {
        kind: 'javascript-module',
        path: 'c.js',
        declarations: [
          {
            kind: 'class',
            name: 'ZdThing',
            members: FIELDS.map((name) => ({
              kind: 'field',
              name,
              // An explicit @default the detector already set.
              ...(name === 'documented' ? { default: 'from-jsdoc' } : {}),
            })),
            attributes: [{ name: 'patient-type', fieldName: 'patientType' }],
          },
        ],
      },
    ],
  } as unknown as CemPackage;
  const plugin = fieldDefaultsPlugin();
  plugin.onFile?.(fileContext(SOURCE));
  plugin.afterGenerate?.(m);
  const declaration = m.modules[0].declarations?.[0] as {
    members: { name: string; default?: string }[];
    attributes: { default?: string }[];
  };
  return {
    members: Object.fromEntries(declaration.members.map((f) => [f.name, f.default])),
    attribute: declaration.attributes[0].default,
  };
}

describe('fieldDefaultsPlugin', () => {
  it('documents literal initializers, resolving constants with a literal type', () => {
    expect(run().members).toMatchObject({
      modal: 'false',
      patientType: "'new'",
      pageSize: '10',
      page: '0',
      label: "'Search'",
    });
  });

  it('leaves out defaults it cannot state exactly', () => {
    const { members } = run();
    expect(members.later).toBeUndefined();
    expect(members.items).toBeUndefined();
    expect(members.stamped).toBeUndefined();
  });

  it('keeps an explicit @default over the initializer', () => {
    expect(run().members.documented).toBe('from-jsdoc');
  });

  it('puts the default on the attribute that reflects the field', () => {
    expect(run().attribute).toBe("'new'");
  });
});
