import axe, { type Result } from 'axe-core';

/**
 * Page-level rules that do not apply to a component tested in isolation. They check
 * document structure — landmarks, a single `h1`, a `lang` attribute — which belongs to the
 * page embedding these components, not to the components themselves. Leaving them on would
 * make every test fail for reasons no component change could fix.
 */
const EXCLUDED_RULES = [
  'landmark-one-main',
  'page-has-heading-one',
  'region',
  'bypass',
  'html-has-lang',
];

let schemeStyleElement: HTMLStyleElement | null = null;

/**
 * Forces `light-dark()` to resolve as light mode document-wide.
 *
 * Every theme colour is a `light-dark()` pair under `:root { color-scheme: light dark }`, so
 * unpinned it resolves against whatever the headless browser prefers. That produced a real
 * failure and a false one at the same time: axe read the alert's text as near-white (the
 * dark-scheme token) while treating the page canvas as its default white, and reported 1.01:1
 * contrast on markup that is fine in either scheme on its own. The three engines even
 * disagreed on the exact near-white, which is the tell that nothing about the component was
 * being measured.
 *
 * Setting `colorScheme` on an individual element is not strong enough — the theme's
 * `color-scheme: light dark` on `:root` wins, and the cascade into nested shadow DOMs is
 * unreliable. We override at `:root` with `!important` and `only` to force light mode
 * unambiguously. Matches the approach in the primitives a11y harness.
 */
function pinColorScheme(): void {
  if (!schemeStyleElement) {
    schemeStyleElement = document.createElement('style');
    schemeStyleElement.id = 'test-color-scheme-pin';
    document.head.appendChild(schemeStyleElement);
  }
  schemeStyleElement.textContent = ':root { color-scheme: light only !important; }';
}

function format(violations: Result[]): string {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => `  - ${node.html}\n    ${node.failureSummary}`)
        .join('\n');
      return `[${violation.impact}] ${violation.id}: ${violation.description}\n${nodes}`;
    })
    .join('\n\n');
}

/**
 * Asserts that a rendered component has no axe violations, as A11Y-001 and A11Y-005
 * require. Scoped to the element rather than the document, so one component's markup
 * cannot be blamed for another's — several are mounted at once in the composition tests.
 *
 * The `requestAnimationFrame` wait is not superstition: axe reads computed styles, and the
 * theme resolves colors through `light-dark()` inside shadow roots, which browsers have not
 * finished computing on the tick a Lit update completes.
 *
 * Both schemes are checked in `primitives`, against the tokens themselves. Repeating that
 * per component here would only re-test the same tokens, so this pins one scheme instead —
 * see `pinColorScheme` for why leaving it unpinned reports contrast failures that are not
 * real.
 */
export async function expectNoViolations(element: Element): Promise<void> {
  pinColorScheme();

  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => setTimeout(resolve, 50));

  const { violations } = await axe.run(element, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
    },
    rules: Object.fromEntries(EXCLUDED_RULES.map((id) => [id, { enabled: false }])),
  });

  if (violations.length > 0) {
    throw new Error(`Accessibility violations:\n\n${format(violations)}`);
  }
}
