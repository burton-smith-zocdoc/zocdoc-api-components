// packages/demo/sites/sync-assets.ts
/**
 * Copies the built library into the two server-rendered demo sites.
 *
 * The ASP.NET and PHP sites deliberately know nothing about the monorepo: they serve two files
 * and a folder of fixture photos, exactly what a partner on those stacks would download. This
 * script is the "download" step. It copies whatever is in `dist`, so it refuses to run against a
 * missing build rather than leaving a page whose script tag 404s.
 */
import { access, cp, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(HERE, '../../..');

const BUILD_HINT =
  'Build the library first: `pnpm build && pnpm --filter @zocdoc/api-components build:bundle`.';

export interface SyncOptions {
  root?: string;
  targets?: string[];
}

export async function syncAssets({
  root = DEFAULT_ROOT,
  targets = [join(HERE, 'synergy-partners/wwwroot'), join(HERE, 'toe-truck/public')],
}: SyncOptions = {}): Promise<void> {
  const files = {
    'zocdoc/zocdoc.js': join(root, 'packages/api-components/dist/bundle/zocdoc.js'),
    'zocdoc/zocdoc.js.map': join(root, 'packages/api-components/dist/bundle/zocdoc.js.map'),
    'zocdoc/all.css': join(root, 'packages/primitives/dist/theme/all.css'),
  };
  const images = join(root, 'static/images');

  for (const source of [...Object.values(files), images]) {
    try {
      await access(source);
    } catch {
      throw new Error(`Missing ${source}. ${BUILD_HINT}`);
    }
  }

  for (const target of targets) {
    for (const [name, source] of Object.entries(files)) {
      const destination = join(target, name);
      await mkdir(dirname(destination), { recursive: true });
      await cp(source, destination);
    }
    await cp(images, join(target, 'images'), { recursive: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await syncAssets();
  } catch (error) {
    // A build hint, not data — safe to print.
    process.stderr.write(`${(error as Error).message}\n`);
    process.exit(1);
  }
}
