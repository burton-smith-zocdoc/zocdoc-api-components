// packages/demo/sites/sync-assets.test.ts
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { syncAssets } from './sync-assets.ts';

test('fails with the build command when the bundle has not been built', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sync-'));
  await assert.rejects(syncAssets({ root, targets: [join(root, 'out')] }), /pnpm build/);
});

test('copies bundle, theme, and fixture images into each target', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sync-'));
  await mkdir(join(root, 'packages/api-components/dist/bundle'), { recursive: true });
  await mkdir(join(root, 'packages/primitives/dist/theme'), { recursive: true });
  await mkdir(join(root, 'static/images'), { recursive: true });
  await writeFile(join(root, 'packages/api-components/dist/bundle/zocdoc.js'), 'js');
  await writeFile(join(root, 'packages/api-components/dist/bundle/zocdoc.js.map'), '{}');
  await writeFile(join(root, 'packages/primitives/dist/theme/all.css'), 'css');
  await writeFile(join(root, 'static/images/a.png'), 'png');

  const target = join(root, 'out');
  await syncAssets({ root, targets: [target] });

  assert.equal(await readFile(join(target, 'zocdoc/zocdoc.js'), 'utf8'), 'js');
  assert.equal(await readFile(join(target, 'zocdoc/all.css'), 'utf8'), 'css');
  assert.equal(await readFile(join(target, 'images/a.png'), 'utf8'), 'png');
});
