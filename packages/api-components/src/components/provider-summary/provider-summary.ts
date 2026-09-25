import { CharmElement, ZdAvatar, ZdIcon } from '@zocdoc/api-primitive-components';
import { nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { ProviderLocation } from '../../client/types.js';
import {
  providerHeading,
  providerLocationLine,
  providerPhotoUrl,
} from '../../utilities/provider-summary.js';
import styles from './provider-summary.styles.js';

/**
 * Displays a provider's photo, name, specialty, location, and insurance status
 * in a compact summary layout. Used by provider-card and booking.
 *
 * @tag zd-provider-summary
 * @csspart photo - The avatar element.
 * @csspart name - The provider name and credential.
 * @csspart specialty - The specialty line.
 * @csspart location - The distance and address line.
 * @csspart insurance - The network status line.
 */
export class ZdProviderSummary extends CharmElement {
  public static override baseName = 'provider-summary';

  public static override styles = [
    ...super.styles,
    styles,
  ] as typeof CharmElement.styles;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdAvatar, ZdIcon];
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

  protected providerInitials(): string {
    const provider = this.provider?.provider;
    const first = provider?.first_name?.[0] ?? '';
    const last = provider?.last_name?.[0] ?? '';
    return (first + last).toUpperCase() || '?';
  }

  protected renderAvatar(): unknown {
    if (!this.provider) return nothing;

    const photo = this.showPhoto ? providerPhotoUrl(this.provider) : undefined;
    const label = providerHeading(this.provider);
    const initials = this.providerInitials();

    return this.html`
      <scoped-avatar
        part="photo"
        .image=${photo ?? nothing}
        initials=${initials}
        label=${label}
      ></scoped-avatar>
    `;
  }

  protected renderInsurance(): unknown {
    if (!this.insuranceName || !this.provider) return nothing;

    const acceptance = this.provider.accepts_patient_insurance;
    if (acceptance !== 'accepted' && acceptance !== 'not_accepted') return nothing;

    const status = acceptance === 'accepted' ? 'In-network' : 'Out-of-network';
    return this.html`
      <span class="insurance" part="insurance">
        <scoped-icon name="insurance-accepted"></scoped-icon>
        ${status} · ${this.insuranceName}
      </span>
    `;
  }

  protected override render(): unknown {
    if (!this.provider) return nothing;

    const heading = providerHeading(this.provider);
    const specialty = this.provider.provider.specialties?.[0];
    const location = providerLocationLine(this.provider);

    return this.html`
      ${this.renderAvatar()}
      <div class="details" part="details">
        <span class="name" part="name">${heading}</span>
        ${specialty ? this.html`<span class="specialty" part="specialty">${specialty}</span>` : nothing}
        ${location ? this.html`
          <span class="location" part="location">
            <scoped-icon name="location-pin"></scoped-icon>
            ${location}
          </span>
        ` : nothing}
        ${this.renderInsurance()}
      </div>
    `;
  }
}
