// Prints where each Zocdoc package is installed, its version, and whether it ships agent-docs/.
// Usage: node <skill-dir>/scripts/locate.mjs [project-dir]   (defaults to the current directory)
//
// Walks Node's own module lookup path rather than calling require.resolve, because the
// packages' `exports` maps don't expose package.json and resolving it would throw.
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';

const PACKAGES = ['@zocdoc/api-components', '@zocdoc/api-primitive-components'];
const from = resolve(process.argv[2] ?? '.');
const require = createRequire(join(from, 'noop.js'));

for (const name of PACKAGES) {
  const dir = (require.resolve.paths(name) ?? [])
    .map((modules) => join(modules, name))
    .find((candidate) => existsSync(join(candidate, 'package.json')));
  if (!dir) {
    console.log(`${name}: not installed`);
    continue;
  }
  const { version } = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'));
  const docs = existsSync(join(dir, 'agent-docs', 'index.md'))
    ? join(dir, 'agent-docs', 'index.md')
    : 'no agent-docs/ (older version: see the fallback section)';
  console.log(`${name}@${version}\n  dir:  ${dir}\n  docs: ${docs}`);
}
