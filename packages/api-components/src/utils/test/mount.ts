import { afterEach } from 'vitest';

const mounted: HTMLElement[] = [];

afterEach(() => {
  while (mounted.length) {
    mounted.pop()?.remove();
  }
});

/**
 * Renders a fragment into the document, waits for the first Lit update, and
 * registers it for teardown.
 *
 * The element must be in the document — not a detached container — because
 * `aria-live` announcements and focus management only behave realistically for
 * connected nodes, and both are things these components are tested for.
 */
export async function mount<T extends HTMLElement>(markup: string): Promise<T> {
  const host = document.createElement('div');
  host.innerHTML = markup;
  const element = host.firstElementChild as T;
  document.body.append(track(element));

  await settled(element);
  return element;
}

/**
 * Registers an element for removal after the current test, and returns it so it
 * can be used inline. For the cases `mount()` cannot express — rendering a Lit
 * template rather than a markup string, for instance — so that every test in
 * this package still tears down through one place.
 */
export function track<T extends HTMLElement>(element: T): T {
  mounted.push(element);
  return element;
}

/**
 * Waits for a Lit element to finish its next update cycle. Safe to call on a
 * plain element, where there is no `updateComplete` to await.
 */
export async function settled(element: HTMLElement): Promise<void> {
  await (element as HTMLElement & { updateComplete?: Promise<unknown> }).updateComplete;
}

/**
 * The element's shadow root, or a failure naming the element that has none.
 *
 * Throwing rather than returning `null` is what keeps the call sites readable:
 * every assertion in this package reaches through a shadow root, and an
 * `element.shadowRoot!` on each one hides the case where a component failed to
 * render at all behind a `null is not an object` further down.
 */
export function shadow(element: HTMLElement): ShadowRoot {
  const root = element.shadowRoot;
  if (!root) throw new Error(`${element.localName} rendered no shadow root`);
  return root;
}

/**
 * The one element carrying `part="<name>"`, or a failure naming what was missing.
 *
 * Matches with `~=` because `part` is a space-separated list — `part="section contact"`
 * is one element in two parts, and an exact match would miss it.
 */
export function part<T extends HTMLElement = HTMLElement>(element: HTMLElement, name: string): T {
  const found = queryPart<T>(element, name);
  if (!found) throw new Error(`${element.localName} rendered no [part~="${name}"]`);
  return found;
}

/**
 * `part()` without the throw, for the assertions that are *about* absence —
 * a section that should not render for a provider missing that data.
 */
export function queryPart<T extends HTMLElement = HTMLElement>(
  element: HTMLElement,
  name: string
): T | null {
  return shadow(element).querySelector<T>(`[part~="${name}"]`);
}

/** Every element carrying `part="<name>"`, in render order. */
export function parts<T extends HTMLElement = HTMLElement>(
  element: HTMLElement,
  name: string
): T[] {
  return [...shadow(element).querySelectorAll<T>(`[part~="${name}"]`)];
}

/** The trimmed text of every `part="<name>"`, in render order. */
export function texts(element: HTMLElement, name: string): string[] {
  return parts(element, name).map((node) => node.textContent?.trim() ?? '');
}
