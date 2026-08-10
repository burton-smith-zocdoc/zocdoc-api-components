import type { Typed } from './types.ts';

const STRING_LITERAL = /^'[^']*'$/;
const NUMBER_LITERAL = /^-?\d+(\.\d+)?$/;
const NULLISH = new Set(['undefined', 'null']);
const BOOLEANISH = new Set(['true', 'false']);

const OPENERS = '{[<(';
const CLOSERS = '}]>)';

/**
 * Split a union at the top level only — never inside `{}`, `[]`, `<>`, `()`, or quotes.
 * A naive `text.split('|')` turns `{ a: 'x' | 'y' }` into two garbage members, and that
 * shape is common enough in this manifest to matter.
 */
export function splitUnion(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let buf = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (quote) {
      buf += char;
      if (char === quote && text[i - 1] !== '\\') quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      buf += char;
      continue;
    }
    if (OPENERS.includes(char)) depth++;
    if (CLOSERS.includes(char)) depth--;
    if (char === '|' && depth === 0) {
      if (buf.trim()) parts.push(buf.trim());
      buf = '';
      continue;
    }
    buf += char;
  }
  if (buf.trim()) parts.push(buf.trim());
  return parts;
}

/** True when every meaningful member is a string or number literal. */
export function isLiteralUnion(text: string): boolean {
  const meaningful = splitUnion(text).filter((member) => !NULLISH.has(member));
  if (meaningful.length === 0) return false;
  // `boolean` expanding to `false | true` is noise, not information.
  if (meaningful.every((member) => BOOLEANISH.has(member))) return false;
  return meaningful.every((member) => STRING_LITERAL.test(member) || NUMBER_LITERAL.test(member));
}

/** Dedupe union members, preserving first-seen order, with nullish members last. */
export function normalizeUnion(text: string): string {
  const members = splitUnion(text);
  if (members.length <= 1) return text.trim();

  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const member of members) {
    if (seen.has(member)) continue;
    seen.add(member);
    ordered.push(member);
  }
  const nullish = ordered.filter((member) => NULLISH.has(member));
  const rest = ordered.filter((member) => !NULLISH.has(member));
  return [...rest, ...nullish].join(' | ');
}

/**
 * Use `parsedType` only when it is a union of string or number literals, and `type.text` is
 * not already a literal union. Otherwise use `type.text`.
 *
 * `parsedType` is better for opaque aliases and actively worse for object types: it collapses
 * index signatures to `{ }` and expands mapped types with the wrong property values. Both are
 * upstream bugs in @wc-toolkit/type-parser; this rule routes around them rather than waiting.
 */
export function resolveType(typed: Typed): string {
  const text = typed.type?.text?.trim() ?? '';
  const parsed = typed.parsedType?.text?.trim();

  if (!text) return 'unknown';
  if (!parsed || parsed === text) return normalizeUnion(text);
  // parsedType would only reorder members, and not into source order.
  if (isLiteralUnion(text)) return normalizeUnion(text);
  if (!isLiteralUnion(parsed)) return normalizeUnion(text);
  return normalizeUnion(parsed);
}
