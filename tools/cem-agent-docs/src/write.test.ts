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

  it('rejects a name that escapes outDir, before writing any entry in the map', () => {
    const fs = memoryFileSystem({ 'out/a.md': '# A\n' });
    const before = new Map(fs.files);
    const files = new Map([
      ['ok.md', '# OK\n'],
      ['../evil.md', '# Evil\n'],
    ]);

    expect(() => writeDocs('out', files, fs)).toThrow(/outDir/);
    expect(fs.files).toEqual(before);
  });

  it('allows a legitimate name that merely contains dots', () => {
    const fs = memoryFileSystem();
    const report = writeDocs('out', new Map([['zd-x.y.md', '# XY\n']]), fs);

    expect(fs.files.get('out/zd-x.y.md')).toBe('# XY\n');
    expect(report.written).toEqual(['out/zd-x.y.md']);
  });
});
