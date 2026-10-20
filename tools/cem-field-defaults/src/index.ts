import { type Plugin } from '@wc-toolkit/cem-generator';
import ts from 'typescript';

/**
 * A field initializer as a documented default, or nothing when it isn't a value a reader can use.
 *
 * Literals are written as-is. A named constant (`pageSize = DEFAULT_PAGE_SIZE`) is resolved through
 * the checker when its type is a single literal, so the docs say `10` rather than an identifier the
 * reader can't see. Anything computed (`new Date()`, `[]` built from another field) is left out:
 * a default the docs can't state exactly is better unstated than paraphrased.
 */
function defaultText(initializer: ts.Expression, checker: ts.TypeChecker): string | undefined {
  if (ts.isStringLiteral(initializer) || ts.isNoSubstitutionTemplateLiteral(initializer)) {
    return `'${initializer.text}'`;
  }
  if (
    ts.isNumericLiteral(initializer) ||
    initializer.kind === ts.SyntaxKind.TrueKeyword ||
    initializer.kind === ts.SyntaxKind.FalseKeyword ||
    initializer.kind === ts.SyntaxKind.NullKeyword
  ) {
    return initializer.getText();
  }
  if (ts.isIdentifier(initializer) && initializer.text !== 'undefined') {
    const type = checker.getTypeAtLocation(initializer);
    if (type.isStringLiteral()) return `'${type.value}'`;
    if (type.isNumberLiteral()) return String(type.value);
  }
  return undefined;
}

/**
 * Restores field defaults the Lit detector drops.
 *
 * `litPlugin` builds decorated fields (`@property() modal = false`) itself and takes `default` only
 * from a JSDoc `@default` tag, so every decorated property reaches the manifest without one — and
 * every generated reference says `—` where the source plainly says `false`. Reading the initializer
 * keeps the source the one place a default is written.
 *
 * An explicit `@default` still wins: the detector's value is kept wherever it set one.
 */
export function fieldDefaultsPlugin(): Plugin {
  const byClass = new Map<string, Map<string, string>>();

  return {
    name: 'zd-field-defaults',
    onFile(context): Record<string, never> {
      for (const statement of context.sourceFile.statements) {
        if (!ts.isClassDeclaration(statement) || !statement.name) continue;
        const defaults = new Map<string, string>();
        for (const member of statement.members) {
          if (!ts.isPropertyDeclaration(member) || !member.initializer) continue;
          const text = defaultText(member.initializer, context.checker);
          if (text !== undefined) defaults.set(member.name.getText(), text);
        }
        if (defaults.size) byClass.set(statement.name.text, defaults);
      }
      // Applied after generation, so it lands on the merged member rather than racing the detector.
      return {};
    },
    afterGenerate(manifest): void {
      for (const module of manifest.modules) {
        for (const declaration of module.declarations ?? []) {
          const defaults = byClass.get(declaration.name);
          if (!defaults || !('members' in declaration)) continue;
          for (const member of declaration.members ?? []) {
            if (member.kind !== 'field' || member.default !== undefined) continue;
            const text = defaults.get(member.name);
            if (text !== undefined) member.default = text;
          }
          // Attributes are documented separately from the fields they reflect.
          for (const attribute of ('attributes' in declaration && declaration.attributes) || []) {
            const field = attribute.fieldName ?? attribute.name;
            const text = defaults.get(field);
            if (attribute.default === undefined && text !== undefined) attribute.default = text;
          }
        }
      }
    },
  };
}
