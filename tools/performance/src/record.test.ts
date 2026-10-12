import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { recordPerformance } from './record.ts';

const SUMMARY = { count: 20, min: 1, median: 2, p95: 3, max: 4 };

describe('recordPerformance', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'perf-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('creates the file and its directory on first write', async () => {
    const file = join(dir, 'nested', 'primitives.json');
    await recordPerformance(file, 'badge', { mount: SUMMARY });
    expect(JSON.parse(await readFile(file, 'utf8'))).toEqual({ badge: { mount: SUMMARY } });
  });

  it('merges into existing entries rather than replacing them', async () => {
    const file = join(dir, 'primitives.json');
    await recordPerformance(file, 'badge', { mount: SUMMARY });
    await recordPerformance(file, 'button', { mount: SUMMARY });
    expect(Object.keys(JSON.parse(await readFile(file, 'utf8')))).toEqual(['badge', 'button']);
  });

  it('overwrites the entry for a component that runs again', async () => {
    const file = join(dir, 'primitives.json');
    await recordPerformance(file, 'badge', { mount: SUMMARY });
    await recordPerformance(file, 'badge', { rerender: SUMMARY });
    expect(JSON.parse(await readFile(file, 'utf8'))).toEqual({ badge: { rerender: SUMMARY } });
  });

  it('treats an empty file as no results', async () => {
    const file = join(dir, 'primitives.json');
    await writeFile(file, '');
    await recordPerformance(file, 'badge', { mount: SUMMARY });
    expect(JSON.parse(await readFile(file, 'utf8'))).toEqual({ badge: { mount: SUMMARY } });
  });

  it('writes keys sorted so two runs diff cleanly', async () => {
    const file = join(dir, 'primitives.json');
    await recordPerformance(file, 'tabs', { mount: SUMMARY });
    await recordPerformance(file, 'alert', { mount: SUMMARY });
    expect(Object.keys(JSON.parse(await readFile(file, 'utf8')))).toEqual(['alert', 'tabs']);
  });
});
