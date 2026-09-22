import { describe, expect, it } from 'vitest';
import { memoryFileSystem } from './write.ts';
import { runCli } from './cli.ts';

const MANIFEST = JSON.stringify({
  schemaVersion: '2.1.0',
  modules: [{ kind: 'javascript-module', path: 'button.ts', declarations: [
    { kind: 'class', name: 'ZdButton', tagName: 'zd-button', customElement: true },
  ]}],
});

describe('runCli', () => {
  it('reads the manifest file and writes a page per component', () => {
    const fs = memoryFileSystem({ '/tmp/cem.json': MANIFEST });
    const report = runCli(
      ['--manifest', '/tmp/cem.json', '--package', '@x/pkg', '--out', '/out'],
      fs,
    );
    expect(report.written).toContain('/out/zd-button.md');
    expect(fs.files.get('/out/index.md')).toBeTruthy();
  });

  it('throws on a missing manifest instead of writing an empty index', () => {
    const fs = memoryFileSystem({});
    expect(() => runCli(['--manifest', '/nope.json', '--package', '@x/pkg', '--out', '/out'], fs))
      .toThrow(/manifest/i);
    expect(fs.files.size).toBe(0); // nothing written — Review Focus #2
  });
});
