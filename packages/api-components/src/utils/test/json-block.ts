/**
 * One inline data block, as a server would write it. `<` is escaped so content can't end the
 * script early, which is the escaping a page embedding JSON in HTML has to do.
 *
 * Its own module, with no imports, so stories can use it: `hydration.ts` imports vitest, which a
 * story can't load.
 */
export function jsonBlock(name: string, value: unknown): string {
  const json = JSON.stringify(value).replaceAll('<', String.raw`\u003c`);
  return `<script type="application/json" data-zd-prop="${name}">${json}</script>`;
}
