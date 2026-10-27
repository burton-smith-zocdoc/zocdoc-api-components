/** What a markup-supplied property must parse to: a list (`providers`) or a record (`location`). */
export type HydrationShape = 'array' | 'object';

/** Direct children only: a block inside a nested component belongs to that component. */
const BLOCKS = ':scope > script[type="application/json"][data-zd-prop]';

function hasShape(value: unknown, shape: HydrationShape): boolean {
  return shape === 'array'
    ? Array.isArray(value)
    : typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * The properties a page supplied as inline JSON blocks, the markup half of supplied-data mode:
 *
 * ```html
 * <zd-provider-results>
 *   <script type="application/json" data-zd-prop="providers">[…]</script>
 * </zd-provider-results>
 * ```
 *
 * Only names on `allowed` are read, so markup can't set a property the component never offered
 * to it. That allow-list is also what keeps patient data out: components handling PHI pass no
 * names and never call this.
 *
 * A block is parsed with `JSON.parse` and nothing else, so its content is never markup or script.
 * A block that doesn't parse, or parses to the wrong shape, is skipped so the component falls back
 * to fetching. Its warning names the element and the property, never the content, which may be
 * provider or patient data (PHI-001).
 *
 * The first block for a name wins; later duplicates are ignored.
 */
export function readHydratedProps(
  host: HTMLElement,
  allowed: Readonly<Record<string, HydrationShape>>
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const script of host.querySelectorAll<HTMLScriptElement>(BLOCKS)) {
    const name = script.dataset.zdProp ?? '';
    if (!Object.hasOwn(allowed, name) || Object.hasOwn(values, name)) continue;

    let value: unknown;
    try {
      value = JSON.parse(script.textContent ?? '');
    } catch {
      // oxlint-disable-next-line no-console -- the page author's only signal that markup was ignored; names, never content
      console.warn(`${host.localName}: ignored the "${name}" data block, which is not valid JSON`);
      continue;
    }
    if (!hasShape(value, allowed[name])) {
      // oxlint-disable-next-line no-console -- the page author's only signal that markup was ignored; names, never content
      console.warn(
        `${host.localName}: ignored the "${name}" data block, which is not an ${allowed[name]}`
      );
      continue;
    }
    values[name] = value;
  }
  return values;
}

/**
 * Assigns markup-supplied values to the host, leaving any property already set alone: a value set
 * by script is the host page's choice, and markup is only the default.
 *
 * Returns whether anything was applied, which is what puts a component in handoff mode.
 */
export function applyHydratedProps(host: HTMLElement, values: Record<string, unknown>): boolean {
  const target = host as unknown as Record<string, unknown>;
  let applied = false;
  for (const [name, value] of Object.entries(values)) {
    if (target[name] !== undefined) continue;
    target[name] = value;
    applied = true;
  }
  return applied;
}

/**
 * Reads a component's allow-listed blocks and applies them, returning whether any were applied.
 *
 * Call it from the first `willUpdate` (`!this.hasUpdated`), before anything reads the properties.
 * `connectedCallback` is too early: Lit restores a property set before the element upgraded only
 * when the first update starts, so until then that property looks unset and the block would
 * appear to have been applied. In `willUpdate` the values land in the same update and show up in
 * its changed properties, so a component reacts to them as it would to a property set by script.
 */
export function hydrateFromMarkup(
  host: HTMLElement,
  allowed: Readonly<Record<string, HydrationShape>>
): boolean {
  return applyHydratedProps(host, readHydratedProps(host, allowed));
}

/**
 * Runs a component's first update once the document has finished parsing; later updates run at once.
 *
 * A component defined by a classic script in `<head>` upgrades as soon as the parser reaches its
 * start tag, before its JSON blocks exist, so a first update then would find none. Call it from
 * `scheduleUpdate`: `return afterDocumentParsed(this, () => super.scheduleUpdate());`
 */
export function afterDocumentParsed<T>(
  host: { readonly hasUpdated: boolean },
  update: () => T
): T | Promise<T> {
  if (host.hasUpdated || document.readyState !== 'loading') return update();
  return new Promise<void>((resolve) => {
    document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
  }).then(update);
}
