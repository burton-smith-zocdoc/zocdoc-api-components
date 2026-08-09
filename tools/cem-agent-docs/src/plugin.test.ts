import { describe, expect, it } from 'vitest';
import { agentDocsPlugin } from './plugin.ts';
import { fixtureManifest } from './test/fixtures.ts';
import { memoryFileSystem } from './write.ts';

describe('agentDocsPlugin', () => {
  it('is named so analyzer errors are attributable', () => {
    expect(agentDocsPlugin({ packageName: 'p', outDir: 'refs' }).name).toBe('agent-docs');
  });

  it('generates from packageLinkPhase', () => {
    const fs = memoryFileSystem();
    const plugin = agentDocsPlugin({ packageName: 'p', outDir: 'refs' }, fs);

    plugin.packageLinkPhase({ customElementsManifest: fixtureManifest() });

    expect(fs.files.has('refs/index.md')).toBe(true);
    expect(fs.files.has('refs/zd-widget.md')).toBe(true);
  });

  it('does not mutate the manifest', () => {
    const fs = memoryFileSystem();
    const manifest = fixtureManifest();
    const before = JSON.stringify(manifest);

    agentDocsPlugin({ packageName: 'p', outDir: 'refs' }, fs).packageLinkPhase({
      customElementsManifest: manifest,
    });

    expect(JSON.stringify(manifest)).toBe(before);
  });
});
