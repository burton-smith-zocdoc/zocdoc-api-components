import { type Plugin } from '@wc-toolkit/cem-generator';

interface Named {
  name: string;
}

function prefixPart(name: string, prefix: string): string {
  return name.startsWith(`${prefix}-`) ? name : `${prefix}-${name}`;
}

function prefixCustomProp(name: string, prefix: string): string {
  // name is like `--button-bg`; produce `--zd-button-bg`, idempotently.
  if (!name.startsWith('--')) return name;
  const body = name.slice(2);
  return body.startsWith(`${prefix}-`) ? name : `--${prefix}-${body}`;
}

export function cssPrefixPlugin({ prefix }: { prefix: string }): Plugin {
  return {
    name: 'zd-css-prefix',
    // afterGenerate runs last, on the final already-sorted CemPackage; mutate in place,
    // return nothing (no patch-throw risk). See controller ruling in the ledger.
    afterGenerate(manifest): void {
      for (const module of manifest.modules) {
        for (const decl of module.declarations ?? []) {
          // cssParts / cssProperties are optional and may be emitted as null.
          const parts = (decl as { cssParts?: Named[] | null }).cssParts;
          const props = (decl as { cssProperties?: Named[] | null }).cssProperties;
          for (const part of parts ?? []) part.name = prefixPart(part.name, prefix);
          for (const prop of props ?? []) prop.name = prefixCustomProp(prop.name, prefix);
        }
      }
    },
  };
}
