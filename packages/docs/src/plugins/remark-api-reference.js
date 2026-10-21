import fs from 'node:fs';
import { buildCatalog, expandApiReferences } from '../../../../tools/api-reference/src/index.ts';

const MANIFESTS = [
  ['@zocdoc/api-components', '../../../api-components/custom-elements.json'],
  ['@zocdoc/api-primitive-components', '../../../primitives/custom-elements.json'],
];

/**
 * Remark plugin that expands an `api-reference` fence into the tag's generated API tables:
 *
 *   ```api-reference
 *   zd-booking
 *   ```
 *
 * The tables come from each package's `custom-elements.json`, so run `pnpm cem` after changing
 * a component's JSDoc. Manifests are read per page, so `astro dev` picks up a regenerated one.
 */
export function remarkApiReference() {
  return (tree) => {
    const catalog = buildCatalog(
      MANIFESTS.map(([packageName, path]) => ({
        packageName,
        manifest: JSON.parse(fs.readFileSync(new URL(path, import.meta.url), 'utf-8')),
      }))
    );
    expandApiReferences(tree, catalog);
  };
}

export default remarkApiReference;
