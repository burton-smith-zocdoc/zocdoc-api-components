import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * `bundle.ts` keeps its own hand-written export list rather than re-exporting `index.ts`, so a
 * component added to one and not the other ships as an undefined element to script-tag users.
 * Compared as source text because importing either entry would register every element.
 */
function componentModules(file: string): Set<string> {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8');
  return new Set(source.match(/'\.\/components\/[^']+\/index\.js'/g) ?? []);
}

describe('bundle entry', () => {
  it('re-exports every component the package root does', () => {
    const root = componentModules('./index.ts');
    // Two empty sets are equal, so an import-style change must fail here, not pass silently.
    expect(root.size).toBeGreaterThan(0);
    expect(componentModules('./bundle.ts')).toEqual(root);
  });
});
