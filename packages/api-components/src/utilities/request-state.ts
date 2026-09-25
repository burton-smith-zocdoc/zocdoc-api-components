import { ZdAlert, ZdButton, ZdSpinner, type CharmElement } from '@zocdoc/api-primitive-components';
import { html, nothing, type TemplateResult } from 'lit';

/**
 * The primitives `renderRequestState` renders. Every component that calls it has
 * to spread these into its own `dependencies()` (PBZD-001), because a template
 * alone does not register a custom element — the tags would stay inert.
 *
 * Living next to the template is the point: adding a primitive below means
 * adding it here, so a component cannot silently miss one.
 */
export const requestStateDependencies: (typeof CharmElement)[] = [ZdAlert, ZdButton, ZdSpinner];

/**
 * The five states every fetching component moves through (COMP-001). `empty` is
 * a successful request that found nothing — routine, and deliberately distinct
 * from `error`, which means the request itself failed.
 */
export type RequestState = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface RequestStateOptions {
  /** Shown in the error state. Defaults to a generic message (CLIENT-003 — never surface a raw API error). */
  errorMessage?: string;
  /** Shown in the empty state. An empty result is routine, not a failure. */
  emptyMessage: string;
  /** Announced while loading. */
  loadingMessage?: string;
  onRetry: () => void;
  children: () => unknown;
}

/**
 * Single rendering of the five request states, shared by every fetching
 * component so their loading, empty, and error affordances stay identical.
 *
 * Exposes `status`, `loading`, `loading-message`, `empty`, `error`, and `retry`
 * as CSS parts of whichever component calls it, so consumers get one vocabulary
 * across all of them.
 *
 * Two things worth knowing before editing:
 *
 * - **The polite region stays mounted in every state, including idle** (A11Y-002),
 *   so a screen reader is already observing it before the first transition into
 *   loading. A live region inserted at the same moment as its content is
 *   routinely missed entirely. The error region is the deliberate exception: it
 *   mounts only when it has something to say, because a closed alert would leave
 *   the retry button focusable inside a hidden subtree, and `role="alert"` is
 *   announced on insertion anyway.
 * - **`variant` and `politeness` are separate concerns.** `variant="danger"` is
 *   what makes a failed request look like a failure rather than like ordinary
 *   content; `politeness="assertive"` is what makes it interrupt. The error state
 *   wants both, and neither implies the other.
 * - **Tag names are hard-coded** rather than resolved through `scope.tag()`
 *   (PBZD-003), so this helper only works under the default `zd` prefix. Revisit
 *   when a second scope suffix is needed: the fix is to take a scope and switch
 *   to `lit/static-html.js`, since `CharmScope.tag()` returns a `StaticValue` for
 *   exactly that purpose.
 */
export function renderRequestState(
  state: RequestState,
  options: RequestStateOptions
): TemplateResult {
  return html`
    <div part="status" role="status" aria-live="polite" aria-atomic="true">
      ${
        state === 'loading'
          ? html`
              <zd-spinner part="loading" aria-hidden="true"></zd-spinner>
              <span part="loading-message">${options.loadingMessage ?? 'Loading…'}</span>
            `
          : nothing
      }
      ${state === 'empty' ? html`<p part="empty">${options.emptyMessage}</p>` : nothing}
    </div>
    ${
      state === 'error'
        ? html`
            <zd-alert part="error" variant="danger" politeness="assertive" open>
              ${options.errorMessage ?? 'Something went wrong.'}
              <zd-button
                part="retry"
                slot="action"
                variant="secondary"
                size="small"
                @click=${options.onRetry}
              >
                Try again
              </zd-button>
            </zd-alert>
          `
        : nothing
    }
    ${state === 'success' ? options.children() : nothing}
  `;
}
