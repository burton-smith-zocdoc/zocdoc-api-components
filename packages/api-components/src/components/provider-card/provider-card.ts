import {
  CharmElement,
  ZdAvatar,
  ZdButton,
  ZdCard,
  ZdIcon,
  ZdSkeleton,
} from '@zocdoc/api-primitive-components';
import { nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { ProviderLocation } from '../../client/types.js';
import { handoffHref } from '../../utilities/handoff.js';
import {
  afterDocumentParsed,
  hydrateFromMarkup,
  type HydrationShape,
} from '../../utilities/hydrate.js';
import type { TypedEmit, TypedEventTarget } from '../events.js';
import {
  providerHeading,
  providerLocationLine,
  providerPhotoUrl,
} from '../../utilities/provider-summary.js';
import styles from './provider-card.styles.js';

export interface ProfileRequestDetail {
  provider: ProviderLocation;
}

/** The provider the patient chose "Book now" for. */
export interface BookSelectDetail {
  provider: ProviderLocation;
}

/** The annotation slots, in the order they render: after the specialty, before the badges. */
const ANNOTATION_SLOTS = ['reason', 'review', 'sponsored'] as const;

export interface ZdProviderCardEventMap {
  'profile-request': CustomEvent<ProfileRequestDetail>;
  'book-select': CustomEvent<BookSelectDetail>;
}

/**
 * Displays a provider's photo, name, specialty, location, and insurance status
 * in a horizontal card layout with a slot for availability.
 *
 * **Handoff.** A card whose provider came from a JSON block, or that `zd-provider-results` marks
 * with `handoff`, shows a "Book now" link to the provider's Zocdoc profile when it has no times
 * of its own to tap. It needs a `profile_url` on Zocdoc over `https:`; without one there is no
 * link. `disable-handoff` turns it off. Outside handoff mode, `selectable` shows "Book now" as a
 * button that only emits `book-select`.
 *
 * @tag zd-provider-card
 * @event profile-request - Emitted with `{ provider }` when the provider's name is clicked.
 * @event book-select - Emitted with `{ provider }` when "Book now" is chosen. Cancelable: in
 *   handoff mode, `preventDefault()` keeps the patient on the page.
 * @slot availability - Content to display on the right side (typically zd-availability-grid).
 * @slot reason - One line on why this provider fits the search, shown below the specialty.
 * @slot review - A verified review snippet, shown below the reason.
 * @slot sponsored - The label for a paid placement, shown below the review.
 * @slot badges - Content to display below the insurance line (badges, awards).
 * @csspart photo - The avatar element.
 * @csspart details - The text column.
 * @csspart name - The clickable provider name button.
 * @csspart specialty - The specialty line.
 * @csspart location - The distance and address line.
 * @csspart insurance - The network status line.
 * @csspart book - The "Book now" control: a link in handoff mode, a button with `selectable`.
 * @csspart reason - The `reason` slot. It has no box, so style the text it inherits.
 * @csspart review - The `review` slot. It has no box, so style the text it inherits.
 * @csspart sponsored - The `sponsored` slot. It has no box, so style the text it inherits.
 * @csspart skeleton - Each placeholder shown while `loading` is set.
 */
export class ZdProviderCard extends CharmElement {
  public static override baseName = 'provider-card';

  declare public addEventListener: TypedEventTarget<ZdProviderCardEventMap>['addEventListener'];
  declare public removeEventListener: TypedEventTarget<ZdProviderCardEventMap>['removeEventListener'];
  declare protected emit: TypedEmit<ZdProviderCardEventMap>;

  public static override styles = [...super.styles, styles] as typeof CharmElement.styles;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdCard, ZdAvatar, ZdButton, ZdIcon, ZdSkeleton];
  }

  /** The properties a page can supply as JSON blocks, and their shapes (see `utilities/hydrate.ts`). */
  public static hydratable: Readonly<Record<string, HydrationShape>> = { provider: 'object' };

  /** Whether any property came from a JSON block, read on the first update. */
  protected hydrated = false;

  protected override scheduleUpdate(): void | Promise<unknown> {
    return afterDocumentParsed(this, () => super.scheduleUpdate());
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (!this.hasUpdated) this.hydrated = hydrateFromMarkup(this, ZdProviderCard.hydratable);
    super.willUpdate(changed);
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
  @property({ type: Boolean, attribute: 'hide-photo' })
  public hidePhoto = false;

  /**
   * The insurance plan name the search was run with. Enables the network
   * status line when provided.
   */
  @property({ attribute: 'insurance-name' })
  public insuranceName?: string;

  /**
   * Puts the card in handoff mode as if its provider had come from a JSON block. Set by
   * `zd-provider-results` on the cards of a hydrated list, which only ever show day counts, so the
   * card shows "Book now" even with availability slotted in.
   */
  @property({ attribute: false })
  public handoff = false;

  /**
   * Shows "Book now" as a button that only emits `book-select`, for a parent that books on the
   * page. Set by `zd-provider-results` on the cards of a list that isn't in handoff mode.
   */
  @property({ type: Boolean })
  public selectable = false;

  /** Stops a card in handoff mode from showing "Book now". */
  @property({ type: Boolean, attribute: 'disable-handoff' })
  public disableHandoff = false;

  /** Whether the `availability` slot has content: times of its own to tap instead of "Book now". */
  @state() protected hasAvailability = false;

  /** Whether "Book now" can show: data from markup or a hydrated parent, and not opted out. */
  protected get handingOff(): boolean {
    return (this.hydrated || this.handoff) && !this.disableHandoff;
  }

  /** Where "Book now" goes, or `undefined` when it shouldn't render. */
  protected get bookHref(): string | undefined {
    if (!this.handingOff) return undefined;
    // A card with times of its own lets the patient tap one of those instead.
    if (!this.handoff && this.hasAvailability) return undefined;
    return handoffHref(this.provider?.provider.profile_url, 'provider-card');
  }

  /**
   * Emits `book-select`. As a link, a listener that cancels it keeps the patient on the page;
   * otherwise the browser follows the link itself.
   */
  protected handleBookClick(event: MouseEvent, isLink: boolean): void {
    // Charm's `click()` on a link button fires on the host and then again on its inner `<a>`. Only
    // the `<a>` one is the tap, which is all a pointer or the keyboard ever produces.
    if ((isLink && event.composedPath()[0] === event.currentTarget) || !this.provider) return;

    const selected = this.emit('book-select', {
      detail: { provider: this.provider },
      cancelable: true,
    });
    if (selected.defaultPrevented) event.preventDefault();
  }

  /**
   * A real link, so the patient can see where it goes, open it in a new tab, or copy it. Inside
   * an iframe it opens a new tab rather than loading Zocdoc in the frame. The provider's name is
   * in the link text for screen readers, since a list has a "Book now" on every card (WCAG 2.4.4).
   */
  protected renderBook(): unknown {
    const href = this.bookHref;
    if (!this.provider || (!href && !this.selectable)) return nothing;

    return this.html`
      <scoped-button
        class="book"
        part="book"
        variant="primary"
        href=${href ?? nothing}
        target=${href && window.self !== window.top ? '_blank' : nothing}
        @click=${(event: MouseEvent) => this.handleBookClick(event, href !== undefined)}
      >
        Book now<span class="visually-hidden"> with ${providerHeading(this.provider)}</span>
      </scoped-button>
    `;
  }

  protected handleAvailabilityChange(event: Event): void {
    this.hasAvailability =
      (event.target as HTMLSlotElement).assignedNodes({ flatten: true }).length > 0;
  }

  /**
   * A `<slot>` has no box of its own, so an empty one leaves no gap in the column, and the text it
   * holds inherits the styles set on it.
   */
  protected renderAnnotations(): unknown {
    return ANNOTATION_SLOTS.map(
      (name) => this.html`<slot class="annotation ${name}" part=${name} name=${name}></slot>`
    );
  }

  /**
   * Derives initials from the provider's name for the avatar fallback.
   */
  protected providerInitials(): string {
    const provider = this.provider?.provider;
    const first = provider?.first_name?.[0] ?? '';
    const last = provider?.last_name?.[0] ?? '';
    return (first + last).toUpperCase() || '?';
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
    if (acceptance !== 'accepted' && acceptance !== 'not_accepted') return nothing;

    const status = acceptance === 'accepted' ? 'In-network' : 'Out-of-network';
    return this
      .html`<span class="insurance" part="insurance"><scoped-icon name="insurance-accepted"></scoped-icon>${status} · ${this.insuranceName}</span>`;
  }

  protected handleNameClick(): void {
    if (!this.provider) return;
    this.emit('profile-request', { detail: { provider: this.provider } });
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
                ${this.renderAnnotations()}
              </div>
            </div>
            <div class="details">
              ${location ? this.html`<span class="location" part="location"><scoped-icon name=${this.provider.provider_location_type === 'virtual_provider' ? 'video-filled' : 'location-pin'}></scoped-icon>${location}</span>` : nothing}
              ${this.renderInsurance()}
              <slot name="badges"></slot>
              ${this.renderBook()}
            </div>
          </div>
          <slot name="availability" @slotchange=${(event: Event) => this.handleAvailabilityChange(event)}></slot>
        </div>
      </scoped-card>
    `;
  }
}
