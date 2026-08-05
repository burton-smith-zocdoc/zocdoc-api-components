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
