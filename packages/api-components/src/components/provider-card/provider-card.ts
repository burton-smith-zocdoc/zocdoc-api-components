import {
  CharmElement,
  ZdAvatar,
  ZdButton,
  ZdCard,
} from '@powered-by-zocdoc/primitives';
import { nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { ProviderLocation } from '../../client/types.js';
import type { TypedEmit, TypedEventTarget } from '../events.js';
import {
  providerHeading,
  providerLocationLine,
  providerPhotoUrl,
} from '../internal/provider-summary.js';
import styles from './provider-card.styles.js';

export interface ProfileRequestDetail {
  provider: ProviderLocation;
}

export interface ZdProviderCardEventMap {
  'profile-request': CustomEvent<ProfileRequestDetail>;
}

/**
 * Displays a provider's photo, name, specialty, location, and insurance status
 * in a horizontal card layout with a slot for availability.
 *
 * @tag zd-provider-card
 * @event profile-request - Emitted with `{ provider }` when the provider's name is clicked.
 * @slot availability - Content to display on the right side (typically zd-availability-grid).
 * @slot badges - Content to display below the insurance line (badges, awards).
 * @csspart photo - The avatar element.
 * @csspart details - The text column.
 * @csspart name - The clickable provider name button.
 * @csspart specialty - The specialty line.
 * @csspart location - The distance and address line.
 * @csspart insurance - The network status line.
 */
export class ZdProviderCard extends CharmElement {
  public static override baseName = 'provider-card';

  declare public addEventListener: TypedEventTarget<ZdProviderCardEventMap>['addEventListener'];
  declare public removeEventListener: TypedEventTarget<ZdProviderCardEventMap>['removeEventListener'];
  declare protected emit: TypedEmit<ZdProviderCardEventMap>;

  public static override styles = [...super.styles, styles] as typeof CharmElement.styles;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdCard, ZdAvatar, ZdButton];
  }

  /** The provider location data to render. */
  @property({ attribute: false })
  public provider?: ProviderLocation;

  /**
   * Renders the provider's photo from CDN. Off by default because the photo
   * comes from an external CDN, not the configured baseUrl (PHI-003 note).
   */
  @property({ type: Boolean, attribute: 'show-photo' })
  public showPhoto = false;

  /**
   * The insurance plan name the search was run with. Enables the network
   * status line when provided.
   */
  @property({ attribute: 'insurance-name' })
  public insuranceName?: string;

  /**
   * The network line, rendered only when the patient named a plan.
   */
  protected renderInsurance(): unknown {
    if (!this.insuranceName || !this.provider) return nothing;

    const acceptance = this.provider.accepts_patient_insurance;
    if (acceptance !== 'accepted' && acceptance !== 'not_accepted') return nothing;

    const status = acceptance === 'accepted' ? 'In-network' : 'Out-of-network';
    return this.html`<span part="insurance">${status} · ${this.insuranceName}</span>`;
  }

  protected override render(): unknown {
    if (!this.provider) return nothing;

    const heading = providerHeading(this.provider);
    const specialty = this.provider.provider.specialties?.[0];
    const location = providerLocationLine(this.provider);

    return this.html`
      <scoped-card>
        <div class="provider-card">
          <div part="details">
            <scoped-button part="name" variant="link">
              ${heading}
            </scoped-button>
            ${specialty ? this.html`<span part="specialty">${specialty}</span>` : nothing}
            ${location ? this.html`<span part="location">${location}</span>` : nothing}
            ${this.renderInsurance()}
            <slot name="badges"></slot>
          </div>
          <slot name="availability"></slot>
        </div>
      </scoped-card>
    `;
  }
}
