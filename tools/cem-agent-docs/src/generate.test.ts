import { describe, expect, it } from 'vitest';
import { generateAgentDocs, selectComponents } from './generate.ts';
import { fixtureManifest } from './test/fixtures.ts';
import { memoryFileSystem } from './write.ts';
import type { AgentDocsConfig, Package } from './types.ts';

const config: AgentDocsConfig = {
  packageName: '@powered-by-zocdoc/primitives',
  outDir: 'refs',
};

describe('selectComponents', () => {
  it('skips declarations with no tagName', () => {
    expect(selectComponents(fixtureManifest()).map((c) => c.tagName)).toEqual([
      'zd-thing',
      'zd-widget',
    ]);
  });

  it('applies a custom filter', () => {
    const selected = selectComponents(fixtureManifest(), (c) => c.tagName !== 'zd-thing');
    expect(selected.map((c) => c.tagName)).toEqual(['zd-widget']);
  });
});

describe('generateAgentDocs', () => {
  it('writes an index and exactly one page per component', () => {
    const fs = memoryFileSystem();
    generateAgentDocs(fixtureManifest(), config, fs);

    expect([...fs.files.keys()].sort()).toEqual([
      'refs/index.md',
      'refs/zd-thing.md',
      'refs/zd-widget.md',
    ]);
    // zd-widget has a styling surface, and it lands on the component's own page.
    expect(fs.files.get('refs/zd-widget.md')).toContain('## CSS Parts');
  });

  it('is idempotent — a second run writes nothing', () => {
    const fs = memoryFileSystem();
    generateAgentDocs(fixtureManifest(), config, fs);
    const second = generateAgentDocs(fixtureManifest(), config, fs);

    expect(second.written).toEqual([]);
    expect(second.unchanged).toHaveLength(3);
  });

  it('prunes the pages of a component that was removed', () => {
    const fs = memoryFileSystem();
    generateAgentDocs(fixtureManifest(), config, fs);

    const smaller = fixtureManifest();
    smaller.modules = smaller.modules.filter((m) => !m.path.includes('thing'));
    const report = generateAgentDocs(smaller, config, fs);

    expect(report.pruned).toEqual(['refs/zd-thing.md']);
    expect(fs.files.has('refs/zd-thing.md')).toBe(false);
  });

  it('honours a custom filter hook', () => {
    const fs = memoryFileSystem();
    generateAgentDocs(
      fixtureManifest(),
      { ...config, filter: (c) => c.tagName !== 'zd-thing' },
      fs
    );

    expect(fs.files.has('refs/zd-thing.md')).toBe(false);
    expect(fs.files.get('refs/index.md')).not.toContain('zd-thing');
  });

  it('honours a custom render hook', () => {
    const fs = memoryFileSystem();
    generateAgentDocs(fixtureManifest(), { ...config, render: (c) => `custom ${c.tagName}\n` }, fs);

    expect(fs.files.get('refs/zd-widget.md')).toBe('custom zd-widget\n');
    expect([...fs.files.keys()].sort()).toEqual([
      'refs/index.md',
      'refs/zd-thing.md',
      'refs/zd-widget.md',
    ]);
  });

  it('treats a render hook returning null as a skip', () => {
    const fs = memoryFileSystem();
    generateAgentDocs(
      fixtureManifest(),
      { ...config, render: (c) => (c.tagName === 'zd-thing' ? null : 'x\n') },
      fs
    );

    expect(fs.files.has('refs/zd-thing.md')).toBe(false);
    expect(fs.files.get('refs/index.md')).not.toContain('zd-thing');
  });

  it('passes normalized API and siblings to the render hook', () => {
    const fs = memoryFileSystem();
    let seen: string[] = [];
    generateAgentDocs(
      fixtureManifest(),
      {
        ...config,
        render: (c, ctx) => {
          if (c.tagName === 'zd-widget') {
            seen = ctx.siblings.map((s) => s.tagName ?? '');
            expect(ctx.api.own.props.length).toBeGreaterThan(0);
            expect(ctx.config.packageName).toBe('@powered-by-zocdoc/primitives');
            expect(ctx.resolveType({ type: { text: 'boolean' } })).toBe('boolean');
          }
          return 'x\n';
        },
      },
      fs
    );

    expect(seen).toEqual(['zd-thing', 'zd-widget']);
  });

  it('fails the build naming the component when render throws', () => {
    const fs = memoryFileSystem();
    expect(() =>
      generateAgentDocs(
        fixtureManifest(),
        {
          ...config,
          render: (c) => {
            if (c.tagName === 'zd-widget') throw new Error('boom');
            return 'x\n';
          },
        },
        fs
      )
    ).toThrow(/zd-widget.*boom/s);
  });

  it('throws naming the component when tagName is not a safe basename', () => {
    const fs = memoryFileSystem();
    const manifest: Package = {
      schemaVersion: '2.1.0',
      modules: [
        {
          kind: 'javascript-module',
          path: 'src/components/evil/evil.ts',
          declarations: [{ kind: 'class', name: 'ZdEvil', tagName: 'a/b', customElement: true }],
        },
      ],
    };

    expect(() => generateAgentDocs(manifest, config, fs)).toThrow(/a\/b.*ZdEvil/s);
  });

  it('produces an index reflecting zero components when the filter excludes everything', () => {
    const fs = memoryFileSystem();
    const report = generateAgentDocs(fixtureManifest(), { ...config, filter: () => false }, fs);

    expect([...fs.files.keys()]).toEqual(['refs/index.md']);
    expect(fs.files.get('refs/index.md')).toContain('0 components');
    expect(report.written).toEqual(['refs/index.md']);
  });
});
