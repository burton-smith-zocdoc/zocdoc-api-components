import {
  CharmElement,
  ZdAvatar,
  ZdButton,
  ZdCard,
  ZdIcon,
  ZdSkeleton,
} from "@zocdoc/api-primitive-components";
import { nothing } from "lit";
import { property } from "lit/decorators.js";
import type { ProviderLocation } from "../../client/types.js";
import type { TypedEmit, TypedEventTarget } from "../events.js";
import {
  providerHeading,
  providerLocationLine,
  providerPhotoUrl,
} from "../../utilities/provider-summary.js";
import styles from "./provider-card.styles.js";

export interface ProfileRequestDetail {
  provider: ProviderLocation;
}

export interface ZdProviderCardEventMap {
  "profile-request": CustomEvent<ProfileRequestDetail>;
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
 * @csspart skeleton - Each placeholder shown while `loading` is set.
 */
export class ZdProviderCard extends CharmElement {
  public static override baseName = "provider-card";

  declare public addEventListener: TypedEventTarget<ZdProviderCardEventMap>["addEventListener"];
  declare public removeEventListener: TypedEventTarget<ZdProviderCardEventMap>["removeEventListener"];
  declare protected emit: TypedEmit<ZdProviderCardEventMap>;

  public static override styles = [
    ...super.styles,
    styles,
  ] as typeof CharmElement.styles;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdCard, ZdAvatar, ZdButton, ZdIcon, ZdSkeleton];
  }

  /**
   * Shows skeleton placeholders in the card's layout instead of `provider`. The card never
   * fetches, so the parent sets this while its own request is in flight and clears it when
   * the data arrives.
   */
  @property({ type: Boolean, reflect: true })
  public loading = false;

  /** The provider location data to render. */
  @property({ attribute: false })
  public provider?: ProviderLocation;

  /**
   * Hides the provider's photo, which otherwise renders from Zocdoc's image CDN
   * (see `ProviderSummaryOptions.hidePhoto`).
   */
  @property({ type: Boolean, attribute: "hide-photo" })
  public hidePhoto = false;

  /**
   * The insurance plan name the search was run with. Enables the network
   * status line when provided.
   */
  @property({ attribute: "insurance-name" })
  public insuranceName?: string;

  /**
   * Derives initials from the provider's name for the avatar fallback.
   */
  protected providerInitials(): string {
    const provider = this.provider?.provider;
    const first = provider?.first_name?.[0] ?? "";
    const last = provider?.last_name?.[0] ?? "";
    return (first + last).toUpperCase() || "?";
  }

  protected renderAvatar(): unknown {
    if (!this.provider) return nothing;

    const photo = this.hidePhoto ? undefined : providerPhotoUrl(this.provider);
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

  /**
   * The network line, rendered only when the patient named a plan.
   */
  protected renderInsurance(): unknown {
    if (!this.insuranceName || !this.provider) return nothing;

    const acceptance = this.provider.accepts_patient_insurance;
    if (acceptance !== "accepted" && acceptance !== "not_accepted")
      return nothing;

    const status = acceptance === "accepted" ? "In-network" : "Out-of-network";
    return this
      .html`<span class="insurance" part="insurance"><scoped-icon name="insurance-accepted"></scoped-icon>${status} · ${this.insuranceName}</span>`;
  }

  protected handleNameClick(): void {
    if (!this.provider) return;
    this.emit("profile-request", { detail: { provider: this.provider } });
  }

  /**
   * Placeholders shaped like the photo, name, specialty, and location lines. No insurance line: it
   * renders only when a plan was chosen and the API knows the network status, so most cards lack it. The skeletons are
   * hidden from assistive technology; the status text in the DOM is what gets announced
   * (A11Y-002, I18N-001). The availability slot stays so a parent can show its own loading grid.
   *
   * No `aria-busy` on the wrapper: the status sits inside it, and some screen readers hold back
   * live-region updates inside a busy element, which would swallow the one announcement made.
   */
  protected renderSkeleton(): unknown {
    return this.html`
      <scoped-card class="wrapper-card">
        <span class="visually-hidden" role="status">Loading provider</span>
        <div class="provider-card">
          <div class="provider-info" aria-hidden="true">
            <div class="provider-profile">
              <scoped-skeleton class="skeleton photo" part="skeleton" shape="circle" animation="wave"></scoped-skeleton>
              <div class="details">
                <scoped-skeleton class="skeleton name" part="skeleton" animation="wave"></scoped-skeleton>
                <scoped-skeleton class="skeleton line" part="skeleton" animation="wave"></scoped-skeleton>
              </div>
            </div>
            <div class="details">
              <scoped-skeleton class="skeleton line wide" part="skeleton" animation="wave"></scoped-skeleton>
            </div>
          </div>
          <slot name="availability"></slot>
        </div>
      </scoped-card>
    `;
  }

  protected override render(): unknown {
    if (this.loading) return this.renderSkeleton();
    if (!this.provider) return nothing;

    const heading = providerHeading(this.provider);
    const specialty = this.provider.provider.specialties?.[0];
    const location = providerLocationLine(this.provider);

    return this.html`
      <scoped-card class="wrapper-card">
        <div class="provider-card">
          <div class="provider-info">
            <div class="provider-profile">
              ${this.renderAvatar()}
              <div class="details" part="details">
                <h3 class="name">
                  <button
                    part="name"
                    variant="link"
                    @click=${() => this.handleNameClick()}
                  >
                    ${heading}
                  </button>
                </h3>
                ${specialty ? this.html`<h4 class="specialty" part="specialty">${specialty}</h4>` : nothing}
              </div>
            </div>
            <div class="details">
              ${location ? this.html`<span class="location" part="location"><scoped-icon name=${this.provider.provider_location_type === 'virtual_provider' ? 'video-filled' : 'location-pin'}></scoped-icon>${location}</span>` : nothing}
              ${this.renderInsurance()}
              <slot name="badges"></slot>
            </div>
          </div>
          <slot name="availability"></slot>
        </div>
      </scoped-card>
    `;
  }
}
