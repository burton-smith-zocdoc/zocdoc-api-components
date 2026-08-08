/**
 * Copy shared by more than one component.
 *
 * Only text that two components can both put on screen belongs here. A message with one caller
 * stays at that caller, where it is read alongside the state that produces it.
 */

/**
 * The empty state for a search that ran and matched nothing — distinct from an error, which is
 * a search that did not run (COMP-001).
 *
 * Shared by `zd-provider-search` and `zd-provider-results` because either can own the empty
 * state: the search renders it when it holds the request state, the list when it stands alone.
 * Which one speaks depends on how the host wired them, so the sentence has to be the same.
 */
export const NO_PROVIDERS_MATCH = 'No providers match this search.';
