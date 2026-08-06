/**
 * The ZIP codes that drive the search's three outcomes, listed on the page.
 *
 * They are read from the package's own `SCENARIOS` constant rather than typed out here, so the
 * list cannot drift from what the mock actually matches on. They are the documented sandbox
 * sentinels (PHI-002), which is why they work in live mode too — this panel is not mock-only.
 */
import { SCENARIOS } from '@powered-by-zocdoc/api-components/mock';

const ZIP_SCENARIOS: readonly { zip: string; outcome: string }[] = [
  { zip: SCENARIOS.zipWithResults, outcome: 'Providers, with booking requirements' },
  { zip: SCENARIOS.zipEmpty, outcome: 'No matches — the empty state, which is not an error' },
  { zip: SCENARIOS.zipError, outcome: 'A 500 — the error state' },
];

/** Fills in the page's scenario list. Does nothing on a page without one. */
export function renderScenarios(): void {
  const list = document.querySelector('#scenarios');
  if (!list) return;

  for (const { zip, outcome } of ZIP_SCENARIOS) {
    const term = document.createElement('dt');
    term.textContent = zip;

    const description = document.createElement('dd');
    description.textContent = outcome;

    list.append(term, description);
  }
}
