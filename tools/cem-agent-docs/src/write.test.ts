import { describe, expect, it } from 'vitest';
import { memoryFileSystem, writeDocs } from './write.ts';

describe('writeDocs', () => {
  it('writes new files', () => {
    const fs = memoryFileSystem();
    const report = writeDocs('out', new Map([['a.md', '# A\n']]), fs);

    expect(fs.files.get('out/a.md')).toBe('# A\n');
    expect(report.written).toEqual(['out/a.md']);
  });

  it('does not touch a file whose content is byte-identical', () => {
    const fs = memoryFileSystem({ 'out/a.md': '# A\n' });
    const report = writeDocs('out', new Map([['a.md', '# A\n']]), fs);

    expect(report.written).toEqual([]);
    expect(report.unchanged).toEqual(['out/a.md']);
  });

  it('rewrites a file whose content changed', () => {
    const fs = memoryFileSystem({ 'out/a.md': '# A\n' });
    const report = writeDocs('out', new Map([['a.md', '# A2\n']]), fs);

    expect(fs.files.get('out/a.md')).toBe('# A2\n');
    expect(report.written).toEqual(['out/a.md']);
  });

  it('prunes an orphaned markdown file', () => {
    const fs = memoryFileSystem({ 'out/a.md': '# A\n', 'out/gone.md': '# Gone\n' });
    const report = writeDocs('out', new Map([['a.md', '# A\n']]), fs);

    expect(fs.files.has('out/gone.md')).toBe(false);
    expect(report.pruned).toEqual(['out/gone.md']);
  });

  it('leaves non-markdown files alone', () => {
    const fs = memoryFileSystem({ 'out/keep.txt': 'x' });
    writeDocs('out', new Map([['a.md', '# A\n']]), fs);

    expect(fs.files.has('out/keep.txt')).toBe(true);
  });

  it('never reaches outside outDir', () => {
    const fs = memoryFileSystem({ 'SKILL.md': '# Hand written\n', 'out/gone.md': 'x' });
    writeDocs('out', new Map([['a.md', '# A\n']]), fs);

    expect(fs.files.get('SKILL.md')).toBe('# Hand written\n');
  });

  it('creates outDir before writing', () => {
    const fs = memoryFileSystem();
    writeDocs('deep/nested/out', new Map([['a.md', '# A\n']]), fs);

    expect(fs.files.get('deep/nested/out/a.md')).toBe('# A\n');
  });
});
