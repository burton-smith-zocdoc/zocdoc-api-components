import { type Plugin } from '@wc-toolkit/cem-generator';

interface Named {
  name: string;
}

function prefixCustomProp(name: string, prefix: string): string {
  // name is like `--button-bg`; produce `--zd-button-bg`, idempotently.
  if (!name.startsWith('--')) return name;
  const body = name.slice(2);
  return body.startsWith(`${prefix}-`) ? name : `--${prefix}-${body}`;
}

/**
 * Gives every documented CSS custom property the theme's prefix, which is the name it has at
 * runtime (`--button-bg` in a `@cssprop` tag is emitted as `--zd-button-bg`).
 *
 * Part names are deliberately left alone: a template's `part="search"` is what `::part()` has to
 * match, and the prefix applies to tags and variables, never to parts. The one thing removed is
 * an interpolation the template scan reads as a name (`part="section ${name}"` yields `${name}`);
 * the parts it stands for are documented with `@csspart` instead.
 */
export function cssPrefixPlugin({ prefix }: { prefix: string }): Plugin {
  return {
    name: 'zd-css-prefix',
    // afterGenerate runs last, on the final already-sorted CemPackage; mutate in place,
    // return nothing (no patch-throw risk). See controller ruling in the ledger.
    afterGenerate(manifest): void {
      for (const module of manifest.modules) {
        for (const decl of module.declarations ?? []) {
          // cssProperties is optional and may be emitted as null.
          const props = (decl as { cssProperties?: Named[] | null }).cssProperties;
          for (const prop of props ?? []) prop.name = prefixCustomProp(prop.name, prefix);
          const parts = (decl as { cssParts?: Named[] | null }).cssParts;
          if (parts) {
            (decl as { cssParts?: Named[] }).cssParts = parts.filter((p) => !p.name.includes('${'));
          }
        }
      }
    },
  };
}
