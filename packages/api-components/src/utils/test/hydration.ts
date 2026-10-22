import { settled, track } from './mount.js';

/**
 * One inline data block, as a server would write it. `<` is escaped so content can't end the
 * script early, which is the escaping a page embedding JSON in HTML has to do.
 */
export function jsonBlock(name: string, value: unknown): string {
  const json = JSON.stringify(value).replaceAll('<', String.raw`\u003c`);
  return `<script type="application/json" data-zd-prop="${name}">${json}</script>`;
}

/** A shadow root's text with whitespace collapsed, for comparing two renders of the same data. */
export function renderedText(element: HTMLElement): string {
  return (element.shadowRoot?.textContent ?? '').replaceAll(/\s+/g, ' ').trim();
}

/**
 * Builds `markup` in a document with no custom elements defined, sets `props` on the element
 * there, then moves it into the page, where it upgrades. That is the order a framework binding
 * can produce: the property is set before the definition has loaded.
 */
export async function mountBeforeUpgrade<T extends HTMLElement>(
  markup: string,
  props: Record<string, unknown>
): Promise<T> {
  const inert = document.implementation.createHTMLDocument('');
  inert.body.innerHTML = markup;
  const element = inert.body.firstElementChild as T;
  Object.assign(element, props);

  document.body.append(track(document.adoptNode(element)));
  await settled(element);
  return element;
}
