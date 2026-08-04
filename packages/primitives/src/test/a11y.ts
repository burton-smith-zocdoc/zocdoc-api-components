import axe, { type AxeResults, type Result } from 'axe-core';
import { afterEach, beforeEach, describe } from 'vitest';

export type ColorScheme = 'light' | 'dark';

const SCHEMES: ColorScheme[] = ['light', 'dark'];

/**
 * Configure the document's color scheme for testing.
 *
 * The Zocdoc theme uses `light-dark()` and `prefers-color-scheme` media queries.
 * Setting the `color-scheme` property on the root element forces the computed
 * scheme for both mechanisms.
 */
export function setColorScheme(scheme: ColorScheme): void {
  document.documentElement.style.colorScheme = scheme;
}

/**
 * Test context passed to accessibility test functions.
 */
export interface A11yTestContext {
  container: HTMLElement;
  scheme: ColorScheme;
}

/**
 * Shared context for accessibility tests, populated by beforeEach hooks.
 */
const testContext: { container: HTMLElement | null; scheme: ColorScheme } = {
  container: null,
  scheme: 'light',
};

/**
 * Get the current test container. Throws if called outside a test.
 */
export function getContainer(): HTMLElement {
  if (!testContext.container) {
    throw new Error('getContainer() called outside of describeA11y test context');
  }
  return testContext.container;
}

/**
 * Get the current color scheme being tested.
 */
export function getScheme(): ColorScheme {
  return testContext.scheme;
}

/**
 * Wrap a test suite to run in both light and dark mode with automatic setup/cleanup.
 *
 * Use `getContainer()` inside tests to access the container.
 * Use `describeA11y.skip()` to skip a test suite.
 *
 * @example
 * describeA11y('zd-button', () => {
 *   it('passes axe checks', async () => {
 *     const el = document.createElement('zd-button');
 *     el.textContent = 'Click me';
 *     getContainer().appendChild(el);
 *     await waitForUpdate();
 *     await expectNoViolations();
 *   });
 * });
 */
function describeA11yImpl(
  describeFn: typeof describe,
  name: string,
  fn: () => void
): void {
  describeFn(`${name} accessibility`, () => {
    let cleanup: () => void;

    beforeEach(() => {
      const result = createTestContainer();
      testContext.container = result.container;
      cleanup = result.cleanup;
    });

    afterEach(() => {
      cleanup();
      testContext.container = null;
      setColorScheme('light');
    });

    describe.each(SCHEMES)('%s mode', (scheme) => {
      beforeEach(() => {
        testContext.scheme = scheme;
        setColorScheme(scheme);
      });

      fn();
    });
  });
}

export function describeA11y(name: string, fn: () => void): void {
  describeA11yImpl(describe, name, fn);
}

describeA11y.skip = function (name: string, fn: () => void): void {
  describeA11yImpl(describe.skip, name, fn);
};

/**
 * Page-level rules that don't apply to isolated component testing.
 * These rules check document structure (landmarks, headings) which is the
 * responsibility of the consuming page, not individual components.
 */
const EXCLUDED_RULES = [
  'landmark-one-main',
  'page-has-heading-one',
  'region',
  'bypass',
  'html-has-lang',
];

/**
 * Run axe-core accessibility checks on the current document.
 * Returns only the violations found.
 */
export async function checkAccessibility(): Promise<Result[]> {
  const results: AxeResults = await axe.run(document, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
    },
    rules: Object.fromEntries(EXCLUDED_RULES.map((id) => [id, { enabled: false }])),
  });
  return results.violations;
}

/**
 * Format axe violations for readable test output.
 */
export function formatViolations(violations: Result[]): string {
  if (violations.length === 0) return 'No accessibility violations found';

  return violations
    .map((v) => {
      const nodes = v.nodes
        .map((n) => `  - ${n.html}\n    ${n.failureSummary}`)
        .join('\n');
      return `[${v.impact}] ${v.id}: ${v.description}\n${nodes}`;
    })
    .join('\n\n');
}

/**
 * Assert that a rendered component has no axe violations.
 * Throws with formatted output if violations are found.
 */
export async function expectNoViolations(): Promise<void> {
  const violations = await checkAccessibility();
  if (violations.length > 0) {
    throw new Error(`Accessibility violations:\n\n${formatViolations(violations)}`);
  }
}

/**
 * Create a test container and append it to the document body.
 * Returns a cleanup function that removes the container.
 */
export function createTestContainer(): { container: HTMLElement; cleanup: () => void } {
  const container = document.createElement('div');
  container.id = 'test-container';
  document.body.appendChild(container);

  return {
    container,
    cleanup: () => container.remove(),
  };
}

/**
 * Wait for the component to complete its update cycle.
 * Web components need time to render after being added to the DOM.
 */
export async function waitForUpdate(): Promise<void> {
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => setTimeout(resolve, 0));
}
