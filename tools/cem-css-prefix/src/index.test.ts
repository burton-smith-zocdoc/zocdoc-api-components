import { describe, expect, it } from 'vitest';
import type { Package } from 'custom-elements-manifest/schema';
import { cssPrefixPlugin } from './index.ts';

// Build a minimal CemPackage the afterGenerate hook can mutate. `null` cssProperties
// on the second declaration reproduces the probe's observed emitted shape.
const manifest = (): Package =>
  ({
    schemaVersion: '2.1.0',
    modules: [
      {
        kind: 'javascript-module',
        path: 'x.ts',
        declarations: [
          {
            kind: 'class',
            name: 'ZdButton',
            tagName: 'zd-button',
            cssParts: [{ name: 'base' }],
            cssProperties: [{ name: '--button-bg' }, { name: '--zd-already' }],
          },
          // Reproduces `"cssProperties": null` seen in the probe smoke test.
          { kind: 'class', name: 'ZdBare', tagName: 'zd-bare', cssProperties: null },
        ],
      },
    ],
  }) as unknown as Package;

describe('cssPrefixPlugin', () => {
  it('prefixes css parts and custom properties with the given prefix', () => {
    const m = manifest();
    // Invoke the real hook directly — cssPrefixPlugin returns a Plugin with afterGenerate.
    cssPrefixPlugin({ prefix: 'zd' }).afterGenerate?.(m);
    const decl = (m.modules[0].declarations as any[])[0];
    expect(decl.cssParts[0].name).toBe('zd-base');
    expect(decl.cssProperties[0].name).toBe('--zd-button-bg');
  });

  it('does not double-prefix already-prefixed names', () => {
    const m = manifest();
    cssPrefixPlugin({ prefix: 'zd' }).afterGenerate?.(m);
    expect((m.modules[0].declarations as any[])[0].cssProperties[1].name).toBe('--zd-already');
  });

  it('tolerates null/absent cssProperties without throwing', () => {
    const m = manifest();
    expect(() => cssPrefixPlugin({ prefix: 'zd' }).afterGenerate?.(m)).not.toThrow();
  });
});
