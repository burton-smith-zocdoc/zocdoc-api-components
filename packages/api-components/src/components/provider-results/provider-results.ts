import { CharmElement, ZdCard } from '@powered-by-zocdoc/primitives';
import { nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { ProviderLocation } from '../../client/types.js';
import { providerDisplayName } from '../internal/provider-name.js';
import styles from './provider-results.styles.js';

/**
 * Renders a list of provider locations and emits the one the user picks.
 * Purely presentational — it performs no network requests, and it works on its
 * own with nothing above it (COMP-004).
 *
 * @tag zd-provider-results
 * @event provider-select - Emitted with `{ provider }` when a provider is chosen.
 * @csspart list - The list wrapper.
 * @csspart provider - The selectable control for one provider.
 * @csspart provider-name - The provider's display name.
 * @csspart provider-specialty - The provider's primary specialty.
 * @csspart empty - The message shown when there are no providers.
 */
export class ZdProviderResults extends CharmElement {
  public static override baseName = 'provider-results';

  public static override styles = [...super.styles, styles] as typeof CharmElement.styles;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdCard];
  }

  /** The provider locations to display. */
  @property({ attribute: false })
  public providers: ProviderLocation[] = [];

  /** The currently selected `provider_location_id`, if any. */
  @property({ type: String, attribute: 'selected-id' })
  public selectedId?: string;

  /**
   * Announced when the list is empty. A parent that owns a request-state machine
   * renders its own empty message instead of this component, so in practice only
   * the standalone case reaches here.
   */
  protected renderEmpty(): unknown {
    return this.html`<p part="empty" role="status">No providers match this search.</p>`;
  }

  protected override render(): unknown {
    if (this.providers.length === 0) {
      return this.renderEmpty();
    }

    return this.html`
      <ul part="list">
        ${this.providers.map((location) => {
          const specialty = location.provider.specialties?.[0];
          return this.html`
            <li>
              <scoped-card>
                <button
                  part="provider"
                  type="button"
                  aria-current=${location.provider_location_id === this.selectedId ? 'true' : nothing}
                  @click=${() => this.select(location)}
                >
                  <span part="provider-name">${providerDisplayName(location)}</span>
                  ${specialty ? this.html`<span part="provider-specialty">${specialty}</span>` : nothing}
                </button>
              </scoped-card>
            </li>
          `;
        })}
      </ul>
    `;
  }

  /**
   * A native `<button>` handles Enter and Space itself, so there is deliberately
   * no keydown handler here — adding one would double-fire.
   */
  protected select(location: ProviderLocation): void {
    this.selectedId = location.provider_location_id;
    this.emit('provider-select', { detail: { provider: location } });
  }
}
